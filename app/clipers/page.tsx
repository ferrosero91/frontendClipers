"use client"

import { useEffect, useState, useRef } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { UploadCliperModal } from "@/components/clipers/upload-cliper-modal"
import { useCliperStore } from "@/store/cliper-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Heart, MessageCircle, Share2, Volume2, VolumeX, Play, Pause, RefreshCw, MoreHorizontal } from "lucide-react"
import type { Cliper } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export default function ClipersPage() {
  const { clipers, isLoading, hasMore, loadClipers } = useCliperStore()
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [mutedStates, setMutedStates] = useState<Record<string, boolean>>({})
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const observerRefs = useRef<(IntersectionObserver | null)[]>([])

  useEffect(() => {
    loadClipers(true)
  }, [loadClipers])

  // Intersection Observer para reproducción automática
  useEffect(() => {
    const observers = clipers.map((_, index) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const video = videoRefs.current[index]
            if (video) {
              if (entry.isIntersecting) {
                // Video entra en viewport - reproducir
                video.play().catch(() => {
                  // Error silencioso si autoplay está bloqueado
                })
              } else {
                // Video sale de viewport - pausar
                video.pause()
              }
            }
          })
        },
        {
          threshold: 0.5, // 50% del video visible
          rootMargin: '0px 0px -100px 0px' // Margen inferior
        }
      )

      // Observar el contenedor del video
      const videoContainer = document.getElementById(`video-container-${index}`)
      if (videoContainer) {
        observer.observe(videoContainer)
      }

      return observer
    })

    observerRefs.current = observers

    return () => {
      observers.forEach(observer => observer.disconnect())
    }
  }, [clipers])

  const toggleMute = (cliperId: string, index: number) => {
    const videoElement = videoRefs.current[index]
    if (videoElement) {
      const newMutedState = !mutedStates[cliperId]
      videoElement.muted = newMutedState
      setMutedStates(prev => ({
        ...prev,
        [cliperId]: newMutedState
      }))
    }
  }

  const handleLoadMore = () => {
    loadClipers()
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Clipers</h1>
              <p className="text-muted-foreground">Presenta tu perfil profesional con videos cortos</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => window.location.reload()} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
              <Button onClick={() => setShowUploadModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Subir Cliper
              </Button>
            </div>
          </div>

          {/* Single Video View - TikTok/Instagram Style */}
          {clipers.length === 0 && !isLoading ? (
            <div className="text-center py-12">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Play className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    No hay clipers aún
                  </h3>
                  <p className="text-muted-foreground">
                    Crea tu primer cliper para mostrar tu perfil profesional
                  </p>
                </div>
                <Button onClick={() => setShowUploadModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Subir tu primer Cliper
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Infinite Scroll Feed */}
              <div className="max-w-sm md:max-w-md lg:max-w-lg mx-auto space-y-8">
                {clipers.map((cliper, index) => (
                  <div key={cliper.id} className="relative w-full mx-auto mb-8">
                    {/* Video Container with Intersection Observer */}
                    <div id={`video-container-${index}`} className="relative aspect-[9/16] bg-black overflow-hidden rounded-lg shadow-2xl">
                      {cliper.videoUrl ? (
                        <video
                          ref={(el) => {
                            if (el) videoRefs.current[index] = el
                          }}
                          src={cliper.videoUrl}
                          className="w-full h-full object-cover"
                          muted={mutedStates[cliper.id] ?? false}
                          playsInline
                          loop
                          preload="metadata"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                          <Play className="h-12 w-12 text-primary/60" />
                        </div>
                      )}

                      {/* Audio Controls */}
                      <div className="absolute top-3 left-3">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleMute(cliper.id, index)
                          }}
                          className="bg-black/50 hover:bg-black/70 text-white border-0"
                        >
                          {mutedStates[cliper.id] ?? true ? (
                            <VolumeX className="h-4 w-4" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        <Badge className={`text-xs ${
                          cliper.status === "DONE" ? "bg-green-500" :
                          cliper.status === "PROCESSING" ? "bg-yellow-500" :
                          cliper.status === "FAILED" ? "bg-red-500" : "bg-gray-500"
                        }`}>
                          {cliper.status === "DONE" ? "Listo" :
                           cliper.status === "PROCESSING" ? "Procesando..." :
                           cliper.status === "FAILED" ? "Error" : cliper.status}
                        </Badge>
                      </div>

                      {/* Duration */}
                      {cliper.duration > 0 && (
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                          <span>
                            {Math.floor(cliper.duration / 60)}:{(cliper.duration % 60).toString().padStart(2, "0")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* User Info Overlay - Top Left */}
                    <div className="absolute top-4 left-4 z-10">
                      <div className="flex items-center space-x-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                        <Avatar className="h-6 w-6 border border-white/20">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback className="text-xs bg-white/20 text-white">
                            U
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-white">
                          <p className="text-sm font-semibold cursor-pointer hover:underline">
                            {cliper.user ? `${cliper.user.firstName} ${cliper.user.lastName}` : "Usuario"}
                          </p>
                          <p className="text-xs opacity-80">
                            {formatDistanceToNow(new Date(cliper.createdAt), {
                              addSuffix: true,
                              locale: es,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions Overlay - Right Side */}
                    <div className="absolute right-4 bottom-20 z-10 flex flex-col space-y-4">
                      <div className="flex flex-col items-center space-y-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white border-0"
                        >
                          <Heart className="h-6 w-6" />
                        </Button>
                        <span className="text-white text-xs font-semibold">0</span>
                      </div>

                      <div className="flex flex-col items-center space-y-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white border-0"
                        >
                          <MessageCircle className="h-6 w-6" />
                        </Button>
                        <span className="text-white text-xs font-semibold">0</span>
                      </div>

                      <div className="flex flex-col items-center space-y-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white border-0"
                        >
                          <Share2 className="h-6 w-6" />
                        </Button>
                        <span className="text-white text-xs font-semibold">0</span>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white border-0"
                      >
                        <MoreHorizontal className="h-6 w-6" />
                      </Button>
                    </div>

                    {/* Video Info Overlay - Bottom */}
                    <div className="absolute bottom-4 left-4 right-20 z-10">
                      <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
                        <p className="text-white text-sm font-medium line-clamp-2">{cliper.title}</p>
                        <p className="text-white/80 text-xs line-clamp-2 mt-1">{cliper.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && clipers.length > 0 && (
                <div className="text-center py-8">
                  <Button variant="outline" onClick={handleLoadMore} disabled={isLoading}>
                    {isLoading ? "Cargando..." : "Cargar más"}
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Loading Skeleton */}
          {isLoading && clipers.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="aspect-video bg-muted"></div>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-muted rounded-full"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-3 bg-muted rounded w-1/3"></div>
                        <div className="h-2 bg-muted rounded w-1/4"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Upload Modal */}
        <UploadCliperModal open={showUploadModal} onOpenChange={setShowUploadModal} />
      </div>
    </ProtectedRoute>
  )
}
