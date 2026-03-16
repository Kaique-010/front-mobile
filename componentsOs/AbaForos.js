import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Animated,
  StyleSheet,
} from 'react-native'
import { Modal, Linking, Platform } from 'react-native'
import {
  PinchGestureHandler,
  PanGestureHandler,
  TapGestureHandler,
  State,
} from 'react-native-gesture-handler'
import {
  tirarFotoComGeo,
  enviarFotoEtapa,
  fetchFotos,
} from '../services/fotosApi'
import { BASE_URL, getAuthHeaders } from '../utils/api'
import AsyncStorage from '@react-native-async-storage/async-storage'

const etapas = [
  { key: 'antes', label: 'Antes' },
  { key: 'durante', label: 'Durante' },
  { key: 'depois', label: 'Depois' },
]

export default function AbaForos({ orde_nume, codTecnico }) {
  const NUM_COLUMNS = 3
  const ITEM_HEIGHT = 122

  const [subAba, setSubAba] = useState('antes')
  const [fotos, setFotos] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [imagemSelecionada, setImagemSelecionada] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [slug, setSlug] = useState('')
  const [authHeaders, setAuthHeaders] = useState(null)
  const [secureSources, setSecureSources] = useState({})
  const secureObjectUrlsRef = useRef({})
  const secureLoadsInFlightRef = useRef(new Set())

  const baseScale = useRef(new Animated.Value(1)).current
  const pinchScale = useRef(new Animated.Value(1)).current
  const scale = Animated.multiply(baseScale, pinchScale)
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current
  const lastScaleRef = useRef(1)
  const MIN_SCALE = 1
  const MAX_SCALE = 5
  const pinchRef = useRef()
  const panRef = useRef()
  const doubleTapRef = useRef()

  useEffect(() => {
    const getSlug = async () => {
      const storedSlug = await AsyncStorage.getItem('slug')
      setSlug(storedSlug || '')
    }
    getSlug()
  }, [])

  useEffect(() => {
    const loadAuth = async () => {
      const headers = await getAuthHeaders()
      const token = await AsyncStorage.getItem('access')
      setAuthHeaders({ Authorization: `Bearer ${token}`, ...headers })
    }
    loadAuth()
  }, [])

  useEffect(() => {
    if (orde_nume && slug) {
      loadFotos()
    }
  }, [subAba, orde_nume, slug])

  const loadFotos = async () => {
    try {
      const res = await fetchFotos(subAba, orde_nume)
      if (res && res.length > 0) {
      }

      const fotosSanitizadas = (res || [])
        .filter((item) => item && typeof item === 'object')
        .map((item) => {
          const { imagem_base64, imagem_data_uri, imagem_upload, ...rest } =
            item
          return rest
        })

      const fotosOrdenadas = fotosSanitizadas.slice().sort((a, b) => {
        const aId = getImageId(a)
        const bId = getImageId(b)
        const aNum = Number(aId)
        const bNum = Number(bId)
        if (Number.isFinite(aNum) && Number.isFinite(bNum)) return aNum - bNum
        return String(aId ?? '').localeCompare(String(bId ?? ''))
      })

      setFotos(fotosOrdenadas)
    } catch (error) {
      console.error(`❌ Erro ao carregar fotos da etapa ${subAba}:`, error)
      setFotos([])
    }
  }

  const handleAdd = async () => {
    setIsUploading(true)
    try {
      const data = await tirarFotoComGeo()
      const result = await enviarFotoEtapa({
        etapa: subAba,
        ordemId: orde_nume,
        codTecnico,
        observacao: '',
        data,
      })
      await loadFotos()
    } catch (error) {
      console.error('❌ Erro ao adicionar foto:', error)
      const status = error?.response?.status
      if (status === 413) {
        alert(
          'Foto muito grande para enviar. Tire novamente usando 0,5x ou aproxime do objeto.'
        )
      } else if (typeof error === 'string') {
        alert(error)
      } else {
        alert(`Erro ao adicionar foto: ${error?.message || 'Falha inesperada'}`)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const getImageId = (item) => {
    let imageId
    if (subAba === 'antes') {
      imageId = item.iman_id || item.id
    } else if (subAba === 'durante') {
      imageId = item.imdu_id || item.id
    } else if (subAba === 'depois') {
      imageId = item.imde_id || item.id
    } else {
      imageId = item.id
    }
    return imageId
  }

  const getDirectImageUri = (imageId) => {
    return `${BASE_URL}/api/${slug}/ordemdeservico/imagens-${subAba}/${orde_nume}/${imageId}/bin/`
  }

  const openImage = (item) => {
    const imageId = getImageId(item)
    const directUri = getDirectImageUri(imageId)

    if (Platform.OS === 'web') {
      setImagemSelecionada({
        source: { uri: secureSources[imageId] || directUri },
        item,
      })
    } else if (authHeaders) {
      setImagemSelecionada({
        source: { uri: directUri, headers: authHeaders },
        item,
      })
    } else {
      setImagemSelecionada({ source: { uri: directUri }, item })
    }
    setModalVisible(true)
  }

  const onPinchGestureEvent = Animated.event(
    [{ nativeEvent: { scale: pinchScale } }],
    { useNativeDriver: false },
  )

  const onPanGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: pan.x, translationY: pan.y } }],
    { useNativeDriver: false },
  )

  const onPinchHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      lastScaleRef.current *= event.nativeEvent.scale
      if (lastScaleRef.current < MIN_SCALE) lastScaleRef.current = MIN_SCALE
      if (lastScaleRef.current > MAX_SCALE) lastScaleRef.current = MAX_SCALE
      baseScale.setValue(lastScaleRef.current)
      pinchScale.setValue(1)
    }
  }

  const onPanHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      pan.extractOffset()
    }
  }

  const onDoubleTap = () => {
    lastScaleRef.current =
      lastScaleRef.current > MIN_SCALE ? MIN_SCALE : MAX_SCALE
    baseScale.setValue(lastScaleRef.current)
    pinchScale.setValue(1)
    pan.setValue({ x: 0, y: 0 })
    pan.setOffset({ x: 0, y: 0 })
  }

  useEffect(() => {
    if (modalVisible) {
      lastScaleRef.current = 1
      baseScale.setValue(1)
      pinchScale.setValue(1)
      pan.setValue({ x: 0, y: 0 })
      pan.setOffset({ x: 0, y: 0 })
    }
  }, [modalVisible, imagemSelecionada])

  useEffect(() => {
    if (Platform.OS !== 'web') return

    const urls = secureObjectUrlsRef.current
    return () => {
      for (const key of Object.keys(urls)) {
        try {
          URL.revokeObjectURL(urls[key])
        } catch {}
      }
      secureObjectUrlsRef.current = {}
    }
  }, [])

  useEffect(() => {
    if (Platform.OS !== 'web') return

    const idsAtuais = new Set(
      (fotos || [])
        .map((f) => getImageId(f))
        .filter((id) => id != null)
        .map((id) => String(id)),
    )

    const urls = secureObjectUrlsRef.current
    const chaves = Object.keys(urls)
    if (chaves.length === 0) return

    let teveMudanca = false
    for (const key of chaves) {
      if (!idsAtuais.has(String(key))) {
        try {
          URL.revokeObjectURL(urls[key])
        } catch {}
        delete urls[key]
        teveMudanca = true
      }
    }

    if (teveMudanca) {
      setSecureSources((prev) => {
        const next = { ...prev }
        for (const key of Object.keys(next)) {
          if (!idsAtuais.has(String(key))) delete next[key]
        }
        return next
      })
    }
  }, [fotos, subAba])

  const loadSecureImage = async (imageId, imageUri) => {
    if (Platform.OS !== 'web') return
    if (!imageId || secureSources[imageId]) return
    if (secureLoadsInFlightRef.current.has(imageId)) return

    secureLoadsInFlightRef.current.add(imageId)
    try {
      const headers = await getAuthHeaders()
      const token = await AsyncStorage.getItem('access')
      const res = await fetch(imageUri, {
        headers: { Authorization: `Bearer ${token}`, ...headers },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const urls = secureObjectUrlsRef.current
      if (urls[imageId]) {
        try {
          URL.revokeObjectURL(urls[imageId])
        } catch {}
      }
      urls[imageId] = objectUrl
      setSecureSources((prev) => ({ ...prev, [imageId]: objectUrl }))
    } catch (e) {
      console.error('Erro ao carregar imagem segura:', e)
    } finally {
      secureLoadsInFlightRef.current.delete(imageId)
    }
  }

  const renderItem = useCallback(
    ({ item }) => {
      const imageId = getImageId(item)
      let imageSource
      const imageUri = getDirectImageUri(imageId)
      if (Platform.OS === 'web') {
        imageSource = { uri: secureSources[imageId] || imageUri }
      } else if (authHeaders) {
        imageSource = { uri: imageUri, headers: authHeaders }
      } else {
        imageSource = { uri: imageUri }
      }

      return (
        <TouchableOpacity onPress={() => openImage(item)}>
          <Image
            source={imageSource}
            style={styles.thumb}
            onError={(error) => {
              console.error(`❌ Erro ao carregar imagem ${imageId}:`, error)
              loadSecureImage(imageId, imageUri)
            }}
            onLoad={() => {}}
            onLoadStart={() => {}}
          />
          <Text style={styles.debugText}>ID: {imageId}</Text>
        </TouchableOpacity>
      )
    },
    [authHeaders, secureSources, subAba, slug, orde_nume],
  )

  return (
    <View style={styles.container}>
      {/* Sub-abas */}
      <View style={styles.tabs}>
        {etapas.map((e) => (
          <TouchableOpacity
            key={e.key}
            style={[styles.tab, subAba === e.key && styles.activeTab]}
            onPress={() => setSubAba(e.key)}>
            <Text style={styles.tabText}>{e.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista de miniaturas */}
      {fotos.length > 0 ? (
        <FlatList
          data={fotos}
          keyExtractor={(item, index) => {
            const imageId = getImageId(item)
            return `${subAba}-${imageId ?? index}`
          }}
          renderItem={renderItem}
          numColumns={NUM_COLUMNS}
          nestedScrollEnabled={true}
          contentContainerStyle={{ padding: 8 }}
          removeClippedSubviews={Platform.OS !== 'web'}
          initialNumToRender={12}
          maxToRenderPerBatch={12}
          updateCellsBatchingPeriod={50}
          windowSize={5}
          getItemLayout={(_, index) => {
            const rowIndex = Math.floor(index / NUM_COLUMNS)
            return {
              length: ITEM_HEIGHT,
              offset: ITEM_HEIGHT * rowIndex,
              index,
            }
          }}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Nenhuma foto encontrada para a etapa{' '}
            {etapas.find((e) => e.key === subAba)?.label}
          </Text>
        </View>
      )}
      <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
        <Text style={styles.addText}>
          + Foto {etapas.find((e) => e.key === subAba).label}
        </Text>
      </TouchableOpacity>
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TapGestureHandler
              ref={doubleTapRef}
              numberOfTaps={2}
              maxDelayMs={300}
              onActivated={onDoubleTap}
              waitFor={[pinchRef, panRef]}>
              <PanGestureHandler
                ref={panRef}
                simultaneousHandlers={[pinchRef, doubleTapRef]}
                onGestureEvent={onPanGestureEvent}
                onHandlerStateChange={onPanHandlerStateChange}>
                <PinchGestureHandler
                  ref={pinchRef}
                  simultaneousHandlers={[panRef, doubleTapRef]}
                  onGestureEvent={onPinchGestureEvent}
                  onHandlerStateChange={onPinchHandlerStateChange}>
                  {imagemSelecionada?.source && (
                    <Animated.Image
                      source={imagemSelecionada.source}
                      style={[
                        styles.modalImage,
                        {
                          transform: [
                            ...pan.getTranslateTransform(),
                            { scale },
                          ],
                        },
                      ]}
                      resizeMode="contain"
                    />
                  )}
                </PinchGestureHandler>
              </PanGestureHandler>
            </TapGestureHandler>

            <Text style={styles.obsText}>
              📝 {imagemSelecionada?.item?.observacao || 'Sem observação'}
            </Text>

            <Text style={styles.coordText}>
              📍 {imagemSelecionada?.item?.img_latitude || '---'} |{' '}
              {imagemSelecionada?.item?.img_longitude || '---'}
            </Text>

            {imagemSelecionada?.item?.img_latitude &&
              imagemSelecionada?.item?.img_longitude && (
                <TouchableOpacity
                  style={styles.mapButton}
                  onPress={() =>
                    Linking.openURL(
                      `https://www.google.com/maps?q=${imagemSelecionada.item.img_latitude},${imagemSelecionada.item.img_longitude}`,
                    )
                  }>
                  <Text style={styles.mapText}>Ver no Mapa</Text>
                </TouchableOpacity>
              )}

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ color: '#aaa', marginTop: 12 }}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabs: { flexDirection: 'row', marginVertical: 8 },
  tab: {
    flex: 1,
    padding: 12,
    backgroundColor: '#1a2f3d',
    alignItems: 'center',
    borderRadius: 4,
    marginHorizontal: 2,
  },
  activeTab: { backgroundColor: '#10a2a7' },
  tabText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  thumb: {
    width: 100,
    height: 100,
    margin: 4,
    borderRadius: 8,
    backgroundColor: '#1a2f3d',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  addButton: {
    padding: 15,
    backgroundColor: '#10a2a7',
    alignItems: 'center',
    margin: 16,
    borderRadius: 8,
    marginBottom: 50,
  },
  addText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  debugText: {
    color: '#10a2a7',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    maxWidth: '90%',
    maxHeight: '90%',
  },
  modalImage: {
    width: 250,
    height: 250,
    marginBottom: 12,
    borderRadius: 8,
  },
  obsText: {
    fontSize: 14,
    marginBottom: 6,
    color: '#222',
  },
  coordText: {
    fontSize: 13,
    color: '#444',
    marginBottom: 10,
  },
  mapButton: {
    padding: 10,
    backgroundColor: '#10a2a7',
    borderRadius: 6,
  },
  mapText: {
    color: '#fff',
    fontWeight: 'bold',
  },
})
