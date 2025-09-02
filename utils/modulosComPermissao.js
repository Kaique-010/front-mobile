import AsyncStorage from '@react-native-async-storage/async-storage'
import { apiGetComContexto } from './api'

export const getModulosComPermissao = async () => {
  console.log('🚀 [MODULOS] Iniciando getModulosComPermissao')
  try {
    const token = await AsyncStorage.getItem('access') // Corrigido: era 'accessToken'
    const slug = await AsyncStorage.getItem('slug')
    const empresaId = await AsyncStorage.getItem('empresaId')
    const filialId = await AsyncStorage.getItem('filialId')

    console.log('🔍 [DEBUG] Dados recuperados:', {
      token: token ? 'Token encontrado' : 'Token não encontrado',
      slug: slug || 'Slug não encontrado',
      empresaId: empresaId || 'EmpresaId não encontrado',
      filialId: filialId || 'FilialId não encontrado'
    })

    if (!token || !slug) {
      console.log('❌ Token ou slug não encontrado')
      return []
    }

    if (!empresaId || !filialId) {
      console.log('❌ EmpresaId ou filialId não encontrado')
      return []
    }

    console.log('📋 Fazendo requisição para modulos_liberados...')
    // apiGetComContexto já retorna response.data, não precisa acessar .data novamente
    const responseLiberados = await apiGetComContexto(
      `parametros-admin/modulos_liberados/?empr=${empresaId}&fili=${filialId}`
    )

    console.log('🔍 [DEBUG] Resposta modulos_liberados:', responseLiberados)

    // A API retorna { modulos_liberados: [...] } diretamente
    const codigosLiberados = responseLiberados?.modulos_liberados || []

    console.log('📋 Fazendo requisição para modulos_disponiveis...')
    const responseGlobal = await apiGetComContexto(
      'parametros-admin/permissoes-modulos/modulos_disponiveis/'
    )

    console.log('🔍 [DEBUG] Resposta modulos_disponiveis:', responseGlobal)

    // A API retorna { modulos: [...] } diretamente
    let modulosGlobais = responseGlobal?.modulos || []

    // Verificar se é um array válido
    if (!Array.isArray(modulosGlobais)) {
      console.warn('⚠️ modulosGlobais não é um array:', modulosGlobais)
      modulosGlobais = []
    }

    // Verificar se codigosLiberados é array
    const codigosArray = Array.isArray(codigosLiberados) ? codigosLiberados : []

    console.log('🔍 [DEBUG] Códigos liberados processados:', codigosArray)
    console.log(
      '🔍 [DEBUG] Módulos globais processados:',
      modulosGlobais.length
    )

    // Se não há módulos globais cadastrados, criar módulos básicos baseados nos códigos liberados
    if (modulosGlobais.length === 0 && codigosArray.length > 0) {
      modulosGlobais = codigosArray.map((codigo) => ({
        modu_codi: codigo,
        modu_nome: `Modulo_${codigo}`,
        modu_desc: `Módulo ${codigo}`,
        modu_ativ: true,
        modu_ordem: codigo,
      }))
    } else if (modulosGlobais.length === 0) {
      console.warn('⚠️ Nenhum módulo disponível encontrado')
      return []
    }

    // Filtrar módulos globais pelos códigos liberados
    const modulosPermitidos = modulosGlobais.filter((modulo) =>
      codigosArray.includes(modulo.modu_codi)
    )

    console.log(
      '✅ [DEBUG] Módulos permitidos encontrados:',
      modulosPermitidos.length
    )
    console.log('✅ [DEBUG] Módulos permitidos:', modulosPermitidos)

    // Salvar os módulos no AsyncStorage para uso futuro
    if (modulosPermitidos.length > 0) {
      await AsyncStorage.setItem('modulos', JSON.stringify(modulosPermitidos))
    }

    return modulosPermitidos
  } catch (error) {
    console.error('❌ Erro ao carregar módulos permitidos:', error)
    console.error('❌ Stack trace:', error.stack)
    return []
  }
}
