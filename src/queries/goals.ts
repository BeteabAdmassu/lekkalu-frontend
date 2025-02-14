import { AddGoalSchema } from '@/schema/goals'
import { Goal } from '@/types/goals'
import { v1ApiClient } from '@/utils/client'

export async function fetchGoals(params: { page?: number; per_page?: number }) {
  const { data } = await v1ApiClient.get<Goal[]>('financial_goal/', { params })
  return data
}

export async function addGoal(dto: AddGoalSchema) {
  const { data } = await v1ApiClient.post('financial_goal/', dto)
  return data
}

export async function editGoal(id: number, dto: Partial<AddGoalSchema>) {
  const { data } = await v1ApiClient.put(`financial_goal/${id}`, dto)
  return data
}

export async function deleteGoal(id: number) {
  const { data } = await v1ApiClient.delete(`financial_goal/${id}`)
  return data
}
