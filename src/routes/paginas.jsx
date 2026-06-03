import { lazy } from 'react'

// Páginas carregadas sob demanda (code-splitting). Ficam num arquivo só de
// componentes (o router.jsx exporta `router`, que não é componente, e a regra
// react-refresh não deixa misturar os dois). Cada lazy() vira um chunk próprio,
// baixado só quando a rota é visitada — tira do bundle inicial as telas
// pesadas/raras (sobretudo o scanner, que carrega o html5-qrcode).
export const EquipamentosLista = lazy(
  () => import('../features/equipamentos/EquipamentosLista.jsx'),
)
export const EquipamentoFicha = lazy(
  () => import('../features/equipamentos/EquipamentoFicha.jsx'),
)
export const EquipamentoScanner = lazy(
  () => import('../features/equipamentos/EquipamentoScanner.jsx'),
)
export const DashboardPage = lazy(
  () => import('../features/dashboard/DashboardPage.jsx'),
)
export const UsuariosPage = lazy(
  () => import('../features/usuarios/UsuariosPage.jsx'),
)
export const SetoresPage = lazy(
  () => import('../features/setores/SetoresPage.jsx'),
)
export const RelatorioPmocPage = lazy(
  () => import('../features/relatorio/RelatorioPmocPage.jsx'),
)
export const ModelosChecklistPage = lazy(
  () => import('../features/checklists/ModelosChecklistPage.jsx'),
)
export const RondaPage = lazy(() => import('../features/ronda/RondaPage.jsx'))
export const ConfigPmocPage = lazy(
  () => import('../features/config/ConfigPmocPage.jsx'),
)
export const AprovacoesPage = lazy(
  () => import('../features/aprovacoes/AprovacoesPage.jsx'),
)
