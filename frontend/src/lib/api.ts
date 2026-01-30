import axios from 'axios'

// Configuração da API
export const api = axios.create({
  // --- ATENÇÃO AQUI: Mudamos de 3000 para 3001 ---
  baseURL: 'http://localhost:3001', 
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// --- Interfaces (Tipos) ---

export interface DashboardMetrics {
  totalAlunosAtivos: number
  totalInadimplentes: number
}

export interface Aluno {
  id: number
  nome: string
  cpf: string
  email: string
  dataNascimento: string
  status: 'ativo' | 'inativo'
  plano?: string 
  matriculas?: { plano: { nome: string } }[]
}

export interface Plano {
  id: number
  nome: string
  preco: number
  duracaoDias: number
}

// --- Funções da API ---

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const { data } = await api.get<DashboardMetrics>('/dashboard/metrics')
  return data
}

export async function getAlunos(status?: 'ativo' | 'inativo'): Promise<Aluno[]> {
  const params = status ? { status } : {}
  const { data } = await api.get<Aluno[]>('/alunos', { params })
  return data
}

export async function createAluno(payload: {
  nome: string
  cpf: string
  email: string
  dataNascimento: string
  status?: 'ativo' | 'inativo'
  plano?: string
}): Promise<Aluno> {
  const { data } = await api.post<Aluno>('/alunos', payload)
  return data
}

export async function updateAluno(id: number, data: Partial<Aluno>): Promise<Aluno> {
  const { data: updated } = await api.put<Aluno>(`/alunos/${id}`, data)
  return updated
}

export async function deleteAluno(id: number): Promise<void> {
  await api.delete(`/alunos/${id}`)
}