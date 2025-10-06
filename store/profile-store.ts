import { create } from "zustand"
import type { User, Company, ATSProfile, Education, Experience, Skill } from "@/lib/types"
import { apiClient } from "@/lib/api"

interface ProfileState {
  profile: User | Company | null
  atsProfile: ATSProfile | null
  isLoading: boolean
  loadProfile: (userId?: string) => Promise<void>
  updateProfile: (data: Partial<User | Company>) => Promise<void>
  loadATSProfile: (userId?: string) => Promise<void>
  updateATSProfile: (data: Partial<ATSProfile>) => Promise<void>
  addEducation: (education: Omit<Education, "id">) => Promise<void>
  updateEducation: (id: string, education: Partial<Education>) => Promise<void>
  deleteEducation: (id: string) => Promise<void>
  addExperience: (experience: Omit<Experience, "id">) => Promise<void>
  updateExperience: (id: string, experience: Partial<Experience>) => Promise<void>
  deleteExperience: (id: string) => Promise<void>
  addSkill: (skill: Omit<Skill, "id">) => Promise<void>
  updateSkill: (id: string, skill: Partial<Skill>) => Promise<void>
  deleteSkill: (id: string) => Promise<void>
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  atsProfile: null,
  isLoading: false,

  loadProfile: async (userId?: string) => {
    set({ isLoading: true })
    try {
      const endpoint = userId ? `/users/${userId}` : "/auth/me"
      const profile = await apiClient.get<User | Company>(endpoint)
      set({ profile, isLoading: false })
    } catch (error) {
      console.error("Error loading profile:", error)
      set({ isLoading: false })
    }
  },

  updateProfile: async (data: Partial<User | Company>) => {
    try {
      const updatedProfile = await apiClient.put<User | Company>("/users/profile", data)
      set({ profile: updatedProfile })
    } catch (error) {
      console.error("Error updating profile:", error)
      throw error
    }
  },

  loadATSProfile: async (userId?: string) => {
    try {
      const { profile } = get()
      // Only load ATS profile for candidates
      if (profile && "role" in profile && profile.role === "CANDIDATE") {
        const endpoint = userId ? `/ats-profiles/user/${userId}` : "/ats-profiles/me"
        const atsProfile = await apiClient.get<ATSProfile>(endpoint)
        set({ atsProfile })
      } else {
        // Companies don't have ATS profiles
        set({ atsProfile: null })
      }
    } catch (error) {
      console.error("Error loading ATS profile:", error)
      // ATS profile might not exist yet
      set({ atsProfile: null })
    }
  },

  updateATSProfile: async (data: Partial<ATSProfile>) => {
    try {
      const updatedProfile = await apiClient.put<ATSProfile>("/ats-profiles", data)
      set({ atsProfile: updatedProfile })
    } catch (error) {
      console.error("Error updating ATS profile:", error)
      throw error
    }
  },

  addEducation: async (education: Omit<Education, "id">) => {
    try {
      const newEducation = await apiClient.post<Education>("/ats-profiles/education", education)
      set((state) => ({
        atsProfile: state.atsProfile
          ? {
              ...state.atsProfile,
              education: [...state.atsProfile.education, newEducation],
            }
          : null,
      }))
    } catch (error) {
      console.error("Error adding education:", error)
      throw error
    }
  },

  updateEducation: async (id: string, education: Partial<Education>) => {
    try {
      const updatedEducation = await apiClient.put<Education>(`/ats-profiles/education/${id}`, education)
      set((state) => ({
        atsProfile: state.atsProfile
          ? {
              ...state.atsProfile,
              education: state.atsProfile.education.map((edu) => (edu.id === id ? updatedEducation : edu)),
            }
          : null,
      }))
    } catch (error) {
      console.error("Error updating education:", error)
      throw error
    }
  },

  deleteEducation: async (id: string) => {
    try {
      await apiClient.delete(`/ats-profiles/education/${id}`)
      set((state) => ({
        atsProfile: state.atsProfile
          ? {
              ...state.atsProfile,
              education: state.atsProfile.education.filter((edu) => edu.id !== id),
            }
          : null,
      }))
    } catch (error) {
      console.error("Error deleting education:", error)
      throw error
    }
  },

  addExperience: async (experience: Omit<Experience, "id">) => {
    try {
      const newExperience = await apiClient.post<Experience>("/ats-profiles/experience", experience)
      set((state) => ({
        atsProfile: state.atsProfile
          ? {
              ...state.atsProfile,
              experience: [...state.atsProfile.experience, newExperience],
            }
          : null,
      }))
    } catch (error) {
      console.error("Error adding experience:", error)
      throw error
    }
  },

  updateExperience: async (id: string, experience: Partial<Experience>) => {
    try {
      const updatedExperience = await apiClient.put<Experience>(`/ats-profiles/experience/${id}`, experience)
      set((state) => ({
        atsProfile: state.atsProfile
          ? {
              ...state.atsProfile,
              experience: state.atsProfile.experience.map((exp) => (exp.id === id ? updatedExperience : exp)),
            }
          : null,
      }))
    } catch (error) {
      console.error("Error updating experience:", error)
      throw error
    }
  },

  deleteExperience: async (id: string) => {
    try {
      await apiClient.delete(`/ats-profiles/experience/${id}`)
      set((state) => ({
        atsProfile: state.atsProfile
          ? {
              ...state.atsProfile,
              experience: state.atsProfile.experience.filter((exp) => exp.id !== id),
            }
          : null,
      }))
    } catch (error) {
      console.error("Error deleting experience:", error)
      throw error
    }
  },

  addSkill: async (skill: Omit<Skill, "id">) => {
    try {
      const newSkill = await apiClient.post<Skill>("/ats-profiles/skills", skill)
      set((state) => ({
        atsProfile: state.atsProfile
          ? {
              ...state.atsProfile,
              skills: [...state.atsProfile.skills, newSkill],
            }
          : null,
      }))
    } catch (error) {
      console.error("Error adding skill:", error)
      throw error
    }
  },

  updateSkill: async (id: string, skill: Partial<Skill>) => {
    try {
      const updatedSkill = await apiClient.put<Skill>(`/ats-profiles/skills/${id}`, skill)
      set((state) => ({
        atsProfile: state.atsProfile
          ? {
              ...state.atsProfile,
              skills: state.atsProfile.skills.map((s) => (s.id === id ? updatedSkill : s)),
            }
          : null,
      }))
    } catch (error) {
      console.error("Error updating skill:", error)
      throw error
    }
  },

  deleteSkill: async (id: string) => {
    try {
      await apiClient.delete(`/ats-profiles/skills/${id}`)
      set((state) => ({
        atsProfile: state.atsProfile
          ? {
              ...state.atsProfile,
              skills: state.atsProfile.skills.filter((s) => s.id !== id),
            }
          : null,
      }))
    } catch (error) {
      console.error("Error deleting skill:", error)
      throw error
    }
  },
}))
