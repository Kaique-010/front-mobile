import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
} from 'react-native'
import { Card, Button, Chip, Divider, FAB } from 'react-native-paper'
import { useContextoApp } from '../hooks/useContextoApp'
import { apiGetComContexto, apiPostComContexto } from '../utils/api'
import Icon from 'react-native-vector-icons/MaterialIcons'
import * as ImagePicker from 'expo-image-picker'

const DetalhesOrdemProducao = ({ route, navigation }) => {
  const { ordem: ordemInicial } = route.params
  const [ordem, setOrdem] = useState(ordemInicial)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('detalhes')
  const [modalFotoVisible, setModalFotoVisible] = useState(false)
  const [novaFoto, setNovaFoto] = useState({
    descricao: '',
    fotoAntes: null,
    fotoAtual: null,
  })
  const [uploadingFoto, setUploadingFoto] = useState(false)

  const carregarDetalhes = async () => {
    try {
      setLoading(true)
      const response = await apiGetComContexto(
        `ordemproducao/ordens/${ordem.orpr_codi}/`
      )
      setOrdem(response)
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error)
      Alert.alert('Erro', 'Falha ao carregar detalhes da ordem')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDetalhes()
  }, [])

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatarValor = (valor) => {
    return valor
      ? `R$ ${parseFloat(valor).toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : 'N/A'
  }

  const renderDetalhes = () => (
    <View>
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Informações Gerais</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Número da Ordem</Text>
            <Text style={styles.infoValue}>#{ordem.orpr_codi}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Número de Controle</Text>
            <Text style={styles.infoValue}>{ordem.orpr_nuca}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Cliente</Text>
            <Text style={styles.infoValue}>
              {ordem.cliente_nome || `Código: ${ordem.orpr_clie}`}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Tipo</Text>
            <Text style={styles.infoValue}>{ordem.orpr_tipo}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Data de Entrada</Text>
            <Text style={styles.infoValue}>
              {formatarData(ordem.orpr_entr)}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Previsão de Entrega</Text>
            <Text style={styles.infoValue}>
              {formatarData(ordem.orpr_prev)}
            </Text>
          </View>
          {ordem.orpr_valo && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Valor</Text>
              <Text style={[styles.infoValue, styles.valorDestaque]}>
                {formatarValor(ordem.orpr_valo)}
              </Text>
            </View>
          )}
        </View>

        {ordem.orpr_desc && (
          <View style={styles.descricaoContainer}>
            <Text style={styles.infoLabel}>Descrição</Text>
            <Text style={styles.descricaoText}>{ordem.orpr_desc}</Text>
          </View>
        )}
      </Card>
    </View>
  )

  const selecionarImagem = async (tipo) => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (permissionResult.granted === false) {
        Alert.alert(
          'Permissão necessária',
          'É necessário permitir acesso à galeria de fotos.'
        )
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled) {
        setNovaFoto((prev) => ({
          ...prev,
          [tipo]: result.assets[0],
        }))
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error)
      Alert.alert('Erro', 'Falha ao selecionar imagem')
    }
  }

  const tirarFoto = async (tipo) => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync()

      if (permissionResult.granted === false) {
        Alert.alert(
          'Permissão necessária',
          'É necessário permitir acesso à câmera.'
        )
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      })

      if (!result.canceled) {
        setNovaFoto((prev) => ({
          ...prev,
          [tipo]: result.assets[0],
        }))
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error)
      Alert.alert('Erro', 'Falha ao tirar foto')
    }
  }

  const salvarFoto = async () => {
    try {
      setUploadingFoto(true)

      const formData = new FormData()
      formData.append('orpr_codi', ordem.orpr_codi)
      formData.append('orpr_desc_foto', novaFoto.descricao)

      if (novaFoto.fotoAntes) {
        formData.append('orpr_foto_ante', {
          uri: novaFoto.fotoAntes.uri,
          type: 'image/jpeg',
          name: 'foto_antes.jpg',
        })
      }

      if (novaFoto.fotoAtual) {
        formData.append('orpr_foto_atua', {
          uri: novaFoto.fotoAtual.uri,
          type: 'image/jpeg',
          name: 'foto_atual.jpg',
        })
      }

      await apiPostComContexto('ordemproducao/fotos/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      Alert.alert('Sucesso', 'Foto salva com sucesso!')
      setModalFotoVisible(false)
      setNovaFoto({ descricao: '', fotoAntes: null, fotoAtual: null })
      carregarDetalhes() // Recarregar dados
    } catch (error) {
      console.error('Erro ao salvar foto:', error)
      Alert.alert('Erro', 'Falha ao salvar foto')
    } finally {
      setUploadingFoto(false)
    }
  }

  const renderModalFoto = () => (
    <Modal
      visible={modalFotoVisible}
      animationType="slide"
      onRequestClose={() => setModalFotoVisible(false)}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Adicionar Foto</Text>
          <TouchableOpacity onPress={() => setModalFotoVisible(false)}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Descrição</Text>
            <TextInput
              style={styles.textInput}
              value={novaFoto.descricao}
              onChangeText={(text) =>
                setNovaFoto((prev) => ({ ...prev, descricao: text }))
              }
              placeholder="Descreva a foto..."
              multiline
            />
          </View>

          <View style={styles.fotoSection}>
            <Text style={styles.sectionTitle}>Foto Antes</Text>
            <View style={styles.fotoContainer}>
              {novaFoto.fotoAntes ? (
                <Image
                  source={{ uri: novaFoto.fotoAntes.uri }}
                  style={styles.fotoPreview}
                />
              ) : (
                <View style={styles.fotoPlaceholder}>
                  <Icon name="photo" size={40} color="#ccc" />
                </View>
              )}
              <View style={styles.fotoButtons}>
                <TouchableOpacity
                  style={styles.fotoButton}
                  onPress={() => tirarFoto('fotoAntes')}>
                  <Icon name="camera-alt" size={20} color="#007bff" />
                  <Text style={styles.fotoButtonText}>Câmera</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.fotoButton}
                  onPress={() => selecionarImagem('fotoAntes')}>
                  <Icon name="photo-library" size={20} color="#007bff" />
                  <Text style={styles.fotoButtonText}>Galeria</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.fotoSection}>
            <Text style={styles.sectionTitle}>Foto Atual</Text>
            <View style={styles.fotoContainer}>
              {novaFoto.fotoAtual ? (
                <Image
                  source={{ uri: novaFoto.fotoAtual.uri }}
                  style={styles.fotoPreview}
                />
              ) : (
                <View style={styles.fotoPlaceholder}>
                  <Icon name="photo" size={40} color="#ccc" />
                </View>
              )}
              <View style={styles.fotoButtons}>
                <TouchableOpacity
                  style={styles.fotoButton}
                  onPress={() => tirarFoto('fotoAtual')}>
                  <Icon name="camera-alt" size={20} color="#007bff" />
                  <Text style={styles.fotoButtonText}>Câmera</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.fotoButton}
                  onPress={() => selecionarImagem('fotoAtual')}>
                  <Icon name="photo-library" size={20} color="#007bff" />
                  <Text style={styles.fotoButtonText}>Galeria</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <Button
            mode="outlined"
            onPress={() => setModalFotoVisible(false)}
            style={styles.modalButton}>
            Cancelar
          </Button>
          <Button
            mode="contained"
            onPress={salvarFoto}
            loading={uploadingFoto}
            disabled={
              uploadingFoto || (!novaFoto.fotoAntes && !novaFoto.fotoAtual)
            }
            style={styles.modalButton}>
            Salvar
          </Button>
        </View>
      </View>
    </Modal>
  )

  const renderFotos = () => (
    <View>
      {ordem.fotos && ordem.fotos.length > 0 ? (
        ordem.fotos.map((foto, index) => (
          <Card key={index} style={styles.card}>
            <Text style={styles.cardTitle}>Foto {foto.orpr_nume_foto}</Text>
            {foto.orpr_desc_foto && (
              <Text style={styles.fotoDescricao}>{foto.orpr_desc_foto}</Text>
            )}
            <View style={styles.fotosContainer}>
              {foto.orpr_foto_ante && (
                <View style={styles.fotoItem}>
                  <Text style={styles.fotoLabel}>Antes</Text>
                  <View style={styles.fotoPlaceholder}>
                    <Icon name="photo" size={40} color="#ccc" />
                  </View>
                </View>
              )}
              {foto.orpr_foto_atua && (
                <View style={styles.fotoItem}>
                  <Text style={styles.fotoLabel}>Atual</Text>
                  <View style={styles.fotoPlaceholder}>
                    <Icon name="photo" size={40} color="#ccc" />
                  </View>
                </View>
              )}
            </View>
          </Card>
        ))
      ) : (
        <Card style={styles.card}>
          <View style={styles.emptyState}>
            <Icon name="photo-camera" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Nenhuma foto cadastrada</Text>
            <Button
              mode="contained"
              onPress={() => setModalFotoVisible(true)}
              style={styles.addButton}>
              Adicionar Primeira Foto
            </Button>
          </View>
        </Card>
      )}

      {activeTab === 'fotos' && (
        <FAB
          style={styles.fabFoto}
          icon="camera-alt"
          onPress={() => setModalFotoVisible(true)}
        />
      )}

      {renderModalFoto()}
    </View>
  )

  const renderMateriais = () => (
    <View>
      {ordem.materiais && ordem.materiais.length > 0 ? (
        ordem.materiais.map((material, index) => (
          <Card key={index} style={styles.card}>
            <View style={styles.materialHeader}>
              <Text style={styles.materialCodigo}>#{material.orpm_codi}</Text>
              <Text style={styles.materialProduto}>{material.orpm_prod}</Text>
            </View>
            <View style={styles.materialDetalhes}>
              <View style={styles.materialInfo}>
                <Text style={styles.materialLabel}>Quantidade</Text>
                <Text style={styles.materialValue}>{material.orpm_quan}</Text>
              </View>
              <View style={styles.materialInfo}>
                <Text style={styles.materialLabel}>Valor Unit.</Text>
                <Text style={styles.materialValue}>
                  {formatarValor(material.orpm_unit)}
                </Text>
              </View>

              <View style={styles.materialInfo}>
                <Text style={styles.materialLabel}>Total</Text>
                <Text style={[styles.materialValue, styles.valorDestaque]}>
                  {formatarValor(material.orpm_tota)}
                </Text>
              </View>
            </View>
          </Card>
        ))
      ) : (
        <Card style={styles.card}>
          <View style={styles.emptyState}>
            <Icon name="build" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Nenhum material cadastrado</Text>
          </View>
        </Card>
      )}
    </View>
  )

  const renderEtapas = () => (
    <View>
      {ordem.etapas && ordem.etapas.length > 0 ? (
        ordem.etapas.map((etapa, index) => (
          <Card key={index} style={styles.card}>
            <View style={styles.etapaHeader}>
              <Text style={styles.etapaCodigo}>Etapa #{etapa.opet_codi}</Text>
              <Chip style={styles.etapaStatus} textStyle={styles.chipText}>
                {etapa.opet_datf ? 'Concluída' : 'Em Andamento'}
              </Chip>
            </View>

            {etapa.opet_desc && (
              <Text style={styles.etapaDescricao}>{etapa.opet_desc}</Text>
            )}

            <View style={styles.etapaDatas}>
              {etapa.opet_dati && (
                <View style={styles.etapaData}>
                  <Text style={styles.etapaDataLabel}>Início</Text>
                  <Text style={styles.etapaDataValue}>
                    {new Date(etapa.opet_dati).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
              )}
              {etapa.opet_datf && (
                <View style={styles.etapaData}>
                  <Text style={styles.etapaDataLabel}>Fim</Text>
                  <Text style={styles.etapaDataValue}>
                    {new Date(etapa.opet_datf).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
              )}
            </View>
          </Card>
        ))
      ) : (
        <Card style={styles.card}>
          <View style={styles.emptyState}>
            <Icon name="timeline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Nenhuma etapa cadastrada</Text>
          </View>
        </Card>
      )}
    </View>
  )

  const tabs = [
    { key: 'detalhes', label: 'Detalhes', icon: 'info' },
    { key: 'fotos', label: 'Fotos', icon: 'photo-camera' },
    { key: 'materiais', label: 'Materiais', icon: 'build' },
    { key: 'etapas', label: 'Etapas', icon: 'timeline' },
  ]

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando detalhes...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key)}>
              <Icon
                name={tab.icon}
                size={20}
                color={activeTab === tab.key ? '#007bff' : '#666'}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.activeTabText,
                ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'detalhes' && renderDetalhes()}
        {activeTab === 'fotos' && renderFotos()}
        {activeTab === 'materiais' && renderMateriais()}
        {activeTab === 'etapas' && renderEtapas()}
      </ScrollView>

      <View style={styles.actionButtons}>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('EditarOrdemProducao', { ordem })}
          style={styles.actionButton}>
          Editar
        </Button>
        <Button
          mode="contained"
          onPress={() => {
            /* Implementar ações específicas */
          }}
          style={styles.actionButton}>
          Ações
        </Button>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  tabsContainer: {
    backgroundColor: '#fff',
    elevation: 2,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007bff',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  card: {
    margin: 15,
    padding: 15,
    borderRadius: 12,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  valorDestaque: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  descricaoContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  descricaoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  fotosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  fotoItem: {
    alignItems: 'center',
  },
  fotoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  fotoPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  materialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  materialCodigo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  materialProduto: {
    fontSize: 14,
    color: '#666',
  },
  materialDetalhes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  materialInfo: {
    alignItems: 'center',
  },
  materialLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  materialValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  etapaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  etapaCodigo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  etapaStatus: {
    backgroundColor: '#4CAF50',
  },
  chipText: {
    color: '#fff',
    fontSize: 12,
  },
  etapaDescricao: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
    lineHeight: 20,
  },
  etapaDatas: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  etapaData: {
    alignItems: 'center',
  },
  etapaDataLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  etapaDataValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    elevation: 8,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
})

export default DetalhesOrdemProducao

// Adicionar novos estilos
const newStyles = {
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  fotoSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  fotoContainer: {
    alignItems: 'center',
  },
  fotoPreview: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 15,
  },
  fotoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  fotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#007bff',
    borderRadius: 8,
    minWidth: 100,
    justifyContent: 'center',
  },
  fotoButtonText: {
    marginLeft: 8,
    color: '#007bff',
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  addButton: {
    marginTop: 15,
  },
  fabFoto: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 80,
    backgroundColor: '#4CAF50',
  },
}

// Mesclar com estilos existentes
const detalhesOrdemProducaoStyles = StyleSheet.create({
  ...newStyles,
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  tabsContainer: {
    backgroundColor: '#fff',
    elevation: 2,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007bff',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  card: {
    margin: 15,
    padding: 15,
    borderRadius: 12,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  valorDestaque: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  descricaoContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  descricaoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  fotosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  fotoItem: {
    alignItems: 'center',
  },
  fotoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  fotoPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  materialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  materialCodigo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  materialProduto: {
    fontSize: 14,
    color: '#666',
  },
  materialDetalhes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  materialInfo: {
    alignItems: 'center',
  },
  materialLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  materialValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  etapaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  etapaCodigo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  etapaStatus: {
    backgroundColor: '#4CAF50',
  },
  chipText: {
    color: '#fff',
    fontSize: 12,
  },
  etapaDescricao: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
    lineHeight: 20,
  },
  etapaDatas: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  etapaData: {
    alignItems: 'center',
  },
  etapaDataLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  etapaDataValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    elevation: 8,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
})
