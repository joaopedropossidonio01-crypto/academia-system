import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFeedback } from '../contexts/FeedbackContext'
import { createAluno } from '../lib/api'

type Erros = Partial<Record<'nome' | 'cpf' | 'email' | 'dataNascimento', string>>

function onlyDigits(s: string) {
  return s.replace(/\D/g, '')
}

function validarCpf(cpf: string): boolean {
  const n = onlyDigits(cpf)
  if (n.length !== 11) return false
  if (/^(\d)\1{10}$/.test(n)) return false
  let soma = 0
  for (let i = 0; i < 9; i++) soma += parseInt(n[i], 10) * (10 - i)
  let d1 = (soma * 10) % 11
  if (d1 === 10) d1 = 0
  if (d1 !== parseInt(n[9], 10)) return false
  soma = 0
  for (let i = 0; i < 10; i++) soma += parseInt(n[i], 10) * (11 - i)
  let d2 = (soma * 10) % 11
  if (d2 === 10) d2 = 0
  return d2 === parseInt(n[10], 10)
}

function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function validarForm(nome: string, cpf: string, email: string, dataNascimento: string): Erros {
  const erros: Erros = {}
  if (!nome.trim()) erros.nome = 'Nome é obrigatório.'
  else if (nome.trim().length < 2) erros.nome = 'Nome deve ter pelo menos 2 caracteres.'
  if (!cpf.trim()) erros.cpf = 'CPF é obrigatório.'
  else if (!validarCpf(cpf)) erros.cpf = 'CPF inválido.'
  if (!email.trim()) erros.email = 'E-mail é obrigatório.'
  else if (!validarEmail(email)) erros.email = 'E-mail inválido.'
  if (!dataNascimento) erros.dataNascimento = 'Data de nascimento é obrigatória.'
  else {
    const d = new Date(dataNascimento)
    if (isNaN(d.getTime()) || d > new Date()) erros.dataNascimento = 'Data inválida.'
  }
  return erros
}

export function CadastroAlunos() {
  const navigate = useNavigate()
  const { showSuccess, showError } = useFeedback()
  
  // Estados do formulário
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [email, setEmail] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [status, setStatus] = useState<'ativo' | 'inativo'>('ativo')
  const [plano, setPlano] = useState('Mensal') // NOVO ESTADO AQUI
  
  const [erros, setErros] = useState<Erros>({})
  const [submitting, setSubmitting] = useState(false)

  const formatarCpf = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 11)
    if (v.length <= 3) setCpf(v)
    else if (v.length <= 6) setCpf(`${v.slice(0, 3)}.${v.slice(3)}`)
    else if (v.length <= 9) setCpf(`${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6)}`)
    else setCpf(`${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6, 9)}-${v.slice(9)}`)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validarForm(nome, cpf, email, dataNascimento)
    setErros(err)
    if (Object.keys(err).length > 0) return
    
    setSubmitting(true)
    try {
      await createAluno({
        nome: nome.trim(),
        cpf: onlyDigits(cpf),
        email: email.trim(),
        dataNascimento: new Date(dataNascimento).toISOString().slice(0, 10),
        status,
        plano, // ENVIANDO O PLANO PARA A API
      })
      showSuccess('Aluno cadastrado com sucesso.')
      
      // Limpa o formulário
      setNome('')
      setCpf('')
      setEmail('')
      setDataNascimento('')
      setPlano('Mensal')
      setErros({})
      
      setTimeout(() => navigate('/alunos'), 800)
    } catch (res: unknown) {
      const err = res as { response?: { data?: { error?: string; details?: unknown } } }
      const msg =
        err.response?.data?.error ??
        err.response?.data?.details
          ? JSON.stringify(err.response.data.details)
          : 'Erro ao cadastrar aluno. Tente novamente.'
      showError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-stone-900">Cadastro de Alunos</h1>
      <p className="mb-8 text-stone-600">
        Preencha os dados para inserir um novo aluno. Todos os campos são obrigatórios.
      </p>
      <form
        onSubmit={handleSubmit}
        className="max-w-xl rounded-xl border border-stone-200 bg-white p-6 shadow-sm"
      >
        <div className="space-y-5">
          {/* Campo Nome */}
          <div>
            <label htmlFor="nome" className="mb-1 block text-sm font-medium text-stone-700">
              Nome completo
            </label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Maria Silva"
              className={`w-full rounded-lg border px-3 py-2 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 ${
                erros.nome ? 'border-red-300 focus:ring-red-500' : 'border-stone-300 focus:ring-emerald-500'
              }`}
            />
            {erros.nome && <p className="mt-1 text-sm text-red-600">{erros.nome}</p>}
          </div>

          {/* Campo CPF */}
          <div>
            <label htmlFor="cpf" className="mb-1 block text-sm font-medium text-stone-700">
              CPF
            </label>
            <input
              id="cpf"
              type="text"
              inputMode="numeric"
              value={cpf}
              onChange={formatarCpf}
              placeholder="000.000.000-00"
              maxLength={14}
              className={`w-full rounded-lg border px-3 py-2 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 ${
                erros.cpf ? 'border-red-300 focus:ring-red-500' : 'border-stone-300 focus:ring-emerald-500'
              }`}
            />
            {erros.cpf && <p className="mt-1 text-sm text-red-600">{erros.cpf}</p>}
          </div>

          {/* Campo Email */}
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-stone-700">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              className={`w-full rounded-lg border px-3 py-2 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 ${
                erros.email ? 'border-red-300 focus:ring-red-500' : 'border-stone-300 focus:ring-emerald-500'
              }`}
            />
            {erros.email && <p className="mt-1 text-sm text-red-600">{erros.email}</p>}
          </div>

          {/* Campo Data Nascimento */}
          <div>
            <label htmlFor="dataNascimento" className="mb-1 block text-sm font-medium text-stone-700">
              Data de nascimento
            </label>
            <input
              id="dataNascimento"
              type="date"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 ${
                erros.dataNascimento
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-stone-300 focus:ring-emerald-500'
              }`}
            />
            {erros.dataNascimento && (
              <p className="mt-1 text-sm text-red-600">{erros.dataNascimento}</p>
            )}
          </div>

          {/* Campo Status */}
          <div>
            <label className="mb-1 block text-sm font-medium text-stone-700">Status</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  checked={status === 'ativo'}
                  onChange={() => setStatus('ativo')}
                  className="h-4 w-4 border-stone-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-stone-700">Ativo</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  checked={status === 'inativo'}
                  onChange={() => setStatus('inativo')}
                  className="h-4 w-4 border-stone-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-stone-700">Inativo</span>
              </label>
            </div>
          </div>

          {/* NOVO CAMPO: PLANO */}
          <div>
            <label htmlFor="plano" className="mb-1 block text-sm font-medium text-stone-700">
              Plano
            </label>
            <select
              id="plano"
              value={plano}
              onChange={(e) => setPlano(e.target.value)}
              className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Mensal">Mensal</option>
              <option value="Trimestral">Trimestral</option>
              <option value="Anual">Anual</option>
            </select>
          </div>

        </div>

        <div className="mt-8 flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-emerald-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
          >
            {submitting ? 'Cadastrando…' : 'Cadastrar aluno'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/alunos')}
            className="rounded-lg border border-stone-300 bg-white px-4 py-2.5 font-medium text-stone-700 hover:bg-stone-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}