export interface ITaskCreateRequest {
  title: string
  number: string
  author: number
}

export interface ITaskResponse {
  id: number
  title: string
  number: string
  author: number | { id: number; name?: string }
  created?: string
  updated?: string
}

export interface ITaskQuestion {
  id: number
  index?: number
  answer: string
  point?: number | null
  dop_point?: number | null
}


