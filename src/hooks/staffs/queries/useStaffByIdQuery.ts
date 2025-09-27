import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { IStaffResponse } from "@/types/staffs"

const fetchStaffById = async (id: number): Promise<IStaffResponse> => {
  const response = await api.get<IStaffResponse>(`api/v1/staffs/staffs/${id}/`)
  return (response.data as any).data ?? (response.data as any)
}

export const useStaffByIdQuery = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["staff", id],
    queryFn: () => fetchStaffById(id),
    enabled: enabled && !!id
  })
}


