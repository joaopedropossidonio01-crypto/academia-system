import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, UserPlus, Users, Dumbbell } from 'lucide-react'
import { FeedbackToast } from './FeedbackToast'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/alunos', label: 'Listagem de Alunos', icon: Users },
  { to: '/alunos/novo', label: 'Cadastro de Alunos', icon: UserPlus },
]

export function Layout() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white shadow-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <NavLink to="/" className="flex items-center gap-2 font-semibold text-stone-800">
            <Dumbbell className="h-7 w-7 text-emerald-600" />
            <span>Academia</span>
          </NavLink>
          <nav className="flex gap-1">
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
      <FeedbackToast />
    </div>
  )
}
