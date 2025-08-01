import AsyncStorage from '@react-native-async-storage/async-storage'
import { apiGetComContexto } from './api'
import axios from 'axios'
import { BASE_URL } from './api'

export const getModulosComPermissao = async () => {
  try {
    // Primeiro, tentar usar os módulos já salvos no AsyncStorage do login
    const modulosSalvos = await AsyncStorage.getItem('modulos')

    if (modulosSalvos) {
      const modulosParsed = JSON.parse(modulosSalvos)

      if (Array.isArray(modulosParsed) && modulosParsed.length > 0) {
        return modulosParsed
      }
    }

    const token = await AsyncStorage.getItem('access')
    const slug = await AsyncStorage.getItem('slug')
    const empresaId = await AsyncStorage.getItem('empresaId')
    const filialId = await AsyncStorage.getItem('filialId')

    if (!token || !slug) {
      return []
    }

    if (!empresaId || !filialId) {
      return []
    }

    const baseURL = `${BASE_URL}/api/${slug}/parametros-admin`

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
    const responseGlobal = await axios.get(
      `${baseURL}/permissoes-modulos/modulos_disponiveis/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    // A API retorna um objeto com a propriedade 'modulos' que contém o array
    let modulosGlobais = responseGlobal.data || []

    // Se a resposta tem a propriedade 'modulos', usar ela
    if (modulosGlobais.modulos && Array.isArray(modulosGlobais.modulos)) {
      modulosGlobais = modulosGlobais.modulos
    }

    // Se ainda não é um array, tentar converter ou usar array vazio
    if (!Array.isArray(modulosGlobais)) {
      modulosGlobais = []
    }

    // Se não há módulos globais cadastrados, criar módulos básicos baseados nos códigos liberados
    // Isso é um fallback temporário até que a tabela modulosmobile seja populada corretamente
    if (modulosGlobais.length === 0 && codigosLiberados.length > 0) {
      // Criar módulos básicos usando apenas os códigos liberados
      modulosGlobais = codigosLiberados.map((codigo) => ({
        modu_codi: codigo,
        modu_nome: `Modulo_${codigo}`,
        modu_desc: `Módulo ${codigo}`,
        modu_ativ: true,
        modu_ordem: codigo,
      }))
    } else if (modulosGlobais.length === 0) {
      return []
    }

    // Filtrar módulos globais pelos códigos liberados
    if (!Array.isArray(modulosGlobais)) {
      console.error('❌ modulosGlobais não é um array:', modulosGlobais)
      return []
    }

    const modulosPermitidos = modulosGlobais.filter((modulo) =>
      codigosLiberados.includes(modulo.modu_codi)
    )

    // Salvar os módulos no AsyncStorage para uso futuro
    if (modulosPermitidos.length > 0) {
      await AsyncStorage.setItem('modulos', JSON.stringify(modulosPermitidos))
    }

    return modulosPermitidos
  } catch (error) {
    console.error('❌ Erro ao carregar módulos permitidos:', error)
    return []
  }
}
