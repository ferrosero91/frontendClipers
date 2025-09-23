"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { CliperCard } from "@/components/clipers/cliper-card"
import { UploadCliperModal } from "@/components/clipers/upload-cliper-modal"
import { useCliperStore } from "@/store/cliper-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Video, RefreshCw } from "lucide-react"

export default function ClipersPage() {
  const { clipers, isLoading, hasMore, loadClipers } = useCliperStore()
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadClipers(true)
  }, [loadClipers])

  const handleLoadMore = () => {
    loadClipers()
  }

  const handleRefresh = () => {
    loadClipers(true)
  }

  const filteredClipers = clipers.filter(
    (cliper) =>
      cliper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cliper.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cliper.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase())),
  )

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
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
              <Button onClick={() => setShowUploadModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Subir Cliper
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar clipers por título, descripción o habilidades..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Clipers Grid */}
          {filteredClipers.length === 0 && !isLoading ? (
            <div className="text-center py-12">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Video className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    {searchQuery ? "No se encontraron clipers" : "No hay clipers aún"}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? "Intenta con otros términos de búsqueda"
                      : "Crea tu primer cliper para mostrar tu perfil profesional"}
                  </p>
                </div>
                {!searchQuery && (
                  <Button onClick={() => setShowUploadModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Subir tu primer Cliper
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredClipers.map((cliper) => (
                  <CliperCard key={cliper.id} cliper={cliper} />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && filteredClipers.length > 0 && !searchQuery && (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-card rounded-lg border overflow-hidden animate-pulse">
                  <div className="aspect-video bg-muted"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </div>
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
