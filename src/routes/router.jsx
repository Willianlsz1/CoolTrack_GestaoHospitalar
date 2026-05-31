import {
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import AppLayout from '../components/AppLayout.jsx'
import EquipamentosLista from '../features/equipamentos/EquipamentosLista.jsx'
import EquipamentoFicha from '../features/equipamentos/EquipamentoFicha.jsx'
import EquipamentoScanner from '../features/equipamentos/EquipamentoScanner.jsx'
import DashboardPage from '../features/dashboard/DashboardPage.jsx'
import UsuariosPage from '../features/usuarios/UsuariosPage.jsx'
import SetoresPage from '../features/setores/SetoresPage.jsx'
import RelatorioPmocPage from '../features/relatorio/RelatorioPmocPage.jsx'
import ModelosChecklistPage from '../features/checklists/ModelosChecklistPage.jsx'
import RondaPage from '../features/ronda/RondaPage.jsx'
import ConfigPmocPage from '../features/config/ConfigPmocPage.jsx'
import AprovacoesPage from '../features/aprovacoes/AprovacoesPage.jsx'

// Rota raiz: o "tronco" da árvore. Seu componente é o AppLayout (casco:
// cabeçalho + navegação), que envolve TODAS as telas via <Outlet/>.
const rootRoute = createRootRoute({
  component: AppLayout,
})

// Rota inicial ("/"): a tela de listagem de equipamentos.
// ?setor=<nome> pré-filtra a lista por setor (deep-link vindo dos cards
// de Setores). Filtro vazio/ausente vira undefined (sem filtro).
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: (search) => ({
    setor: typeof search.setor === 'string' ? search.setor : undefined,
  }),
  component: EquipamentosLista,
})

// Ficha de um equipamento. O $id é um parâmetro lido da URL
// (ex.: /equipamentos/abc-123). É o destino que o QR Code vai apontar.
const fichaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/equipamentos/$id',
  // ?aba=checklist abre direto na aba Checklist (deep-link da ronda/scanner).
  validateSearch: (search) => ({
    aba: search.aba === 'checklist' ? 'checklist' : undefined,
  }),
  component: EquipamentoFicha,
})

// Leitor de QR pela câmera (entra na ficha lida).
const escanearRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/escanear',
  component: EquipamentoScanner,
})

// Dashboard: visão gerencial agregada.
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
})

// Gestão de usuários (só admin — a página e a Edge Function checam o papel).
const usuariosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/usuarios',
  component: UsuariosPage,
})

// Gestão de setores (só admin — a página e o RLS do banco checam o papel).
const setoresRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/setores',
  component: SetoresPage,
})

// Relatório PMOC (todos os autenticados — é o entregável de gestão).
const relatorioRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/relatorio',
  component: RelatorioPmocPage,
})

// Modelos de checklist (só admin — a página e o RLS checam o papel).
const checklistsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checklists',
  component: ModelosChecklistPage,
})

// Ronda do mês: equipamentos com checklist pendente, por setor.
const rondaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ronda',
  component: RondaPage,
})

// Configuração do PMOC (só admin) — estabelecimento + responsável técnico.
const configPmocRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/config-pmoc',
  component: ConfigPmocPage,
})

// Fila de aprovação de serviços (só admin — a página e o RLS checam).
const aprovacoesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/aprovacoes',
  component: AprovacoesPage,
})

// A árvore de rotas: a raiz com suas filhas. Cada nova tela vira
// um createRoute() adicionado aqui.
const routeTree = rootRoute.addChildren([
  indexRoute,
  fichaRoute,
  escanearRoute,
  dashboardRoute,
  usuariosRoute,
  setoresRoute,
  relatorioRoute,
  checklistsRoute,
  rondaRoute,
  configPmocRoute,
  aprovacoesRoute,
])

// O router em si: junta a árvore e é entregue ao RouterProvider.
export const router = createRouter({ routeTree })
