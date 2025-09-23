"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthStore } from "@/store/auth-store"
import { useFeedStore } from "@/store/feed-store"
import { ImageIcon, VideoIcon, Send } from "lucide-react"

export function CreatePost() {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuthStore()
  const { createPost } = useFeedStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsSubmitting(true)
    try {
      await createPost(content.trim())
      setContent("")
    } catch (error) {
      console.error("Error creating post:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.profileImage || "/placeholder.svg"} alt={user?.firstName} />
              <AvatarFallback>
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="¿Qué está pasando en tu carrera profesional?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] resize-none border-0 bg-muted/50 focus-visible:ring-1"
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button type="button" variant="ghost" size="sm" className="text-muted-foreground">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Imagen
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="text-muted-foreground">
                    <VideoIcon className="h-4 w-4 mr-2" />
                    Video
                  </Button>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-muted-foreground">{content.length}/500</span>
                  <Button type="submit" disabled={!content.trim() || isSubmitting} size="sm">
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Publicando..." : "Publicar"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
