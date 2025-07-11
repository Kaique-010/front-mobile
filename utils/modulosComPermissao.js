import AsyncStorage from '@react-native-async-storage/async-storage'
import { apiGetComContexto } from './api'
import axios from 'axios'
import { BASE_URL } from './api'

export const getModulosComPermissao = async () => {
  try {
    console.log('🔍 [NOVA VERSÃO] Iniciando busca de módulos com permissão...')
    console.log('⏰ Timestamp:', new Date().toISOString())
    
    // Primeiro, tentar usar os módulos já salvos no AsyncStorage do login
    const modulosSalvos = await AsyncStorage.getItem('modulos')
    
    if (modulosSalvos) {
      const modulosParsed = JSON.parse(modulosSalvos)
      console.log('✅ Módulos encontrados no AsyncStorage:', modulosParsed.length)
      console.log('📋 Lista de módulos do AsyncStorage:', JSON.stringify(modulosParsed, null, 2))
      
      if (Array.isArray(modulosParsed) && modulosParsed.length > 0) {
        return modulosParsed
      }
    }
    
    console.log('⚠️ Módulos não encontrados no AsyncStorage, tentando buscar via API...')
    
    const token = await AsyncStorage.getItem('access')
    const slug = await AsyncStorage.getItem('slug')
    const empresaId = await AsyncStorage.getItem('empresaId')
    const filialId = await AsyncStorage.getItem('filialId')
    
    if (!token || !slug) {
      console.log('⚠️ Token ou slug não encontrados')
      return []
    }
    
    if (!empresaId || !filialId) {
      console.log('⚠️ Empresa ou filial não selecionadas ainda')
      return []
    }
    
    console.log('🔐 API Token check:', !!token)
    console.log('🔐 Token preview:', token.substring(0, 20) + '...')
    console.log('🏢 Empresa ID:', empresaId)
    console.log('🏪 Filial ID:', filialId)
    
    const baseURL = `${BASE_URL}/api/${slug}/parametros-admin`
    console.log('🌐 Base URL:', baseURL)
    
    // Buscar códigos dos módulos liberados para a empresa/filial específica
    console.log('📡 Chamando API modulos_liberados...')
    const responseLiberados = await axios.get(
      `${baseURL}/modulos_liberados/?empr=${empresaId}&fili=${filialId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )
    
    const { modulos_liberados: codigosLiberados } = responseLiberados.data
    console.log('✅ Códigos liberados carregados:', codigosLiberados.length)
    console.log('📋 Lista de códigos liberados:', JSON.stringify(codigosLiberados, null, 2))
    
    // Buscar módulos globais disponíveis
    console.log('📡 Chamando API modulos_disponiveis...')
    const responseGlobal = await axios.get(
      `${baseURL}/permissoes-modulos/modulos_disponiveis/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )
    
    console.log('🔍 Resposta completa da API modulos_disponiveis:', responseGlobal.data)
    
    // A API retorna um objeto com a propriedade 'modulos' que contém o array
    let modulosGlobais = responseGlobal.data || []
    
    // Se a resposta tem a propriedade 'modulos', usar ela
    if (modulosGlobais.modulos && Array.isArray(modulosGlobais.modulos)) {
      modulosGlobais = modulosGlobais.modulos
      console.log('✅ Usando propriedade modulos da resposta')
    }
    
    // Se ainda não é um array, tentar converter ou usar array vazio
    if (!Array.isArray(modulosGlobais)) {
      console.log('⚠️ Resposta não é um array, usando array vazio')
      modulosGlobais = []
    }
    
    console.log('✅ Módulos globais carregados:', modulosGlobais.length)
    console.log('📋 Lista de módulos globais:', JSON.stringify(modulosGlobais, null, 2))
    
    // Se não há módulos globais cadastrados, criar módulos básicos baseados nos códigos liberados
    // Isso é um fallback temporário até que a tabela modulosmobile seja populada corretamente
    if (modulosGlobais.length === 0 && codigosLiberados.length > 0) {
      console.log('⚠️ Nenhum módulo global encontrado na API, criando módulos básicos baseados nos códigos liberados...')
      
      // Criar módulos básicos usando apenas os códigos liberados
      modulosGlobais = codigosLiberados.map(codigo => ({
        modu_codi: codigo,
        modu_nome: `Modulo_${codigo}`,
        modu_desc: `Módulo ${codigo}`,
        modu_ativ: true,
        modu_ordem: codigo
      }))
      
      console.log('✅ Módulos básicos criados:', modulosGlobais.length)
      console.log('📋 Lista de módulos básicos:', JSON.stringify(modulosGlobais, null, 2))
    } else if (modulosGlobais.length === 0) {
      console.log('⚠️ Nenhum módulo encontrado na API e nenhum código liberado. Verifique se a tabela modulosmobile está populada.')
      return []
    }
    
    // Filtrar módulos globais pelos códigos liberados
    if (!Array.isArray(modulosGlobais)) {
      console.error('❌ modulosGlobais não é um array:', modulosGlobais)
      return []
    }
    
    const modulosPermitidos = modulosGlobais.filter(modulo =>
      codigosLiberados.includes(modulo.modu_codi)
    )
    
    console.log('🎯 Módulos com permissão:', modulosPermitidos.length)
    console.log('📋 Lista de módulos permitidos:', JSON.stringify(modulosPermitidos, null, 2))
    
    // Salvar os módulos no AsyncStorage para uso futuro
    if (modulosPermitidos.length > 0) {
      await AsyncStorage.setItem('modulos', JSON.stringify(modulosPermitidos))
      console.log('💾 Módulos salvos no AsyncStorage')
    }
    
    return modulosPermitidos
    
  } catch (error) {
    console.error('❌ Erro ao carregar módulos permitidos:', error)
    return []
  }
}
