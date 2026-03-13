import axios from 'axios';
import type { Task, TaskStatus } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

export async function getTasks(): Promise<Task[]> {
  const response = await api.get<Task[]>('/tasks');
  return response.data;
}

export async function getTaskById(id:number): Promise<Task> {
    const response = await api.get<Task>(`/tasks/${id}`);
    return response.data;
}

export async function createTask(title: string, boardId: number, teamId: number): Promise<Task> {
  const response = await api.post<Task>('/tasks', {
    title,
    boardId,
    board: {
      id: boardId,
      teamId,
    },
  });
  return response.data;
}

type UpdateTaskPayload = {
  title?: string;
  status?: TaskStatus;
  boardId?: number;
};

export async function updateTask(id: number, payload: UpdateTaskPayload): Promise<Task> {
  const response = await api.put<Task>(`/tasks/${id}`, payload);
  return response.data;
}

export async function deleteTask(id: number): Promise<void> {
  await api.delete(`/tasks/${id}`);
}