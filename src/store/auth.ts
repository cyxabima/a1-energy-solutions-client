import { create } from "zustand"
import * as authApi from "@/services/auth"
import type { User } from "@/services/auth"

interface AuthState {
  user: User | null
  isLoading: boolean
  isInitialized: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isInitialized: false,

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const data = await authApi.login(email, password)
      set({ user: data.user, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true })
    try {
      const data = await authApi.register(name, email, password)
      set({ user: data.user, isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  logout: async () => {
    try {
      await authApi.logout()
    } finally {
      set({ user: null })
    }
  },

  fetchUser: async () => {
    set({ isLoading: true })
    try {
      const user = await authApi.me()
      set({ user, isInitialized: true, isLoading: false })
    } catch {
      set({ user: null, isInitialized: true, isLoading: false })
    }
  },
}))
