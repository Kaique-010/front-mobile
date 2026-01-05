import React, { useState, useEffect } from 'react'
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Image,
  Platform,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getStoredData } from '../services/storageService'
import { Picker } from '@react-native-picker/picker'
import {
  apiGetComContexto,
  apiPutComContextoSemFili,
  apiPostComContextoSemFili,
} from '../utils/api'

export default function ProdutoDados({
  produto,
  atualizarProduto,
  navigation,
}) {
  const [nome, setNome] = useState(produto?.prod_nome || '')
  const [unidade, setUnidade] = useState(produto?.prod_unme || '')
  const [ncm, setNcm] = useState(
    produto?.prod_ncm
      ? String(produto.prod_ncm)
      : produto?.ncm
      ? String(produto.ncm)
      : ''
  )
  const [empresa, setEmpresa] = useState('')
  const [unidades, setUnidades] = useState([])
  const [loadingUnidades, setLoadingUnidades] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [slug, setSlug] = useState('')
  const [fotoBase64, setFotoBase64] = useState('')
  const [fotoUri, setFotoUri] = useState('')
  const [permissoesImagemOk, setPermissoesImagemOk] = useState(false)

  useEffect(() => {
    const carregarContexto = async () => {
      try {
        const dados = await getStoredData()
        if (dados?.slug) setSlug(dados.slug)
        else console.warn('Slug não encontrado')

        const empresaId = await AsyncStorage.getItem('empresaId')
        setEmpresa(empresaId || '')
      } catch (err) {
        console.error('Erro ao carregar contexto:', err.message)
      }
    }

    carregarContexto()
  }, [])

  useEffect(() => {
    if (!slug) return

    const carregarUnidades = async () => {
      setLoadingUnidades(true)
      try {
        const data = await apiGetComContexto('produtos/unidadesmedida/')
        setUnidades(data)
      } catch (error) {
        console.error('Erro ao carregar unidades:', error)
        Alert.alert('Erro', 'Não foi possível carregar unidades.')
      } finally {
        setLoadingUnidades(false)
      }
    }

    carregarUnidades()
  }, [slug])

  useEffect(() => {
    const solicitarPermissoesImagem = async () => {
      try {
        const cam = await ImagePicker.requestCameraPermissionsAsync()
        const lib = await ImagePicker.requestMediaLibraryPermissionsAsync()
        const granted = cam.status === 'granted' && lib.status === 'granted'
        setPermissoesImagemOk(granted)
        if (!granted) {
          Alert.alert(
            'Permissões necessárias',
            'Para usar a câmera e galeria, é necessário conceder as permissões.'
          )
        }
      } catch (e) {
        console.warn('Erro ao solicitar permissões de imagem:', e?.message)
      }
    }
    solicitarPermissoesImagem()
  }, [])

  const tirarFoto = async () => {
    if (!permissoesImagemOk) {
      Alert.alert('Permissão necessária', 'Permissão de câmera não concedida.')
      return
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5, // Reduzido de 0.6 para 0.5
        base64: true,
        exif: false, // Não precisa de dados EXIF
      })

      console.log('📸 Resultado da câmera:', { canceled: result.canceled })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0]
        console.log('📸 Asset recebido:', {
          uri: asset.uri?.substring(0, 50),
          hasBase64: !!asset.base64,
          base64Length: asset.base64?.length || 0,
        })

        if (asset.base64) {
          setFotoBase64(asset.base64)
          setFotoUri(asset.uri)
          console.log('✅ Foto capturada com sucesso')
        } else {
          console.warn('⚠️ Base64 não disponível')
          Alert.alert('Aviso', 'Não foi possível processar a imagem.')
        }
      }
    } catch (e) {
      console.error('❌ Erro ao abrir câmera:', e)
      Alert.alert('Erro', `Não foi possível abrir a câmera: ${e.message}`)
    }
  }

  const escolherImagem = async () => {
    if (!permissoesImagemOk) {
      Alert.alert('Permissão necessária', 'Permissão de galeria não concedida.')
      return
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5, // Reduzido de 0.6 para 0.5
        base64: true,
        exif: false,
      })

      console.log('🖼️ Resultado da galeria:', { canceled: result.canceled })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0]
        console.log('🖼️ Asset recebido:', {
          uri: asset.uri?.substring(0, 50),
          hasBase64: !!asset.base64,
          base64Length: asset.base64?.length || 0,
        })

        if (asset.base64) {
          setFotoBase64(asset.base64)
          setFotoUri(asset.uri)
          console.log('✅ Imagem selecionada com sucesso')
        } else {
          console.warn('⚠️ Base64 não disponível')
          Alert.alert('Aviso', 'Não foi possível processar a imagem.')
        }
      }
    } catch (e) {
      console.error('❌ Erro ao abrir galeria:', e)
      Alert.alert('Erro', `Não foi possível abrir a galeria: ${e.message}`)
    }
  }

  const removerImagem = () => {
    setFotoBase64('')
    setFotoUri('')
  }

  const salvar = async () => {
    // Validação rigorosa de dados
    if (!nome || nome.trim() === '') {
      Alert.alert('Erro', 'Nome do produto é obrigatório')
      return
    }

    setSalvando(true)

    try {
      // Garantir empresa válida do AsyncStorage
      const empresaIdStorage = await AsyncStorage.getItem('empresaId')
      const empresaId =
        empresaIdStorage && !isNaN(parseInt(empresaIdStorage))
          ? parseInt(empresaIdStorage)
          : 1

      // Preparar payload com validação de tipos
      const payload = {
        prod_nome: String(nome).trim(),
        prod_unme: unidade ? String(unidade).trim() : 'UN',
        prod_ncm: ncm ? String(ncm).trim() : '',
        prod_empr: empresaId,
      }

      // Melhor tratamento da imagem
      if (
        fotoBase64 &&
        typeof fotoBase64 === 'string' &&
        fotoBase64.trim().length > 0
      ) {
        const base64Clean = fotoBase64.trim()

        // Verifica o tamanho (máximo ~4MB em base64 = ~3MB original)
        const tamanhoEstimado = (base64Clean.length * 3) / 4
        console.log(
          `📦 Tamanho estimado da imagem: ${(
            tamanhoEstimado /
            1024 /
            1024
          ).toFixed(2)}MB`
        )

        if (tamanhoEstimado > 5 * 1024 * 1024) {
          // 5MB
          Alert.alert(
            'Erro',
            'Imagem muito grande. Por favor, tire uma foto com menor resolução.'
          )
          setSalvando(false)
          return
        }

        // Remove prefixo data URL se já existir
        const base64SemPrefixo = base64Clean.replace(
          /^data:image\/\w+;base64,/,
          ''
        )
        payload.prod_foto = `data:image/jpeg;base64,${base64SemPrefixo}`
      }

      // Validação adicional
      if (payload.prod_nome.length > 255) {
        Alert.alert(
          'Erro',
          'Nome do produto muito longo (máximo 255 caracteres)'
        )
        setSalvando(false)
        return
      }

      if (payload.prod_ncm && payload.prod_ncm.length > 20) {
        Alert.alert('Erro', 'NCM muito longo (máximo 20 caracteres)')
        setSalvando(false)
        return
      }

      if (payload.prod_unme && payload.prod_unme.length > 10) {
        Alert.alert('Erro', 'Unidade muito longa (máximo 10 caracteres)')
        setSalvando(false)
        return
      }

      // Logs detalhados para debug
      console.log('🔍 [PRODUTO-DEBUG] Payload validado:')
      console.log(
        '- Nome:',
        `"${payload.prod_nome}" (${typeof payload.prod_nome}, length: ${
          payload.prod_nome.length
        })`
      )
      console.log(
        '- Unidade:',
        `"${payload.prod_unme}" (${typeof payload.prod_unme})`
      )
      console.log(
        '- NCM:',
        `"${payload.prod_ncm}" (${typeof payload.prod_ncm})`
      )
      console.log(
        '- Empresa ID:',
        `${payload.prod_empr} (${typeof payload.prod_empr})`
      )
      console.log('- Produto código:', produto?.prod_codi)
      console.log('- prod_foto presente:', !!payload.prod_foto)
      console.log(
        '- prod_foto tamanho:',
        payload.prod_foto ? payload.prod_foto.length : 0
      )
      console.log('- Platform:', Platform.OS)

      if (produto?.prod_codi) {
        console.log(
          '🚀 [PRODUTO-UPDATE] Atualizando produto:',
          produto.prod_codi
        )

        // Usar empresaId garantido na URL também
        const response = await apiPutComContextoSemFili(
          `produtos/produtos/${empresaId}/${produto.prod_codi}/`,
          payload,
          'prod_'
        )

        console.log('✅ [PRODUTO-UPDATE] Resposta do servidor:', response)
        Alert.alert('Sucesso', 'Produto atualizado com sucesso!')

        if (typeof atualizarProduto === 'function') {
          atualizarProduto({ ...payload, prod_codi: produto.prod_codi })
        } else {
          console.warn('⚠️ atualizarProduto não é uma função em ProdutoDados')
        }

        if (navigation && navigation.navigate) {
          navigation.navigate('Preços')
        } else {
          console.warn('⚠️ Navigation não disponível em ProdutoDados')
        }
      } else {
        console.log('🚀 [PRODUTO-CREATE] Criando novo produto')

        const response = await apiPostComContextoSemFili(
          `produtos/produtos/`,
          payload,
          'prod_'
        )

        console.log('✅ [PRODUTO-CREATE] Resposta do servidor:', response)
        const prod_codi = response?.prod_codi || response?.data?.prod_codi

        if (!prod_codi) {
          throw new Error('Código do produto não retornado pela API')
        }

        Alert.alert('Criado', `Produto criado com código: ${prod_codi}`)
        const novoProduto = { ...payload, prod_codi }

        if (typeof atualizarProduto === 'function') {
          atualizarProduto(novoProduto)
        } else {
          console.warn('⚠️ atualizarProduto não é uma função em ProdutoDados')
        }

        if (navigation && navigation.navigate) {
          navigation.navigate('Preços')
        } else {
          console.warn('⚠️ Navigation não disponível em ProdutoDados')
        }
      }
    } catch (err) {
      console.error('❌ [PRODUTO-ERROR] Erro completo:')
      console.error('- Status:', err?.response?.status)
      console.error('- Data:', JSON.stringify(err?.response?.data, null, 2))
      console.error('- Headers:', err?.response?.headers)
      console.error('- Config URL:', err?.config?.url)
      console.error('- Config Method:', err?.config?.method)
      console.error('- Message:', err?.message)

      let errorMessage = 'Erro ao salvar produto.'

      if (err?.response?.status === 500) {
        errorMessage =
          'Erro interno do servidor. Verifique os dados enviados:\n\n' +
          `Nome: "${nome}"\n` +
          `Unidade: "${unidade}"\n` +
          `NCM: "${ncm}"\n` +
          `Tem foto: ${fotoBase64 ? 'Sim' : 'Não'}`
      } else if (err?.response?.status === 400) {
        const errorData = err?.response?.data
        if (typeof errorData === 'object') {
          const errors = Object.entries(errorData)
            .map(([field, messages]) => {
              const msgs = Array.isArray(messages)
                ? messages.join(', ')
                : messages
              return `${field}: ${msgs}`
            })
            .join('\n')
          errorMessage = `Dados inválidos:\n${errors}`
        } else {
          errorMessage = errorData || 'Dados inválidos enviados.'
        }
      } else if (err?.response?.status === 413) {
        errorMessage = 'Imagem muito grande. Tire uma foto com menor resolução.'
      } else if (err?.response?.status === 401) {
        errorMessage = 'Sessão expirada. Faça login novamente.'
      } else if (err?.response?.status === 403) {
        errorMessage = 'Você não tem permissão para realizar esta operação.'
      } else if (err?.response?.status === 404) {
        errorMessage = 'Produto não encontrado.'
      } else if (err.message?.includes('Network')) {
        errorMessage = 'Erro de conexão. Verifique sua internet.'
      }

      Alert.alert('Erro', errorMessage)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Descrição do Produto</Text>
      <TextInput
        placeholder="Nome do Produto"
        value={nome}
        onChangeText={setNome}
        style={styles.input}
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Unidade de Medida</Text>
      {loadingUnidades ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Picker
          selectedValue={unidade}
          onValueChange={setUnidade}
          style={styles.input}>
          <Picker.Item label="Selecione uma unidade" value="" />
          {unidades.map((u) => (
            <Picker.Item
              key={u.unid_codi}
              label={u.unid_desc}
              value={u.unid_codi}
            />
          ))}
        </Picker>
      )}

      <Text style={styles.label}>NCM</Text>
      <TextInput
        placeholder="Inclua um NCM"
        value={ncm}
        onChangeText={setNcm}
        style={styles.input}
        keyboardType="number-pad"
        placeholderTextColor="#999"
      />

      <Text style={styles.labelImagemProduto}>Imagem do Produto</Text>
      {fotoUri ? (
        <View style={styles.previewRow}>
          <Image source={{ uri: fotoUri }} style={styles.imagePreview} />
          <TouchableOpacity
            onPress={removerImagem}
            style={[styles.smallButton, { backgroundColor: '#A20000' }]}>
            <Text style={styles.smallButtonText}>Remover</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          onPress={tirarFoto}
          style={[
            styles.smallButton,
            { opacity: permissoesImagemOk ? 1 : 0.6 },
          ]}
          disabled={!permissoesImagemOk}>
          <Text style={styles.smallButtonText}>Tirar Foto</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={escolherImagem}
          style={[
            styles.smallButton,
            { opacity: permissoesImagemOk ? 1 : 0.6 },
          ]}
          disabled={!permissoesImagemOk}>
          <Text style={styles.smallButtonText}>Escolher da Galeria</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={salvar}
        style={[styles.button, salvando && { opacity: 0.6 }]}
        disabled={salvando}>
        {salvando ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Salvar</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 35, backgroundColor: '#0B141A' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
    padding: 10,
    fontSize: 16,
    color: 'white',
  },
  label: { marginBottom: 4, fontWeight: 'bold', fontSize: 14, color: '#fff' },
  labelImagemProduto: {
    marginBottom: 10,
    marginTop: 20,
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
    color: '#fff',
  },
  button: {
    backgroundColor: '#0058A2',
    padding: 12,
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: { color: 'white', fontWeight: 'bold' },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallButton: {
    backgroundColor: '#0058A2',
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 12,
    marginLeft: 12,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
})
