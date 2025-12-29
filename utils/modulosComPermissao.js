import AsyncStorage from '@react-native-async-storage/async-storage'
import { apiGetComContexto } from './api'

export const getModulosComPermissao = async () => {
  console.log('🚀 [MODULOS] Iniciando getModulosComPermissao')
  let empresaId = null
  let filialId = null

  try {
    const token = await AsyncStorage.getItem('access')
    const slug = await AsyncStorage.getItem('slug')
    empresaId = await AsyncStorage.getItem('empresaId')
    filialId = await AsyncStorage.getItem('filialId')

    console.log('🔍 [DEBUG] Dados recuperados:', {
      token: token ? 'Token encontrado' : 'Token não encontrado',
      slug: slug || 'Slug não encontrado',
      empresaId: empresaId || 'EmpresaId não encontrado',
      filialId: filialId || 'FilialId não encontrado',
    })

    if (!token || !slug) {
      console.log('❌ Token ou slug não encontrado')
      return []
    }

    if (!empresaId || !filialId) {
      console.log('❌ EmpresaId ou filialId não encontrado')
      return []
    }

    const cacheKey = `MODULOS_PERMITIDOS_${empresaId}_${filialId}`

    console.log('📋 Fazendo requisição para modulos_liberados...')
    // apiGetComContexto já retorna response.data
    const responseLiberados = await apiGetComContexto(
      `parametros-admin/modulos_liberados/?empr=${empresaId}&fili=${filialId}`
    )

    const codigosLiberados = responseLiberados?.modulos_liberados || []

    const responseGlobal = await apiGetComContexto(
      'parametros-admin/permissoes-modulos/modulos_disponiveis/'
    )

    let modulosGlobais = responseGlobal?.modulos || []

    // Verificar se é um array válido
    if (!Array.isArray(modulosGlobais)) {
      console.warn('⚠️ modulosGlobais não é um array:', modulosGlobais)
      modulosGlobais = []
    }

    // Verificar se codigosLiberados é array
    const codigosArray = Array.isArray(codigosLiberados) ? codigosLiberados : []

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
      // Tentar cache antes de retornar vazio
      throw new Error('Nenhum módulo encontrado na API')
    }

    // Filtrar módulos globais pelos códigos liberados
    const modulosPermitidos = modulosGlobais.filter((modulo) =>
      codigosArray.includes(modulo.modu_codi)
    )

    // Salvar os módulos no AsyncStorage para uso futuro (cache específico e global)
    if (modulosPermitidos.length > 0) {
      await AsyncStorage.setItem(cacheKey, JSON.stringify(modulosPermitidos))
      await AsyncStorage.setItem('modulos', JSON.stringify(modulosPermitidos))
      console.log(
        `✅ [MODULOS] ${modulosPermitidos.length} módulos cacheados com sucesso (Key: ${cacheKey})`
      )
    }

    return modulosPermitidos
  } catch (error) {
    console.error(
      '❌ Erro ao carregar módulos permitidos (tentando cache):',
      error
    )

    // Fallback: Tentar recuperar do cache específico da filial
    if (empresaId && filialId) {
      try {
        const cacheKey = `MODULOS_PERMITIDOS_${empresaId}_${filialId}`
        const cachedData = await AsyncStorage.getItem(cacheKey)

        if (cachedData) {
          console.log(
            '📦 [MODULOS] Usando cache específico offline para recuperação'
          )
          const modulos = JSON.parse(cachedData)

          // Atualizar o cache global 'modulos' para que o restante do app funcione
          await AsyncStorage.setItem('modulos', cachedData)

          return modulos
        } else {
          console.log(
            '⚠️ [MODULOS] Nenhum cache específico encontrado para esta filial'
          )
        }
      } catch (cacheError) {
        console.error('❌ Erro ao ler cache offline:', cacheError)
      }
    }

    return []
  }
}
