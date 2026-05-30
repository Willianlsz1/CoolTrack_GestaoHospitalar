import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from '@tanstack/react-router'
import EquipamentosLista from '../features/equipamentos/EquipamentosLista.jsx'
import EquipamentoFicha from '../features/equipamentos/EquipamentoFicha.jsx'

// Rota raiz: o "tronco" da árvore. Seu componente é o layout que envolve
// TODAS as telas — aqui, o fundo escuro e o container centralizado. O
// <Outlet /> é o buraco onde a rota filha ativa é renderizada.
const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="mx-auto max-w-5xl p-6">
        <Outlet />
      </div>
    </div>
  ),
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

// A árvore de rotas: a raiz com suas filhas. Cada nova tela vira
// um createRoute() adicionado aqui.
const routeTree = rootRoute.addChildren([indexRoute, fichaRoute])

// O router em si: junta a árvore e é entregue ao RouterProvider.
export const router = createRouter({ routeTree })
