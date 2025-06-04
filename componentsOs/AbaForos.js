import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import Toast from 'react-native-toast-message'
import { Ionicons } from '@expo/vector-icons'
import { apiPostComContexto, apiGetComContexto } from '../utils/api'
import useContextoApp from '../hooks/useContextoApp'

const { width } = Dimensions.get('window')
const PHOTO_SIZE = (width - 60) / 2
const API_BASE_URL = 'http://192.168.0.39:8000/api/casaa'

export default function AbaFotos({ fotos = [], setFotos, orde_nume }) {
  const { token, documentoEmpresa } = useContextoApp()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [removidos, setRemovidos] = useState([])
  const [fotosLista, setFotosLista] = useState(fotos)

  useEffect(() => {
    if (orde_nume) {
      carregarFotosExistentes()
    }
  }, [orde_nume])

  const carregarFotosExistentes = async () => {
    try {
      setIsLoading(true)
      console.log('Carregando fotos para OS:', orde_nume)
      
      const response = await apiGetComContexto(
        'ordemdeservico/fotos/',
        {
          foto_orde: orde_nume,
          foto_empr: 1,
          foto_fili: 1
        }
      )
      
      console.log('Resposta da API:', response)

      // Combina todas as fotos dos diferentes momentos
      const todasFotos = [
        ...(response.antes || []),
        ...(response.durante || []),
        ...(response.depois || [])
      ]

      if (todasFotos.length > 0) {
        const fotosFormatadas = todasFotos.map(foto => ({
          foto_id: foto.foto_id,
          foto_uri: foto.foto_uri,
          foto_desc: foto.foto_desc,
          foto_momento: foto.foto_momento || 'durante',
          timestamp: foto.foto_data
        }))
        
        console.log('Fotos formatadas:', fotosFormatadas)
        setFotosLista(fotosFormatadas)
        setFotos(fotosFormatadas)
      } else {
        console.log('Nenhuma foto encontrada')
        setFotosLista([])
        setFotos([])
      }
    } catch (error) {
      console.error('Erro ao carregar fotos:', error.response?.data || error.message)
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar fotos',
        text2: error.response?.data?.error || 'Não foi possível carregar as fotos existentes',
      })
      setFotosLista([])
      setFotos([])
    } finally {
      setIsLoading(false)
    }
  }

  const sincronizarComPai = (novos) => {
    setFotosLista(novos)
    setFotos(novos)
  }

  const solicitarPermissao = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Toast.show({
        type: 'error',
        text1: 'Permissão negada',
        text2: 'Você precisa permitir o acesso às fotos para continuar.',
      })
      return false
    }
    return true
  }

  const adicionarFoto = async () => {
    if (isLoading || isSubmitting) return
    
    try {
      setIsSubmitting(true)
      
      const temPermissao = await solicitarPermissao()
      if (!temPermissao) return

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        quality: 0.7,
        allowsEditing: true,
        aspect: [4, 3],
      })

      if (!result.canceled && result.assets?.[0]?.uri) {
        // Preparar o arquivo para upload
        const localUri = result.assets[0].uri
        const filename = localUri.split('/').pop()
        const match = /\.(\w+)$/.exec(filename)
        const type = match ? `image/${match[1]}` : 'image/jpeg'

        // Criar o FormData
        const formData = new FormData()
        
        // Adicionando a foto como arquivo
        formData.append('foto', {
          uri: Platform.OS === 'ios' ? localUri.replace('file://', '') : localUri,
          name: filename,
          type
        })

        // Adicionando os metadados como campos separados
        formData.append('foto_orde', orde_nume.toString())
        formData.append('foto_empr', '1')
        formData.append('foto_fili', '1')
        formData.append('foto_desc', 'Foto da O.S')
        formData.append('foto_tipo', 'OS')
        formData.append('foto_momento', 'durante')
        formData.append('empr', '1')
        formData.append('fili', '1')
        formData.append('usua', '1')

        console.log('FormData sendo enviado:', Object.fromEntries(formData._parts))

        const response = await fetch(`${API_BASE_URL}/ordemdeservico/fotos/upload/`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
            'X-Docu': documentoEmpresa,
            'X-Empresa': '1',
            'X-Filial': '1',
            'X-Username': 'admin',
            'X-Usuario-Id': '1'
          },
          body: formData
        })

        const responseData = await response.json()

        if (!response.ok) {
          throw new Error(responseData.error || 'Erro ao fazer upload da foto')
        }

        console.log('Resposta do upload:', responseData)

        if (responseData.foto_id) {
          const novaFoto = {
            foto_id: responseData.foto_id,
            foto_uri: responseData.foto_uri || localUri,
            foto_desc: responseData.foto_desc || 'Foto da O.S',
            foto_momento: responseData.foto_momento || 'durante',
            timestamp: responseData.foto_data || new Date().toISOString()
          }

          sincronizarComPai([...fotosLista, novaFoto])
          
          Toast.show({
            type: 'success',
            text1: 'Foto adicionada com sucesso!',
          })
        } else {
          throw new Error('Resposta inválida do servidor')
        }
      }
    } catch (error) {
      console.error('Erro detalhado ao adicionar foto:', error.response?.data || error)
      Toast.show({
        type: 'error',
        text1: 'Erro ao adicionar foto',
        text2: error.response?.data?.error || error.message || 'Tente novamente mais tarde',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const removerFoto = async (foto) => {
    try {
      if (foto.foto_id) {
        await apiPostComContexto(
          'ordemdeservico/fotos/delete/',
          {
            foto_id: foto.foto_id,
            foto_orde: orde_nume.toString(),
            foto_empr: '1',
            foto_fili: '1'
          }
        )
      }

      const atualizadas = fotosLista.filter((f) => f !== foto)
      sincronizarComPai(atualizadas)
      
      Toast.show({
        type: 'success',
        text1: 'Foto removida com sucesso',
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao remover foto',
        text2: error.response?.data?.error || error.message || 'Tente novamente mais tarde',
      })
    }
  }

  const renderItem = ({ item }) => (
    <View style={styles.fotoContainer}>
      <Image source={{ uri: item.foto_uri }} style={styles.foto} />
      <TouchableOpacity
        style={styles.btnRemover}
        onPress={() => removerFoto(item)}>
        <Ionicons name="close-circle" size={24} color="white" />
      </TouchableOpacity>
      <View style={styles.infoContainer}>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleTimeString()}
        </Text>
        <Text style={styles.momento}>
          {item.foto_momento}
        </Text>
      </View>
    </View>
  )

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#10a2a7" />
        <Text style={styles.loadingText}>Carregando fotos...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.botaoAdicionar, (isLoading || isSubmitting) && styles.botaoDesabilitado]}
        onPress={adicionarFoto}
        disabled={isLoading || isSubmitting}>
        {isSubmitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <Ionicons name="camera" size={24} color="white" style={styles.icone} />
            <Text style={styles.textoBotao}>Adicionar Foto</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.listContainer}>
        <FlatList
          data={fotosLista}
          keyExtractor={(item) => item.foto_id?.toString() || item.foto_uri}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.listaContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="images-outline" size={48} color="#666" />
              <Text style={styles.emptyText}>
                Nenhuma foto adicionada
              </Text>
              <Text style={styles.emptySubtext}>
                Toque no botão acima para adicionar fotos
              </Text>
            </View>
          }
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a2f3d',
    padding: 20,
  },
  listContainer: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  listaContainer: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  fotoContainer: {
    margin: 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#232935',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  foto: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 12,
  },
  btnRemover: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,0,0,0.7)',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  timestamp: {
    color: 'white',
    fontSize: 12,
  },
  momento: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  botaoAdicionar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10a2a7',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  botaoDesabilitado: {
    opacity: 0.7,
  },
  textoBotao: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  icone: {
    marginRight: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 40,
  },
  emptyText: {
    color: '#666',
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
})

