const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

export interface ApiResponse<T> {
  success: boolean
  statusCode: number
  data: T
  message: string
}

export interface ApiError {
  success: boolean
  statusCode: number
  errorType: string
  message: string
}

class ApiRequestError extends Error {
  statusCode: number
  errorType: string

  constructor(res: ApiError) {
    super(res.message)
    this.name = "ApiRequestError"
    this.statusCode = res.statusCode
    this.errorType = res.errorType
  }
}
// NOTE: i have created a generic request that use the BASE_URL and path and RequestInit: which are options object  and then use that function to make generic get post put and delete function that just take path 

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`

  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  })

  const json = await res.json()

  if (!res.ok || json.success === false) {
    throw new ApiRequestError(json as ApiError)
  }

  return (json as ApiResponse<T>).data
}

export function get<T>(path: string): Promise<T> {
  return request<T>(path, { method: "GET" })
}

export function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  })
}

export function put<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  })
}

export function del<T>(path: string): Promise<T> {
  return request<T>(path, { method: "DELETE" })
}
