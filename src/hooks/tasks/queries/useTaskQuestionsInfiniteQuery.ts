import { useInfiniteQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import { getNextPageParam } from "@/lib/query-utils"
import type { IPaginatedResponse, IBaseFiltersRequest } from "@/types/api"
import type { ITaskQuestion } from "@/types/tasks"

interface QuestionsListResponse<T> {
  data: T[]
}

const fetchTaskQuestions = async (
  filters: IBaseFiltersRequest & { task?: number | string },
  _pageParam: number
): Promise<IPaginatedResponse<ITaskQuestion>> => {
  const params: any = {}
  if (filters.task != null) params.task = filters.task

  const response = await api.get<QuestionsListResponse<ITaskQuestion>>("api/v1/tasks/question_list/", { params })
  const list = (response.data as any)?.data ?? []

  return {
    content: list,
    totalElements: list.length,
    totalPages: 1,
    size: list.length,
    number: 0
  }
}

export const useTaskQuestionsInfiniteQuery = (
  filters: IBaseFiltersRequest & { task?: number | string } = {}
) => {
  return useInfiniteQuery({
    queryKey: ["task-questions", filters],
    queryFn: ({ pageParam = 0 }) => fetchTaskQuestions(filters, pageParam),
    getNextPageParam,
    initialPageParam: 0
  })
}


