import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Linking,
  ActivityIndicator,
  StyleSheet,
  Image,
  Alert,
  Platform,
  Modal,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { WebView } from 'react-native-webview'
import Toast from 'react-native-toast-message'
import {
  apiGetComContexto,
  apiPatchComContexto,
  apiPostComContexto,
} from '../utils/api'
import { ScrollView } from 'react-native-web'

const formatarData = (valor) => {
  if (!valor) return ''
  try {
    const d = new Date(valor)
    if (Number.isNaN(d.getTime())) return String(valor)
    return d.toLocaleString()
  } catch {
    return String(valor)
  }
}

const detectarMime = (base64, nome, tipo) => {
  if (tipo && typeof tipo === 'string') {
    const t = tipo.toLowerCase()
    if (t.includes('/')) return t
    // se vier só extensão em tipo
    if (t === 'png') return 'image/png'
    if (t === 'jpg' || t === 'jpeg') return 'image/jpeg'
    if (t === 'pdf') return 'application/pdf'
    if (t === 'docx')
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }
  if (nome && typeof nome === 'string') {
    const ext = nome.split('.').pop()?.toLowerCase()
    if (ext === 'png') return 'image/png'
    if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
    if (ext === 'pdf') return 'application/pdf'
    if (ext === 'docx')
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }
  // assinaturas base64
  if (typeof base64 === 'string') {
    if (base64.startsWith('iVBORw0KGgo')) return 'image/png'
    if (base64.startsWith('/9j/')) return 'image/jpeg'
    if (base64.startsWith('JVBERi0')) return 'application/pdf'
    if (base64.startsWith('UEsDB')) {
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    }
  }
  return 'application/octet-stream'
}

const montarPreviewUri = (item) => {
  const base =
    item?.arquivo_base64 ||
    item?.arquivoBase64 ||
    item?.preview ||
    item?.base64 ||
    item?.arquivo_base64_preview
  if (!base) return null
  if (typeof base !== 'string') return null
  const baseLimpa = base.trim()
  if (baseLimpa.startsWith('data:')) return baseLimpa

  const mime = detectarMime(baseLimpa, item?.nome, item?.tipo)
  return `data:${mime};base64,${baseLimpa}`
}

export default function AbaArquivos({ orde_nume }) {
  const [arquivos, setArquivos] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [abrindoId, setAbrindoId] = useState(null)

  const [nomeAtual, setNomeAtual] = useState('')
  const [pendentes, setPendentes] = useState([])
  const [permissoesImagemOk, setPermissoesImagemOk] = useState(false)
  const [modalVisivel, setModalVisivel] = useState(false)
  const [itemSelecionado, setItemSelecionado] = useState(null)

  const endpointBase = useMemo(() => {
    if (!orde_nume) return null
    return `ordemdeservico/ordens/${orde_nume}`
  }, [orde_nume])

  const carregarArquivos = useCallback(async () => {
    if (!endpointBase) return
    setIsLoading(true)
    try {
      const res = await apiGetComContexto(`${endpointBase}/arquivos/`)
      const lista = Array.isArray(res?.results) ? res.results : res
      setArquivos(Array.isArray(lista) ? lista : [])
    } catch (error) {
      setArquivos([])
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.erro ||
        error?.message ||
        'Falha ao carregar arquivos'
      Toast.show({ type: 'error', text1: 'Arquivos', text2: String(msg) })
    } finally {
      setIsLoading(false)
    }
  }, [endpointBase])

  useEffect(() => {
    if (orde_nume) carregarArquivos()
  }, [orde_nume, carregarArquivos])

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
            'Para usar a câmera e galeria, é necessário conceder as permissões.',
          )
        }
      } catch (e) {
        console.warn('Erro ao solicitar permissões de imagem:', e?.message)
      }
    }
    solicitarPermissoesImagem()
  }, [])

  const abrirArquivo = useCallback(
    async (item) => {
      if (!endpointBase) return
      const arquivoId = item?.id ?? item?.arqu_codi_arqu ?? item?.os_arqu
      if (arquivoId == null) {
        Toast.show({
          type: 'error',
          text1: 'Arquivo',
          text2: 'Identificador do arquivo indisponível',
        })
        return
      }

      setAbrindoId(arquivoId)
      let detalhe = null
      try {
        detalhe = await apiGetComContexto(
          `${endpointBase}/arquivos/${arquivoId}/`,
        )
      } catch (error) {
        const msg =
          error?.response?.data?.detail ||
          error?.response?.data?.erro ||
          error?.message ||
          'Falha ao buscar arquivo'
        Toast.show({ type: 'error', text1: 'Arquivo', text2: String(msg) })
        return
      } finally {
        setAbrindoId(null)
      }

      const base64 = detalhe?.arquivo_base64 || detalhe?.arquivoBase64
      const nome = detalhe?.nome || item?.nome
      const tipo = detalhe?.tipo || item?.tipo
      const dataUri = montarPreviewUri({ nome, tipo, arquivo_base64: base64 })

      if (!dataUri) {
        Toast.show({
          type: 'error',
          text1: 'Arquivo',
          text2: 'Base64 do arquivo indisponível',
        })
        return
      }

      setItemSelecionado({ ...detalhe, dataUri })
      setModalVisivel(true)
    },
    [endpointBase],
  )

  const removerPendente = useCallback((index) => {
    setPendentes((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const adicionarPendenteDeAsset = useCallback(
    (asset) => {
      if (!asset?.base64) {
        Toast.show({
          type: 'error',
          text1: 'Upload',
          text2: 'Não foi possível processar a imagem selecionada',
        })
        return
      }

      const mime =
        asset?.type === 'video' ? 'video/mp4' : asset?.mimeType || 'image/jpeg'
      const nomeDerivado =
        (nomeAtual && nomeAtual.trim()) ||
        asset?.fileName ||
        (mime.includes('png') ? 'imagem.png' : 'imagem.jpg')

      const base64DataUri = `data:${mime};base64,${asset.base64}`

      setPendentes((prev) => [
        ...prev,
        { nome: nomeDerivado, base64: base64DataUri },
      ])
      setNomeAtual('')

      Toast.show({
        type: 'success',
        text1: 'Arquivo preparado',
        text2: `${nomeDerivado} adicionado à fila`,
      })
    },
    [nomeAtual],
  )

  const tirarFoto = useCallback(async () => {
    if (!permissoesImagemOk) {
      Alert.alert('Permissão necessária', 'Permissão de câmera não concedida.')
      return
    }
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        base64: true,
        exif: false,
      })
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0]
        adicionarPendenteDeAsset(asset)
      }
    } catch (e) {
      console.error('Erro ao abrir câmera:', e)
      Alert.alert('Erro', `Não foi possível abrir a câmera: ${e.message}`)
    }
  }, [permissoesImagemOk, adicionarPendenteDeAsset])

  const escolherImagem = useCallback(async () => {
    if (!permissoesImagemOk) {
      Alert.alert('Permissão necessária', 'Permissão de galeria não concedida.')
      return
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        base64: true,
        exif: false,
        allowsMultipleSelection: Platform.OS === 'web',
      })
      if (!result.canceled && result.assets && result.assets.length > 0) {
        if (Array.isArray(result.assets)) {
          result.assets.forEach((asset) => adicionarPendenteDeAsset(asset))
        }
      }
    } catch (e) {
      console.error('Erro ao abrir galeria:', e)
      Alert.alert('Erro', `Não foi possível abrir a galeria: ${e.message}`)
    }
  }, [permissoesImagemOk, adicionarPendenteDeAsset])

  const enviar = useCallback(async () => {
    if (!endpointBase) return

    if (pendentes.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Upload',
        text2: 'Adicione um arquivo para enviar',
      })
      return
    }

    const payload = {
      numero_os: Number(orde_nume),
      arquivos: pendentes,
    }

    setIsUploading(true)
    try {
      try {
        await apiPatchComContexto(`${endpointBase}/arquivos/upload/`, payload)
      } catch (errorPatch) {
        const status = errorPatch?.response?.status
        if (status === 404 || status === 405) {
          await apiPostComContexto(`${endpointBase}/arquivos/upload/`, payload)
        } else {
          throw errorPatch
        }
      }

      Toast.show({
        type: 'success',
        text1: 'Upload',
        text2: 'Arquivo(s) enviado(s) com sucesso',
      })
      setPendentes([])
      setNomeAtual('')
      await carregarArquivos()
    } catch (error) {
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.erro ||
        error?.message ||
        'Falha ao enviar arquivos'
      Toast.show({ type: 'error', text1: 'Upload', text2: String(msg) })
    } finally {
      setIsUploading(false)
    }
  }, [endpointBase, nomeAtual, pendentes, orde_nume, carregarArquivos])

  const renderItem = ({ item }) => {
    const previewUri = montarPreviewUri(item)
    const isImg =
      typeof previewUri === 'string' && previewUri.startsWith('data:image/')
    const nome = item?.nome || 'Arquivo'
    const tipo = item?.tipo || ''
    const data = formatarData(item?.data)
    const itemId = item?.id ?? item?.arqu_codi_arqu ?? item?.os_arqu

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {nome}
          </Text>
          <TouchableOpacity
            style={styles.abrirBtn}
            onPress={() => abrirArquivo(item)}>
            <Text style={styles.abrirBtnText}>
              {abrindoId != null && String(abrindoId) === String(itemId)
                ? 'Abrindo...'
                : 'Abrir'}
            </Text>
          </TouchableOpacity>
        </View>

        {!!tipo && <Text style={styles.cardMeta}>Tipo: {tipo}</Text>}
        {!!data && <Text style={styles.cardMeta}>Data: {data}</Text>}

        {isImg && previewUri ? (
          <Image
            source={{ uri: previewUri }}
            style={styles.preview}
            resizeMode="contain"
          />
        ) : (
          <Text style={styles.previewIndisp}>Sem preview</Text>
        )}
      </View>
    )
  }

  return (
    
    <View style={styles.container}>
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, isLoading && styles.actionBtnDisabled]}
          onPress={carregarArquivos}
          disabled={isLoading}>
          <Text style={styles.actionBtnText}>
            {isLoading ? 'Atualizando...' : 'Atualizar'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Enviar Arquivos</Text>

        <Text style={styles.label}>Nome (opcional):</Text>
        <TextInput
          style={styles.input}
          value={nomeAtual}
          onChangeText={setNomeAtual}
          placeholder="ex: foto.jpg"
          placeholderTextColor="#8aa0b2"
        />

        <View style={[styles.uploadRow, { marginBottom: 10 }]}>
          <TouchableOpacity
            onPress={tirarFoto}
            style={[
              styles.secondaryBtn,
              { opacity: permissoesImagemOk ? 1 : 0.6 },
            ]}
            disabled={!permissoesImagemOk || isUploading}>
            <Text style={styles.secondaryBtnText}>Tirar Foto</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={escolherImagem}
            style={[
              styles.secondaryBtn,
              { opacity: permissoesImagemOk ? 1 : 0.6 },
            ]}
            disabled={!permissoesImagemOk || isUploading}>
            <Text style={styles.secondaryBtnText}>Escolher da Galeria</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.uploadRow}>
          <TouchableOpacity
            style={[styles.primaryBtn, isUploading && styles.actionBtnDisabled]}
            onPress={enviar}
            disabled={isUploading || pendentes.length === 0}>
            {isUploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>
                Enviar{pendentes.length ? ` (${pendentes.length})` : ''}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {pendentes.length > 0 && (
          <View style={styles.pendentesBox}>
            <Text style={styles.pendentesTitle}>
              Pendentes: {pendentes.length}
            </Text>
            {pendentes.map((p, idx) => (
              <View key={`${p.nome}-${idx}`} style={styles.pendenteRow}>
                <Text style={styles.pendenteNome} numberOfLines={1}>
                  {p.nome}
                </Text>
                <TouchableOpacity onPress={() => removerPendente(idx)}>
                  <Text style={styles.removerText}>Remover</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
  

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Arquivos Anexados</Text>
        <FlatList
          data={arquivos}
          keyExtractor={(item, index) =>
            String(item?.id ?? item?.os_arqu ?? item?.arqu_codi_arqu ?? index)
          }
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {isLoading ? 'Carregando...' : 'Nenhum arquivo anexado'}
            </Text>
          }
        />
      </View>
     

      <Modal
        visible={modalVisivel}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisivel(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {(() => {
              const dataUri = itemSelecionado?.dataUri
              if (typeof dataUri !== 'string') {
                return (
                  <Text style={styles.previewIndisp}>
                    Pré-visualização indisponível
                  </Text>
                )
              }
              const tipo =
                itemSelecionado?.tipo ||
                (dataUri.startsWith('data:')
                  ? dataUri.split(';')[0].split(':')[1]
                  : '')
              const isImg =
                typeof tipo === 'string'
                  ? tipo.startsWith('image/')
                  : dataUri.startsWith('data:image')
              if (isImg) {
                return (
                  <Image
                    source={{ uri: dataUri }}
                    style={styles.modalPreviewImg}
                    resizeMode="contain"
                  />
                )
              }
              return (
                <View style={styles.webviewBox}>
                  <WebView source={{ uri: dataUri }} style={styles.webview} />
                </View>
              )
            })()}
            <View style={styles.modalButtons}>
              {Platform.OS === 'web' && itemSelecionado?.dataUri ? (
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => {
                    try {
                      Linking.openURL(itemSelecionado.dataUri)
                    } catch {}
                  }}>
                  <Text style={styles.secondaryBtnText}>
                    Abrir em nova guia
                  </Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => setModalVisivel(false)}>
                <Text style={styles.primaryBtnText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  actionBtn: {
    backgroundColor: '#1f3a4a',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  actionBtnDisabled: {
    opacity: 0.6,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#0f2633',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontWeight: '700',
    marginBottom: 10,
  },
  label: {
    color: '#cfe6f5',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#1a3b4d',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    backgroundColor: '#102d3b',
    marginBottom: 10,
  },
  inputMultiline: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  uploadRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#10a2a7',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#1f3a4a',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  pendentesBox: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1a3b4d',
    paddingTop: 10,
  },
  pendentesTitle: {
    color: '#fff',
    fontWeight: '700',
    marginBottom: 8,
  },
  pendenteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  pendenteNome: {
    color: '#cfe6f5',
    flex: 1,
    marginRight: 10,
  },
  removerText: {
    color: '#ffb4b4',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#102d3b',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1a3b4d',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardTitle: {
    color: '#fff',
    fontWeight: '700',
    flex: 1,
  },
  abrirBtn: {
    backgroundColor: '#1f3a4a',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  abrirBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  cardMeta: {
    color: '#cfe6f5',
    marginTop: 6,
  },
  preview: {
    width: '100%',
    height: 180,
    marginTop: 10,
    backgroundColor: '#0b1a22',
    borderRadius: 10,
  },
  previewIndisp: {
    color: '#8aa0b2',
    marginTop: 10,
  },
  emptyText: {
    color: '#8aa0b2',
    paddingVertical: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  modalContent: {
    width: '100%',
    maxWidth: 900,
    backgroundColor: '#0f2633',
    borderRadius: 12,
    padding: 12,
  },
  modalPreviewImg: {
    width: '100%',
    height: 520,
    backgroundColor: '#0b1a22',
    borderRadius: 8,
  },
  webviewBox: {
    width: '100%',
    height: 520,
    backgroundColor: '#0b1a22',
    borderRadius: 8,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  modalButtons: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
})
