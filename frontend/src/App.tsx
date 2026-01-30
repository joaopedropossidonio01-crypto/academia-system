import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { FeedbackProvider } from './contexts/FeedbackContext'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { ListagemAlunos } from './pages/ListagemAlunos'
import { CadastroAlunos } from './pages/CadastroAlunos'

function App() {
  return (
    <BrowserRouter>
      <FeedbackProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="alunos" element={<ListagemAlunos />} />
            <Route path="alunos/novo" element={<CadastroAlunos />} />
          </Route>
        </Routes>
      </FeedbackProvider>
    </BrowserRouter>
  )
}

export default App
