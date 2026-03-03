import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Modal,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { fetchClienteImagensDepois } from '../../services/clienteService'
import { BASE_URL } from '../../utils/api'

const { width } = Dimensions.get('window')
const COLUMN_COUNT = 3
const ITEM_SIZE = (width - 40) / COLUMN_COUNT - 8

const AbaFotosDepois = ({ ordemId }) => {
  const [imagens, setImagens] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    carregarImagens()
  }, [ordemId])

  const carregarImagens = async () => {
    try {
      setLoading(true)
      const data = await fetchClienteImagensDepois(ordemId)
      setImagens(data)
    } catch (error) {
      console.error('Erro ao carregar imagens depois:', error)
    } finally {
      setLoading(false)
    }
  }

  const getImageUrl = (item) => {
    // Tenta encontrar o campo de imagem em vários formatos possíveis
    // Prioridade para os campos encontrados no debug: imagem_data_uri, imagem_base64
    const possibleFields = [
      'imagem_data_uri',
      'imagem_base64',
      'img_data',
      'imde_foto',
      'foto',
      'imagem',
      'url',
      'arquivo',
      'caminho',
      'path',
      'file',
      'imde_arquivo',
      'image',
      'imde_blob',
    ]

    let path = null
    for (const field of possibleFields) {
      if (item[field]) {
        path = item[field]
        break
      }
    }

    if (!path) {
      // Se não achou em campos conhecidos, tenta pegar o primeiro valor string que parece uma imagem
      const keys = Object.keys(item)
      for (const key of keys) {
        const val = item[key]
        if (
          typeof val === 'string' &&
          (val.startsWith('http') || val.startsWith('/') || val.length > 200)
        ) {
          path = val
          break
        }
      }
    }

    if (!path) return null

    // Verifica se é Base64 (string longa sem prefixo http/https/slash)
    if (
      path.length > 200 &&
      !path.startsWith('http') &&
      !path.startsWith('/')
    ) {
      // Se já tiver o prefixo data:image, retorna direto
      if (path.startsWith('data:image')) return path
      // Assume que é base64 jpeg se não tiver prefixo
      return `data:image/jpeg;base64,${path}`
    }

    if (path.startsWith('http')) return path

    // Tratamento para caminhos relativos
    if (path.startsWith('/')) return `${BASE_URL}${path}`

    return `${BASE_URL}/${path}`
  }

  const renderItem = ({ item }) => {
    const uri = getImageUrl(item)
    if (!uri) return null

    return (
      <TouchableOpacity
        style={styles.imageContainer}
        onPress={() => setSelectedImage(uri)}>
        <Image source={{ uri }} style={styles.thumbnail} resizeMode="cover" />
      </TouchableOpacity>
    )
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00D4FF" />
      </View>
    )
  }

  if (imagens.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="images-outline" size={48} color="#2D2D44" />
        <Text style={styles.emptyText}>Nenhuma imagem encontrada</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={imagens}
        renderItem={renderItem}
        keyExtractor={(item, index) => String(item.id || index)}
        numColumns={COLUMN_COUNT}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={!!selectedImage}
        transparent={true}
        onRequestClose={() => setSelectedImage(null)}
        animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedImage(null)}>
            <Ionicons name="close" size={30} color="#FFFFFF" />
          </TouchableOpacity>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 200,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 200,
  },
  emptyText: {
    marginTop: 12,
    color: '#8B8BA7',
    fontSize: 14,
    textAlign: 'center',
  },
  listContent: {
    padding: 4,
  },
  imageContainer: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#2D2D44',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  fullImage: {
    width: width,
    height: width * 1.5,
  },
})

export default AbaFotosDepois
