"use client"

import { useEffect } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { PostCard } from "@/components/feed/post-card"
import { CreatePost } from "@/components/feed/create-post"
import { useFeedStore } from "@/store/feed-store"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export default function FeedPage() {
  const { posts, isLoading, hasMore, loadFeed } = useFeedStore()

  useEffect(() => {
    loadFeed(true)
  }, [loadFeed])

  const handleLoadMore = () => {
    loadFeed()
  }

  const handleRefresh = () => {
    loadFeed(true)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Feed</h1>
              <p className="text-muted-foreground">Descubre oportunidades y conecta con profesionales</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {/* Create Post */}
          <div className="mb-8">
            <CreatePost />
          </div>

          {/* Posts Feed */}
          <div className="space-y-6">
            {posts.length === 0 && !isLoading ? (
              <div className="text-center py-12">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <RefreshCw className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">No hay posts aún</h3>
                    <p className="text-muted-foreground">Sé el primero en compartir algo interesante</p>
                  </div>
                </div>
              </div>
            ) : (
              posts.map((post) => <PostCard key={post.id} post={post} />)
            )}

            {/* Load More Button */}
            {hasMore && posts.length > 0 && (
              <div className="text-center py-6">
                <Button variant="outline" onClick={handleLoadMore} disabled={isLoading}>
                  {isLoading ? "Cargando..." : "Cargar más"}
                </Button>
              </div>
            )}

            {/* Loading Skeleton */}
            {isLoading && posts.length === 0 && (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-card rounded-lg border p-6 animate-pulse">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-muted rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-32"></div>
                        <div className="h-3 bg-muted rounded w-24"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-full"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
