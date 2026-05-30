import {
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import AppLayout from '../components/AppLayout.jsx'
import EquipamentosLista from '../features/equipamentos/EquipamentosLista.jsx'
import EquipamentoFicha from '../features/equipamentos/EquipamentoFicha.jsx'
import EquipamentoScanner from '../features/equipamentos/EquipamentoScanner.jsx'

// Rota raiz: o "tronco" da árvore. Seu componente é o AppLayout (casco:
// cabeçalho + navegação), que envolve TODAS as telas via <Outlet/>.
const rootRoute = createRootRoute({
  component: AppLayout,
})

// Rota inicial ("/"): a tela de listagem de equipamentos.
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: EquipamentosLista,
})

// Ficha de um equipamento. O $id é um parâmetro lido da URL
// (ex.: /equipamentos/abc-123). É o destino que o QR Code vai apontar.
const fichaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/equipamentos/$id',
  component: EquipamentoFicha,
})

// Leitor de QR pela câmera (entra na ficha lida).
const escanearRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/escanear',
  component: EquipamentoScanner,
})

// A árvore de rotas: a raiz com suas filhas. Cada nova tela vira
// um createRoute() adicionado aqui.
const routeTree = rootRoute.addChildren([indexRoute, fichaRoute, escanearRoute])

// O router em si: junta a árvore e é entregue ao RouterProvider.
export const router = createRouter({ routeTree })
