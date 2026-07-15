import { get, post } from "@/lib/api"

export interface User {
  _id: string
  email: string
  name: string
  role: string
}

export interface AuthResponse {
  user: User
  token: string
}

export function login(email: string, password: string) {
  return post<AuthResponse>("/api/v1/auth/login", { email, password })
}

export function register(name: string, email: string, password: string) {
  return post<AuthResponse>("/api/v1/auth/register", { name, email, password })
}

export function logout() {
  return post<null>("/api/v1/auth/logout")
}

export function me() {
  return get<User>("/api/v1/auth/me")
}
