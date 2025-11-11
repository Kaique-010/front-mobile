import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
} from 'react-native'
import CrossCheckbox from '../components/CrossCheckbox'
import Toast from 'react-native-toast-message'
import DateTimePicker from '@react-native-community/datetimepicker'
import AbaPecas from '../componentsOs/AbaPecas'
import AbaServicos from '../componentsOs/AbaServicos'
import AbaFotos from '../componentsOs/AbaForos'
import AbaTotais from '../componentsOs/AbaTotais'
import WorkflowButton from '../componentsOs/WorkflowButton'
import { apiGetComContexto, apiPatchComContexto, apiPostComContexto } from '../utils/api'
import useContextoApp from '../hooks/useContextoApp'
import ErrorBoundary from '../components/ErrorBoundary'
import BuscaSetorInput from '../components/BuscaSetorInput'
import BuscaMarcasInput from '../components/BuscaMarcasInput'
import BuscaVoltagemInput from '../components/BuscaVoltagemInput'
import { ORDER_FIELDS_CONFIG, TIPOS_ORDEM } from '../componentsOs/orderFieldsConfig'

const OrdemDetalhe = ({ route }) => {
  const { ordem } = route.params
  const { usuarioId } = useContextoApp()
  const [abaAtiva, setAbaAtiva] = useState('detalhes')
  const [pecas, setPecas] = useState([])
  const [servicos, setServicos] = useState([])
  const [ordemAtual, setOrdemAtual] = useState(ordem)
  const [prioridade, setPrioridade] = useState(ordemAtual.orde_prio)
  const [showDatePickerReprov, setShowDatePickerReprov] = useState(false)
  const [showSetorReprovModal, setShowSetorReprovModal] = useState(false)
  const [setorReprovNome, setSetorReprovNome] = useState('')
  const [showRetornarModal, setShowRetornarModal] = useState(false)
  const [setorRetornarNome, setSetorRetornarNome] = useState('')
  const [showTipoModal, setShowTipoModal] = useState(false)
  const [tipoSelecionado, setTipoSelecionado] = useState(ordemAtual.orde_tipo || '')
  const [camposVisiveis, setCamposVisiveis] = useState([])
  const [formEdicao, setFormEdicao] = useState({ ...ordemAtual })

  const STATUS_OPTIONS = [
    { label: 'Todas', value: null },
    { label: 'Aberta', value: 0 },
    { label: 'Orçamento gerado', value: 1 },
    { label: 'Aguardando Liberação', value: 2 },
    { label: 'Liberada', value: 3 },
    { label: 'Finalizada', value: 4 },
    { label: 'Reprovada', value: 5 },
    { label: 'Faturada parcial', value: 20 },
    { label: 'Em atraso', value: 21 },
  ]

  const prioridadeValor =
    typeof prioridade === 'string' ? parseInt(prioridade, 10) : prioridade
  const prioridadeLabel =
    prioridadeValor === 0
      ? 'Normal'
      : prioridadeValor === 1
      ? 'Alerta'
      : prioridadeValor === 2
      ? 'Urgente'
      : '-'

  const alterarPrioridade = async (nova) => {
    setPrioridade(nova)
    try {
      const resp = await apiPatchComContexto(
        `ordemdeservico/ordens/${ordemAtual.orde_nume}/atualizar-prioridade/`,
        { orde_prio: nova }
      )
      console.log('✅ Prioridade atualizada:', resp.mensagem)
    } catch (err) {
      console.error('❌ Erro ao atualizar prioridade', err)
    }
  }

  const modalAlterarPrioridade = () => {
    setModalVisible(true)
  }

  // Salvar alterações gerais via PATCH
  const salvarEdicaoGerais = async () => {
    try {
      const payload = {}
      const has = (v) => v !== undefined && v !== null
      // Campos gerais editáveis (omitimos strings vazias e garantimos tipos)
      if (has(formEdicao.orde_gara)) {
        const v = formEdicao.orde_gara
        payload.orde_gara = (v === true || v === 'S' || v === 1 || v === '1') ? 1 : 0
      }
      if (has(formEdicao.orde_sem_cons)) {
        const v = formEdicao.orde_sem_cons
        payload.orde_sem_cons = (v === true || v === 'S' || v === 1 || v === '1') ? 1 : 0
      }
      if (has(formEdicao.orde_data_repr)) {
        const v = formEdicao.orde_data_repr
        if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) {
          payload.orde_data_repr = v
        } else if (v === '') {
          payload.orde_data_repr = null
        }
      }
      if (has(formEdicao.orde_seto_repr)) {
        const n = Number(formEdicao.orde_seto_repr)
        if (Number.isFinite(n)) {
          payload.orde_seto_repr = n
        } else if (formEdicao.orde_seto_repr === '') {
          payload.orde_seto_repr = null
        }
      }

      // Se setor atual for 13, força status 4 (Finalizada)
      const setorAtual = Number(ordemAtual?.orde_seto)
      if (Number.isFinite(setorAtual) && setorAtual === 13) {
        payload.orde_stat_orde = 4
      }

      const resp = await apiPatchComContexto(
        `ordemdeservico/ordens/${ordemAtual.orde_nume}/`,
        payload
      )

      setOrdemAtual((prev) => ({ ...prev, ...payload }))
      Toast.show({
        type: 'success',
        text1: 'Alterações salvas',
        text2: 'As alterações foram aplicadas com sucesso.',
      })
      Alert.alert('Sucesso', 'Alterações salvas com sucesso!')
    } catch (err) {
      console.error('❌ Erro ao salvar alterações gerais', err)
      Toast.show({
        type: 'error',
        text1: 'Erro ao salvar',
        text2: err?.message || 'Não foi possível salvar as alterações',
      })
      Alert.alert('Erro', err?.message || 'Não foi possível salvar as alterações')
    }
  }

  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => {
    carregarPecas()
    carregarServicos()
  }, [])

  useEffect(() => {
    if (abaAtiva === 'totais') {
      carregarPecas()
      carregarServicos()
    }
  }, [abaAtiva])

  const carregarPecas = async () => {
    try {
      const response = await apiGetComContexto('ordemdeservico/pecas/', {
        peca_orde: ordemAtual.orde_nume,
        peca_empr: ordemAtual.orde_empr,
        peca_fili: ordemAtual.orde_fili,
      })
      setPecas(response?.results || [])
    } catch (error) {
      console.error('Erro ao carregar peças:', error)
    }
  }

  const carregarServicos = async () => {
    try {
      const response = await apiGetComContexto('ordemdeservico/servicos/', {
        serv_orde: ordemAtual.orde_nume,
        serv_empr: ordemAtual.orde_empr,
        serv_fili: ordemAtual.orde_fili,
      })
      setServicos(response?.results || [])
    } catch (error) {
      console.error('Erro ao carregar serviços:', error)
    }
  }

  const handleOrdemAtualizada = (ordemAtualizada) => {
    setOrdemAtual(ordemAtualizada)
    setFormEdicao(ordemAtualizada)
    setTipoSelecionado(ordemAtualizada.orde_tipo || '')
  }

  const renderDetalhes = () => (
    <ScrollView style={styles.detalhesContainer}>
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Informações Gerais</Text>

        {/* Row: Garantia, Sem Conserto, Data e Setor que reprovou */}
        <View style={styles.inlineRow}>
          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>Garantia</Text>
            <CrossCheckbox
              value={Boolean(formEdicao.orde_gara)}
              onValueChange={(value) => setFormEdicao((prev) => ({ ...prev, orde_gara: value ? 'S' : '' }))}
            />
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>Sem Conserto</Text>
              <CrossCheckbox
                value={Boolean(formEdicao.orde_sem_cons)}
                onValueChange={(value) => {
                  setFormEdicao((prev) => ({ ...prev, orde_sem_cons: value ? 'S' : '' }))
                  if (value) {
                    const hoje = new Date().toISOString().split('T')[0]
                    setFormEdicao((prev) => ({ ...prev, orde_data_repr: hoje }))
                    setShowSetorReprovModal(true)
                  } else {
                    setFormEdicao((prev) => ({ ...prev, orde_data_repr: null, orde_seto_repr: null }))
                    setSetorReprovNome('')
                    setShowSetorReprovModal(false)
                  }
                }}
              />
          </View>
          <View style={styles.rowItemDate}>
            <Text style={styles.rowLabel}>Reprov.:</Text>
              <TouchableOpacity
                onPress={() => setShowDatePickerReprov(true)}
                style={styles.datePill}>
              <Text style={{ color: '#fff' }} numberOfLines={1} ellipsizeMode="tail">
                {formEdicao.orde_data_repr
                  ? new Date(formEdicao.orde_data_repr).toLocaleDateString()
                  : 'Selecionar'}
              </Text>
              </TouchableOpacity>
          </View>
          {Boolean(formEdicao.orde_sem_cons) ? (
            <View style={styles.rowItem}>
              <Text style={styles.rowLabel}>Setor:</Text>
              <TouchableOpacity
                onPress={() => setShowSetorReprovModal(true)}
                style={styles.datePill}>
                <Text style={{ color: '#fff' }} numberOfLines={1} ellipsizeMode="tail">
                  {setorReprovNome || (formEdicao.orde_seto_repr ? `Código ${formEdicao.orde_seto_repr}` : 'Selecionar')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {showDatePickerReprov && (
          <DateTimePicker
            value={formEdicao.orde_data_repr ? new Date(formEdicao.orde_data_repr) : new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePickerReprov(false)
              if (selectedDate) {
                setFormEdicao((prev) => ({ ...prev, orde_data_repr: selectedDate.toISOString().split('T')[0] }))
              }
            }}
          />
        )}

        <View style={styles.infoRow}>
          <Text style={styles.label}>Tipo:</Text>
          <TouchableOpacity onPress={() => {
            setShowTipoModal(true)
            const config = tipoSelecionado ? ORDER_FIELDS_CONFIG[tipoSelecionado] : null
            setCamposVisiveis(config ? config.campos : [])
          }} style={styles.valueRow}>
            <Text style={styles.value}>{ordemAtual.orde_tipo || '-'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>
            {STATUS_OPTIONS.find(
              (item) => item.value === ordemAtual.orde_stat_orde
            )?.label || '-'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Prioridade:</Text>
          <TouchableOpacity
            onPress={modalAlterarPrioridade}
            style={styles.valueRow}>
            <View
              style={[
                styles.priorityDot,
                styles.priorityDotInline,
                prioridadeValor === 0
                  ? styles.priorityDotBaixa
                  : prioridadeValor === 1
                  ? styles.priorityDotMedia
                  : prioridadeValor === 2
                  ? styles.priorityDotAlta
                  : null,
              ]}>
              <Text style={styles.priorityDotInlineText}>
                {Number.isFinite(prioridadeValor) ? prioridadeValor : '-'}
              </Text>
            </View>
            <Text style={styles.value}>{prioridadeLabel}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Total:</Text>
          <Text style={[styles.value, styles.totalValue]}>
            R$ {Number(ordemAtual.orde_tota || 0).toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Datas</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Abertura:</Text>
          <Text style={styles.value}>{ordemAtual.orde_data_aber || '-'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Fechamento:</Text>
          <Text style={styles.value}>{ordemAtual.orde_data_fech || '-'}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Descrições</Text>

        <View style={styles.descriptionRow}>
          <Text style={styles.label}>Problema:</Text>
          <Text style={styles.value}>{ordemAtual.orde_prob || '-'}</Text>
        </View>

        <View style={styles.descriptionRow}>
          <Text style={styles.label}>Defeito:</Text>
          <Text style={styles.value}>{ordemAtual.orde_defe_desc || '-'}</Text>
        </View>

        <View style={styles.descriptionRow}>
          <Text style={styles.label}>Observações:</Text>
          <Text style={styles.value}>{ordemAtual.orde_obse || '-'}</Text>
        </View>
        <View style={styles.descriptionRow}>
          <Text style={styles.label}>Setor:</Text>
          <Text style={styles.value}>{ordemAtual.setor_nome || '-'}</Text>
        </View>
      </View>

      <WorkflowButton
        style={styles.workflowButton}
        ordem={ordemAtual}
        onOrdemAtualizada={handleOrdemAtualizada}
        onSalvarAlteracoes={salvarEdicaoGerais}
      />

 
    </ScrollView>
  )


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>OS #{ordemAtual.orde_nume}</Text>
        <Text style={styles.subtitle}>Cliente: {ordemAtual.cliente_nome}</Text>
      </View>

      <View style={styles.tabs}>
        {['detalhes', 'pecas', 'servicos', 'fotos'].map((aba) => (
          <TouchableOpacity
            key={aba}
            onPress={() => setAbaAtiva(aba)}
            style={[styles.tab, abaAtiva === aba && styles.tabActive]}>
            <Text
              style={[
                styles.tabText,
                abaAtiva === aba && styles.tabTextActive,
              ]}>
              {aba.charAt(0).toUpperCase() + aba.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {abaAtiva === 'detalhes' && renderDetalhes()}
        {abaAtiva === 'pecas' && (
          <AbaPecas
            pecas={pecas}
            setPecas={setPecas}
            orde_nume={ordemAtual.orde_nume}
          />
        )}
        {abaAtiva === 'servicos' && (
          <AbaServicos
            servicos={servicos}
            setServicos={setServicos}
            orde_nume={ordemAtual.orde_nume}
          />
        )}
        {abaAtiva === 'fotos' && (
          <AbaFotos
            fotos={[]}
            setFotos={() => {}}
            orde_nume={ordemAtual.orde_nume}
            codTecnico={usuarioId}
          />
        )}
        {abaAtiva === 'totais' && (
          <AbaTotais
            pecas={pecas}
            servicos={servicos}
            orde_nume={ordemAtual.orde_nume}
            orde_clie={ordemAtual.orde_enti}
            orde_empr={ordemAtual.orde_empr}
            orde_fili={ordemAtual.orde_fili}
          />
        )}
      </View>
      {modalVisible && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Alterar Prioridade</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  alterarPrioridade(0)
                  setModalVisible(false)
                }}>
                <View style={styles.modalButtonContent}>
                  <View style={[styles.priorityDot, styles.priorityDotBaixa]}>
                    <Text style={styles.priorityDotText}>0</Text>
                  </View>
                  <Text style={styles.modalButtonText}>Normal</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  alterarPrioridade(1)
                  setModalVisible(false)
                }}>
                <View style={styles.modalButtonContent}>
                  <View style={[styles.priorityDot, styles.priorityDotMedia]}>
                    <Text style={styles.priorityDotText}>1</Text>
                  </View>
                  <Text style={styles.modalButtonText}>Alerta</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  alterarPrioridade(2)
                  setModalVisible(false)
                }}>
                <View style={styles.modalButtonContent}>
                  <View style={[styles.priorityDot, styles.priorityDotAlta]}>
                    <Text style={styles.priorityDotText}>2</Text>
                  </View>
                  <Text style={styles.modalButtonText}>Alta</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Modal para editar Tipo e campos dinâmicos */}
      {showTipoModal && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showTipoModal}
          onRequestClose={() => setShowTipoModal(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalBounds}>
              <ScrollView keyboardShouldPersistTaps="handled">
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Editar Tipo da Ordem</Text>

              <View style={{ marginBottom: 10 }}>
                <Text style={[styles.label, { marginBottom: 6 }]}>Selecione o tipo</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {TIPOS_ORDEM.map((tipo) => (
                    <TouchableOpacity
                      key={tipo.value}
                      onPress={() => {
                        setTipoSelecionado(tipo.value)
                        const config = ORDER_FIELDS_CONFIG[tipo.value]
                        setCamposVisiveis(config ? config.campos : [])
                      }}
                      style={{
                        backgroundColor: tipoSelecionado === tipo.value ? '#10a2a7' : '#1a2f3d',
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        marginRight: 8,
                        marginBottom: 8,
                      }}>
                      <Text style={{ color: '#fff' }}>{tipo.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Campos dinâmicos conforme tipo */}
              {camposVisiveis.map((campo) => {
                const valor = formEdicao[campo.key] || ''
                if (campo.tipo === 'textarea') {
                  return (
                    <View key={campo.key} style={{ marginBottom: 12 }}>
                      <Text style={styles.label}>{campo.label}:</Text>
                      <TextInput
                        style={styles.inputInline}
                        value={valor}
                        onChangeText={(value) => setFormEdicao((prev) => ({ ...prev, [campo.key]: value }))}
                        placeholder={`Digite ${campo.label.toLowerCase()}`}
                        placeholderTextColor="#666"
                        multiline
                        numberOfLines={4}
                      />
                    </View>
                  )
                }
                
                if (campo.tipo === 'BuscaMarcasInput') {
                  return (
                    <View key={campo.key} style={{ marginBottom: 12 }}>
                      <Text style={styles.label}>{campo.label}:</Text>
                      <ErrorBoundary>
                        <BuscaMarcasInput
                          initialValue={valor}
                          onSelect={(valorSelecionado) => {
                            const codigoMarca =
                              typeof valorSelecionado === 'object'
                                ? valorSelecionado?.codigo
                                : valorSelecionado
                            setFormEdicao((prev) => ({ ...prev, [campo.key]: codigoMarca || '' }))
                          }}
                        />
                      </ErrorBoundary>
                    </View>
                  )
                }

                if (campo.tipo === 'BuscaVoltagemInput') {
                  return (
                    <View key={campo.key} style={{ marginBottom: 12 }}>
                      <Text style={styles.label}>{campo.label}:</Text>
                      <ErrorBoundary>
                        <BuscaVoltagemInput
                          initialValue={valor}
                          onSelect={(valorSelecionado) => {
                            const codigoVoltagem =
                              typeof valorSelecionado === 'object'
                                ? valorSelecionado?.osvo_codi
                                : valorSelecionado
                            setFormEdicao((prev) => ({ ...prev, [campo.key]: codigoVoltagem || '' }))
                          }}
                        />
                      </ErrorBoundary>
                    </View>
                  )
                }
                return (
                  <View key={campo.key} style={{ marginBottom: 12 }}>
                    <Text style={styles.label}>{campo.label}:</Text>
                    <TextInput
                      style={styles.inputInline}
                      value={valor}
                      onChangeText={(value) => setFormEdicao((prev) => ({ ...prev, [campo.key]: value }))}
                      placeholder={`Digite ${campo.label.toLowerCase()}`}
                      placeholderTextColor="#666"
                      keyboardType={campo.tipo === 'number' ? 'numeric' : 'default'}
                    />
                  </View>
                )
              })}

              <TouchableOpacity
                style={styles.modalButton}
                onPress={async () => {
                  try {
                    const payload = {
                      orde_tipo: tipoSelecionado,
                    }
                    camposVisiveis.forEach((campo) => {
                      const v = formEdicao[campo.key]
                      if (v !== undefined && v !== null && `${v}` !== '') {
                        payload[campo.key] = v
                      }
                    })
                    const resp = await apiPatchComContexto(
                      `ordemdeservico/ordens/${ordemAtual.orde_nume}/`,
                      payload
                    )
                    setOrdemAtual((prev) => ({ ...prev, ...payload }))
                    setShowTipoModal(false)
                  } catch (err) {
                    console.error('❌ Erro ao salvar tipo/campos', err)
                  }
                }}>
                <Text style={styles.modalButtonText}>Salvar Tipo e Campos</Text>
              </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Modal para retornar setor na edição */}
      {showRetornarModal && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showRetornarModal}
          onRequestClose={() => setShowRetornarModal(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalBounds}>
              <ScrollView keyboardShouldPersistTaps="handled">
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Retornar Setor</Text>
                  <ErrorBoundary>
                    <BuscaSetorInput
                      initialValue={setorRetornarNome}
                      onSelect={async (setor) => {
                        try {
                          const codigo = setor?.osfs_codi
                          const nome = setor?.osfs_nome
                          setSetorRetornarNome(nome || '')
                          const response = await apiPostComContexto(
                            `ordemdeservico/ordens/${ordemAtual.orde_nume}/retornar-setor/`,
                            { setor_origem: codigo }
                          )
                          setShowRetornarModal(false)
                          if (response && (response.success || response.ordem)) {
                            Alert.alert('Sucesso', `Ordem retornada para ${nome}`, [
                              { text: 'OK' },
                            ])
                            const ordemResp = response.ordem || response
                            handleOrdemAtualizada(ordemResp)
                            // Se selecionar setor 13 (Expedição), força status 4 via PATCH
                            if (Number(codigo) === 13) {
                              try {
                                await apiPatchComContexto(
                                  `ordemdeservico/ordens/${ordemAtual.orde_nume}/`,
                                  { orde_stat_orde: 4 }
                                )
                                setOrdemAtual((prev) => ({ ...prev, orde_stat_orde: 4 }))
                              } catch (e) {
                                console.error('Erro ao definir status 4 após retorno ao setor 13', e)
                              }
                            }
                          } else {
                            Alert.alert('Processado', `Solicitação de retorno para ${nome} processada`, [
                              { text: 'OK' },
                            ])
                          }
                        } catch (error) {
                          console.error('Erro ao retornar setor:', error)
                          Alert.alert(
                            'Erro',
                            error.response?.data?.error || error.message || 'Não foi possível retornar a ordem'
                          )
                        }
                      }}
                    />
                  </ErrorBoundary>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowRetornarModal(false)}>
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Modal de seleção de setor da reprovação */}
      {showSetorReprovModal && (
        <Modal
          visible={showSetorReprovModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowSetorReprovModal(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalBounds}>
              <ScrollView keyboardShouldPersistTaps="handled">
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Selecionar Setor da Reprovação</Text>
                  <ErrorBoundary>
                    <BuscaSetorInput
                      initialValue={setorReprovNome}
                      onSelect={(setor) => {
                        const codigo = Number(setor?.osfs_codi ?? null)
                        const nome = setor?.osfs_nome || ''
                        setFormEdicao((prev) => ({ ...prev, orde_seto_repr: Number.isFinite(codigo) ? codigo : null }))
                        setSetorReprovNome(nome)
                        setShowSetorReprovModal(false)
                      }}
                    />
                  </ErrorBoundary>
                  <TouchableOpacity
                    onPress={() => setShowSetorReprovModal(false)}
                    style={styles.modalButton}>
                    <Text style={styles.modalButtonText}>Fechar</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a2f3d',
  },
  header: {
    padding: 20,
    backgroundColor: '#232935',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10a2a7',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 20,
    color: '#faebd7',
    opacity: 0.8,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#232935',
    paddingHorizontal: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#10a2a7',
  },
  tabText: {
    color: '#faebd7',
    opacity: 0.7,
  },
  tabTextActive: {
    color: '#10a2a7',
    opacity: 1,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    marginTop: 10,
    marginBottom: 10,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 8,
    flexShrink: 1,
  },
  rowItemDate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 8,
    flexShrink: 1,
  },
  rowLabel: {
    color: '#fff',
    fontSize: 14,
    marginRight: 8,
    marginTop: 0,
    marginBottom: 0,
  },
  datePill: {
    backgroundColor: '#1a2f3d',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexShrink: 1,
    maxWidth: 180,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#232935',
    borderRadius: 8,
    padding: 20,
    width: '90%',
  },
  modalBounds: {
    maxHeight: '80%',
    width: '95%',
  },
  modalTitle: {
    color: '#10a2a7',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#10a2a7',
    paddingVertical: 12,
    borderRadius: 6,
    marginTop: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputInline: {
    backgroundColor: '#1a2f3d',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
  },
  modalButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#10a2a7',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priorityDotBaixa: {
    backgroundColor: 'rgba(16, 162, 167, 0.25)',
  },
  priorityDotMedia: {
    backgroundColor: 'rgba(16, 162, 167, 0.55)',
  },
  priorityDotAlta: {
    backgroundColor: '#10a2a7',
  },
  priorityDotText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  valueRow: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  priorityDotInline: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 8,
  },
  priorityDotInlineText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  detalhesContainer: {
    padding: 15,
    paddingBottom: 100,
    marginBottom: 50,
  },
  infoCard: {
    backgroundColor: '#232935',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  cardTitle: {
    color: '#10a2a7',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1a2f3d',
  },
  descriptionRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1a2f3d',
  },
  label: {
    color: '#faebd7',
    opacity: 0.7,
    flex: 1,
  },
  value: {
    color: '#fff',
    flex: 2,
    textAlign: 'right',
  },
  totalValue: {
    color: '#10a2a7',
    fontWeight: 'bold',
    fontSize: 16,
  },
  workflowButton: {
    marginBottom: 15,
    marginTop: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 6,
    alignSelf: 'flex-end',
  },
})

export default OrdemDetalhe
