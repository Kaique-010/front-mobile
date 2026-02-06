import { getCadastrosMenu } from './MenuNav/cadastros'
import { getConsultaMenu } from './MenuNav/consulta'
import { getCrmMenu } from './MenuNav/crm'
import { getDashboardsMenu } from './MenuNav/dashboards'
import { getFinanceiroMenu } from './MenuNav/financeiro'
import { getFlorestaMenu } from './MenuNav/floresta'
import { getGerencialMenu } from './MenuNav/gerencial'
import { getNotasMenu } from './MenuNav/notas'
import { getOsMenu } from './MenuNav/os'
import { getPisosMenu } from './MenuNav/pisos'
import { getProducaoMenu } from './MenuNav/producao'
import { getRegistroPontoMenu } from './MenuNav/registroPonto'
import { getUtilitariosMenu } from './MenuNav/utilitarios'
import { getVendasMenu } from './MenuNav/vendas'

// Configuração centralizada do menu do drawer
export const getMenuConfig = (hasModulo) => {
  return {
    cadastros: getCadastrosMenu(hasModulo),
    consulta: getConsultaMenu(hasModulo),
    crm: getCrmMenu(hasModulo),
    dashboards: getDashboardsMenu(hasModulo),
    financeiro: getFinanceiroMenu(hasModulo),
    floresta: getFlorestaMenu(hasModulo),
    gerencial: getGerencialMenu(hasModulo),
    notas: getNotasMenu(hasModulo),
    os: getOsMenu(hasModulo),
    pisos: getPisosMenu(hasModulo),
    producao: getProducaoMenu(hasModulo),
    registroPonto: getRegistroPontoMenu(hasModulo),
    utilitarios: getUtilitariosMenu(hasModulo),
    vendas: getVendasMenu(hasModulo),
  }
}

// Itens individuais do menu (não agrupados)
export const getIndividualMenuItems = (hasModulo) =>
  [{ name: 'Home', route: 'Home', icon: 'home', condition: true }].filter(
    (item) => item.condition,
  )

// Itens específicos da Frisia (serão movidos para componentsFrisia)
export const getFrisiaMenuItems = (hasModulo) =>
  [
    {
      name: 'Painel do Cooperado',
      route: 'PainelCooperado',
      icon: 'users',
      condition: hasModulo('frisia'),
    },
    {
      name: 'Dashvendas',
      route: 'Dashvendas',
      icon: 'trending-up',
      condition: hasModulo('frisia'),
    },
  ].filter((item) => item.condition)

// Modificar para buscar módulos liberados da API
export const getMenuDinamico = async () => {
  try {
    const response = await getModulosLiberados()
    const modulosLiberados = response.data.modulos || []

    // Filtrar menu baseado nos módulos liberados
    return MENU_COMPLETO.filter(
      (item) => modulosLiberados.includes(item.modulo) || item.publico,
    )
  } catch (error) {
    console.error('Erro ao carregar módulos:', error)
    return MENU_BASICO // Menu mínimo em caso de erro
  }
}

// Add to the appropriate section (likely 'vendas' or create a new 'pisos' section)
const menuConfig = {
  name: 'Pisos',
  icon: 'home-work',
  items: [
    {
      name: 'Pedidos Pisos',
      route: 'PedidosPisos',
      icon: 'list-alt',
      condition: (modulos) => modulos?.pisos,
    },
  ],
}
