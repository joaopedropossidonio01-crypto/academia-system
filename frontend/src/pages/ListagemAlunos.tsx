import { useEffect, useState } from 'react'
import { Loader2, Trash2, Pencil, Search, User, CheckCircle2, XCircle } from 'lucide-react'
import { getAlunos, deleteAluno, updateAluno, type Aluno } from '../lib/api'
import { useFeedback } from '../contexts/FeedbackContext'

// --- LÓGICA E UTILITÁRIOS (MANTIDOS DO SEU CÓDIGO) ---

interface AlunoComPlano extends Aluno {
  plano?: string;
}

function formatCpf(cpf: string) {
  const n = cpf.replace(/\D/g, '')
  if (n.length !== 11) return cpf
  return `${n.slice(0, 3)}.${n.slice(3, 6)}.${n.slice(6, 9)}-${n.slice(9)}`
}

// Helper visual para criar avatares (Ex: João Silva -> JS)
function getIniciais(nome: string) {
  return nome
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function exibirPlano(aluno: AlunoComPlano): string {
  if (aluno.plano) return aluno.plano;
  const matriculas = (aluno as any).matriculas ?? []
  if (matriculas.length > 0) {
    const ultima = matriculas[matriculas.length - 1]
    return ultima?.plano?.nome ?? '—'
  }
  return '—'
}

const PLANOS_OPCOES = ['Mensal', 'Trimestral', 'Anual'] as const

function planoInicial(aluno: AlunoComPlano): string {
  const p = aluno.plano ?? exibirPlano(aluno)
  return PLANOS_OPCOES.includes(p as (typeof PLANOS_OPCOES)[number]) ? p : PLANOS_OPCOES[0]
}

// --- COMPONENTE PRINCIPAL ---

export function ListagemAlunos() {
  const { showSuccess, showError } = useFeedback()
  
  // Estados
  const [alunos, setAlunos] = useState<AlunoComPlano[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'ativo' | 'inativo'>('todos')
  
  // Estados de Ação
  const [alunoToDelete, setAlunoToDelete] = useState<AlunoComPlano | null>(null)
  const [deleting, setDeleting] = useState(false)
  
  const [alunoToEdit, setAlunoToEdit] = useState<AlunoComPlano | null>(null)
  const [editNome, setEditNome] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editCpf, setEditCpf] = useState('')
  const [editStatus, setEditStatus] = useState<'ativo' | 'inativo'>('ativo')
  const [editPlano, setEditPlano] = useState<string>(PLANOS_OPCOES[0])
  const [saving, setSaving] = useState(false)

  // Carregamento
  useEffect(() => {
    let cancelled = false
    const status = filtroStatus === 'todos' ? undefined : filtroStatus
    setLoading(true)
    getAlunos(status)
      .then((data) => {
        if (!cancelled) setAlunos(data)
      })
      .catch(() => {
        if (!cancelled) setError('Não foi possível carregar os alunos.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [filtroStatus])

  // Preencher formulário de edição
  useEffect(() => {
    if (alunoToEdit) {
      setEditNome(alunoToEdit.nome)
      setEditEmail(alunoToEdit.email)
      setEditCpf(formatCpf(alunoToEdit.cpf))
      setEditStatus(alunoToEdit.status)
      setEditPlano(planoInicial(alunoToEdit))
    }
  }, [alunoToEdit])

  // Handlers (Lógica mantida)
  const handleConfirmDelete = async () => {
    if (!alunoToDelete) return
    setDeleting(true)
    try {
      await deleteAluno(alunoToDelete.id)
      setAlunos((prev) => prev.filter((a) => a.id !== alunoToDelete.id))
      setAlunoToDelete(null)
      showSuccess('Aluno excluído com sucesso.')
    } catch (err: unknown) {
      const res = err as { response?: { data?: { error?: string } } }
      showError(res.response?.data?.error ?? 'Não foi possível excluir o aluno.')
    } finally {
      setDeleting(false)
    }
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!alunoToEdit) return
    setSaving(true)
    try {
      const cpfDigits = editCpf.replace(/\D/g, '')
      const updated = await updateAluno(alunoToEdit.id, {
        nome: editNome.trim(),
        email: editEmail.trim(),
        cpf: cpfDigits.length === 11 ? cpfDigits : alunoToEdit.cpf.replace(/\D/g, ''),
        status: editStatus,
        plano: editPlano,
      })
      setAlunos((prev) =>
        prev.map((a) => (a.id === alunoToEdit.id ? { ...a, ...updated, plano: editPlano } : a))
      )
      setAlunoToEdit(null)
      showSuccess('Aluno atualizado com sucesso.')
    } catch (err: unknown) {
      const res = err as { response?: { data?: { error?: string } } }
      showError(res.response?.data?.error ?? 'Não foi possível atualizar o aluno.')
    } finally {
      setSaving(false)
    }
  }

  const formatarCpfEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 11)
    if (v.length <= 3) setEditCpf(v)
    else if (v.length <= 6) setEditCpf(`${v.slice(0, 3)}.${v.slice(3)}`)
    else if (v.length <= 9) setEditCpf(`${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6)}`)
    else setEditCpf(`${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6, 9)}-${v.slice(9)}`)
  }

  // --- RENDERIZAÇÃO VISUAL (LAYOUT NOVO) ---

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          <p className="text-sm font-medium text-gray-500">Carregando dados...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl mt-10 rounded-xl border border-red-100 bg-red-50 p-6 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <XCircle className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-red-900">Erro ao carregar</h3>
        <p className="mt-1 text-sm text-red-700">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-1 md:p-6">
      
      {/* CABEÇALHO SOFISTICADO */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Alunos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie matrículas, planos e status financeiro.
          </p>
        </div>

        {/* Barra de Filtros (Estilo Tabs) */}
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
          {(['todos', 'ativo', 'inativo'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFiltroStatus(s)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                filtroStatus === s
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* CARD DA TABELA */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-gray-950/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Aluno</th>
                <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs">Plano</th>
                <th className="px-6 py-4 font-semibold text-gray-500 uppercase tracking-wider text-xs text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {alunos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                      <Search className="h-10 w-10 opacity-20" />
                      <p className="text-sm">Nenhum aluno encontrado neste filtro.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                alunos.map((aluno) => (
                  <tr key={aluno.id} className="group hover:bg-gray-50/80 transition-colors">
                    
                    {/* Coluna: Avatar + Nome + Email */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 font-bold text-xs ring-2 ring-white shadow-sm">
                          {getIniciais(aluno.nome)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">{aluno.nome}</span>
                          <span className="text-xs text-gray-500">{aluno.email}</span>
                          <span className="text-[10px] text-gray-400 md:hidden">{formatCpf(aluno.cpf)}</span>
                        </div>
                      </div>
                    </td>

                    {/* Coluna: Status (Badge Moderno) */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                        aluno.status === 'ativo' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}>
                        {aluno.status === 'ativo' 
                          ? <CheckCircle2 className="h-3 w-3" />
                          : <div className="h-2 w-2 rounded-full bg-gray-400" />
                        }
                        {aluno.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>

                    {/* Coluna: Plano */}
                    <td className="px-6 py-4 font-medium text-gray-700">
                      {exibirPlano(aluno)}
                    </td>

                    {/* Coluna: Ações (Botões Ghost) */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setAlunoToEdit(aluno)}
                          className="rounded-md p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setAlunoToDelete(aluno)}
                          className="rounded-md p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAIS COM DESIGN 'CLEAN' --- */}

      {/* Modal de Edição */}
      {alunoToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-gray-900/5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Editar Aluno</h2>
                <p className="text-sm text-gray-500">Atualize os dados cadastrais.</p>
              </div>
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <User className="h-5 w-5" />
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">Nome Completo</label>
                  <input
                    type="text"
                    value={editNome}
                    onChange={(e) => setEditNome(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">E-mail</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">CPF</label>
                  <input
                    type="text"
                    value={editCpf}
                    onChange={formatarCpfEdit}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as 'ativo' | 'inativo')}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">Plano Vinculado</label>
                  <select
                    value={editPlano}
                    onChange={(e) => setEditPlano(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  >
                    {PLANOS_OPCOES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={() => setAlunoToEdit(null)}
                  disabled={saving}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-medium text-white shadow-md shadow-emerald-200 hover:bg-emerald-700 hover:shadow-lg transition-all disabled:opacity-70"
                >
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Exclusão */}
      {alunoToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-gray-900/5">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Excluir aluno?</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Tem certeza que deseja remover <strong>{alunoToDelete.nome}</strong>? Essa ação não pode ser desfeita.
                </p>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setAlunoToDelete(null)}
                disabled={deleting}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 transition-colors disabled:opacity-70"
              >
                {deleting ? 'Excluindo...' : 'Sim, excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}