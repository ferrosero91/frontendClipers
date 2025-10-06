import { create } from "zustand"
import type { Cliper } from "@/lib/types"
import { apiClient } from "@/lib/api"

interface CliperState {
  clipers: Cliper[]
  isLoading: boolean
  uploadProgress: number
  hasMore: boolean
  page: number
  uploadCliper: (file: File, title: string, description: string) => Promise<string>
  loadClipers: (refresh?: boolean) => Promise<void>
  loadMyClipers: () => Promise<void>
  getCliperStatus: (cliperId: string) => Promise<Cliper>
  deleteCliper: (cliperId: string) => Promise<void>
}

export const useCliperStore = create<CliperState>((set, get) => ({
  clipers: [],
  isLoading: false,
  uploadProgress: 0,
  hasMore: true,
  page: 0,

  uploadCliper: async (file: File, title: string, description: string) => {
    try {
      const formData = new FormData()
      formData.append("video", file)
      formData.append("title", title)
      formData.append("description", description)

      const response = await apiClient.post<Cliper>("/clipers/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            set({ uploadProgress: progress })
          }
        },
      })

      set((state) => ({
        clipers: [response, ...state.clipers],
        uploadProgress: 0,
      }))

      return response.id
    } catch (error) {
      set({ uploadProgress: 0 })
      console.error("Error uploading cliper:", error)
      throw error
    }
  },

  loadClipers: async (refresh = false) => {
    const { isLoading, hasMore, page } = get()

    if (isLoading || (!hasMore && !refresh)) return

    set({ isLoading: true })

    try {
      const response = await apiClient.get<{
        clipers: Cliper[]
        hasMore: boolean
        totalPages: number
      }>(`/clipers?page=${refresh ? 0 : page}&size=12`)

      set((state) => ({
        clipers: refresh ? response.clipers : [...state.clipers, ...response.clipers],
        page: refresh ? 1 : page + 1,
        hasMore: response.hasMore,
        isLoading: false,
      }))
    } catch (error) {
      console.error("Error loading clipers:", error)
      set({ isLoading: false })
      throw error
    }
  },

  loadMyClipers: async () => {
    set({ isLoading: true })

    try {
      const clipers = await apiClient.get<Cliper[]>("/clipers/my")

      set((state) => ({
        clipers: clipers,
        isLoading: false,
      }))
    } catch (error) {
      console.error("Error loading my clipers:", error)
      set({ isLoading: false })
      throw error
    }
  },

  getCliperStatus: async (cliperId: string) => {
    try {
      const cliper = await apiClient.get<Cliper>(`/clipers/${cliperId}`)

      // Update the cliper in the store if it exists
      set((state) => ({
        clipers: state.clipers.map((c) => (c.id === cliperId ? cliper : c)),
      }))

      return cliper
    } catch (error) {
      console.error("Error getting cliper status:", error)
      throw error
    }
  },

  deleteCliper: async (cliperId: string) => {
    try {
      await apiClient.delete(`/clipers/${cliperId}`)

      set((state) => ({
        clipers: state.clipers.filter((c) => c.id !== cliperId),
      }))
    } catch (error) {
      console.error("Error deleting cliper:", error)
      throw error
    }
  },
}))
