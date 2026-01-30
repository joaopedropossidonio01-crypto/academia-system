import { useEffect, useState } from 'react'
import { Users, AlertCircle, Loader2 } from 'lucide-react'
import { getDashboardMetrics } from '../lib/api'

interface Metrics {
  totalAlunosAtivos: number
  totalInadimplentes: number
}

export function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getDashboardMetrics()
      .then((data) => {
        if (!cancelled) setMetrics(data)
      })
      .catch(() => {
        if (!cancelled) setError('Não foi possível carregar as métricas. Verifique se o backend está rodando.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
        {error}
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-stone-900">Dashboard</h1>
      <p className="mb-8 text-stone-600">
        Visão geral para apoio à decisão gerencial.
      </p>
      <div className="grid gap-6 sm:grid-cols-2">
        <article className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-3">
              <Users className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Total de Alunos</p>
              <p className="text-2xl font-bold text-stone-900">
                {metrics?.totalAlunosAtivos ?? 0}
              </p>
              <p className="text-xs text-stone-500">alunos ativos</p>
            </div>
          </div>
        </article>
        <article className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-3">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Mensalidades Pendentes</p>
              <p className="text-2xl font-bold text-stone-900">
                {metrics?.totalInadimplentes ?? 0}
              </p>
              <p className="text-xs text-stone-500">alunos inadimplentes</p>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
