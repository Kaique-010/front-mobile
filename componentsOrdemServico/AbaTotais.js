import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Image,
} from 'react-native'
import { apiPostComContexto, apiGetComContexto } from '../utils/api'
import Toast from 'react-native-toast-message'
import { TextInput, List } from 'react-native-paper'
import { Picker } from '@react-native-picker/picker'
import { Ionicons } from '@expo/vector-icons'

const FORMAS_RECEBIMENTO = [
  { codigo: '00', descricao: 'DUPLICATA' },
  { codigo: '01', descricao: 'CHEQUE' },
  { codigo: '02', descricao: 'PROMISSÓRIA' },
  { codigo: '03', descricao: 'RECIBO' },
  { codigo: '50', descricao: 'CHEQUE PRÉ' },
  { codigo: '51', descricao: 'CARTÃO DE CRÉDITO' },
  { codigo: '52', descricao: 'CARTÃO DE DÉBITO' },
  { codigo: '53', descricao: 'BOLETO BANCÁRIO' },
  { codigo: '54', descricao: 'DINHEIRO' },
  { codigo: '55', descricao: 'DEPÓSITO EM CONTA' },
  { codigo: '56', descricao: 'VENDA À VISTA' },
  { codigo: '60', descricao: 'PIX' },
]

export default function AbaTotais({
  pecas = [],
  servicos = [],
  os_os: orde_nume,
  os_clie: os_clie,
  os_empr,
  os_fili,
  onFinanceiroGerado, // Novo prop
  navigation,
}) {
  useEffect(() => {
    console.log('AbaTotais props:', {
      orde_nume,
      os_clie,
      os_empr,
      os_fili,

      totalPecas: pecas.reduce(
        (acc, peca) => acc + (Number(peca.peca_tota) || 0),
        0
      ),
      totalServicos: servicos.reduce(
        (acc, servico) => acc + (Number(servico.serv_tota) || 0),
        0
      ),
    })
  }, [orde_nume, os_clie, os_empr, os_fili, pecas, servicos])

  const [loading, setLoading] = useState(false)
  const [titulos, setTitulos] = useState([])
  const [formaPagamento, setFormaPagamento] = useState('54')
  const [parcelas, setParcelas] = useState('1')
  const [dataBase, setDataBase] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [parcelasSimuladas, setParcelasSimuladas] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [tituloEmEdicao, setTituloEmEdicao] = useState(null)
  const [printVisible, setPrintVisible] = useState(false)
  const [osDetalhe, setOsDetalhe] = useState(null)
  const [horasDia, setHorasDia] = useState([])

  const totalPecas = pecas.reduce((acc, peca) => {
    const valor = Number(peca.peca_tota) || 0
    return acc + valor
  }, 0)

  const totalServicos = servicos.reduce((acc, servico) => {
    const valor = Number(servico.serv_tota) || 0
    return acc + valor
  }, 0)

  const totalGeral = totalPecas + totalServicos

  useEffect(() => {
    const numParcelas = parseInt(parcelas) || 1
    const valorParcela = totalGeral / numParcelas
    const novasParcelasSimuladas = []

    for (let i = 1; i <= numParcelas; i++) {
      const dataVencimento = new Date(dataBase)
      dataVencimento.setMonth(dataVencimento.getMonth() + (i - 1))

      novasParcelasSimuladas.push({
        parcela: i,
        valor:
          i === numParcelas
            ? totalGeral - valorParcela * (numParcelas - 1)
            : valorParcela,
        vencimento: dataVencimento.toISOString().split('T')[0],
      })
    }

    setParcelasSimuladas(novasParcelasSimuladas)
  }, [parcelas, totalGeral, dataBase])

  useEffect(() => {
    const atualizarTotalOrdem = async () => {
      if (!orde_nume) return

      try {
        await apiPostComContexto(`Os/ordens/${orde_nume}/atualizar_total/`, {
          os_tota: Number(totalGeral),
          os_empr: Number(os_empr),
          os_fili: Number(os_fili),
          orde_nume: Number(orde_nume), // Alterado de os_os para orde_nume
          empr: String(os_empr),
          fili: String(os_fili),
          usua: '1',
        })
      } catch (error) {
        console.error('Erro ao atualizar total da ordem:', error)
        Toast.show({
          type: 'error',
          text1: 'Erro ao atualizar total',
          text2: 'Não foi possível salvar o total da ordem de serviço',
        })
      }
    }

    atualizarTotalOrdem()
  }, [totalGeral, orde_nume])

  const carregarTitulos = async () => {
    if (!orde_nume) return

    try {
      setLoading(true)
      const response = await apiGetComContexto(
        `Os/financeiro/consultar-titulos/${orde_nume}/`
      )
      setTitulos(response.titulos || [])
    } catch (error) {
      if (error.response?.status === 404) {
        setTitulos([])
        return
      }

      console.error('Erro ao carregar títulos:', error)
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível carregar os títulos',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarTitulos()
  }, [orde_nume])

  useEffect(() => {
    const carregarResumo = async () => {
      if (!orde_nume) return
      try {
        const os = await apiGetComContexto(`Os/ordens/${orde_nume}/`)
        setOsDetalhe(os)
        const horas = await apiGetComContexto('Os/os-hora/', {
          os_hora_os: String(orde_nume),
          os_hora_empr: Number(os_empr),
          os_hora_fili: Number(os_fili),
        })
        const arr = Array.isArray(horas?.results)
          ? horas.results
          : Array.isArray(horas)
          ? horas
          : []
        setHorasDia(arr)
      } catch {}
    }
    carregarResumo()
  }, [orde_nume, os_empr, os_fili])

  const gerarTitulos = async () => {
    if (!orde_nume || !os_clie || !totalGeral) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Cliente, número da ordem e total são obrigatórios',
      })
      return
    }

    try {
      setLoading(true)
      const payload = {
        os_os: orde_nume, // Corrigido: usando orde_nume em vez de os_os
        os_clie: os_clie,
        os_tota: totalGeral,
        forma_pagamento: formaPagamento,
        parcelas: parseInt(parcelas),
        data_base: dataBase,
        empr: os_empr,
        fili: os_fili,
      }

      console.log('Payload:', payload)

      await apiPostComContexto('Os/financeiro/gerar-titulos/', payload)
      onFinanceiroGerado && onFinanceiroGerado(true) // Notifica o componente pai

      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Títulos gerados com sucesso',
      })

      await carregarTitulos()
    } catch (error) {
      console.error('Erro ao gerar títulos:', error)
      const mensagemErro =
        error.response?.data?.detail || 'Não foi possível gerar os títulos'
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: mensagemErro,
      })
    } finally {
      setLoading(false)
    }
  }

  const removerTitulos = async () => {
    try {
      setLoading(true)
      await apiPostComContexto('Os/financeiro/remover-titulos/', {
        os_os: orde_nume,
        empr: os_empr,
        fili: os_fili,
        usua: '1',
      })

      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Títulos removidos com sucesso',
      })

      setTitulos([])
      onFinanceiroGerado && onFinanceiroGerado(false) // Atualiza o estado para permitir adicionar peças/serviços novamente
    } catch (error) {
      if (error.response?.status === 404) {
        setTitulos([])
        onFinanceiroGerado && onFinanceiroGerado(false) // Também atualiza em caso de 404
        return
      }

      console.error('Erro ao remover títulos:', error)
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2:
          error.response?.data?.detail || 'Não foi possível remover os títulos',
      })
    } finally {
      setLoading(false)
    }
  }

  const editarTitulo = (titulo) => {
    setTituloEmEdicao(titulo)
    setModalVisible(true)
  }

  const salvarEdicaoTitulo = async () => {
    if (!tituloEmEdicao) return

    try {
      setLoading(true)
      await apiPostComContexto('Os/financeiro/atualizar-titulo/', {
        orde_nume,
        parcela: tituloEmEdicao.parcela,
        valor: parseFloat(tituloEmEdicao.valor),
        vencimento: tituloEmEdicao.vencimento,
        empr: os_empr,
        fili: os_fili,
      })

      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Título atualizado com sucesso',
      })

      setModalVisible(false)
      setTituloEmEdicao(null)
      await carregarTitulos()
    } catch (error) {
      console.error('Erro ao atualizar título:', error)
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2:
          error.response?.data?.detail || 'Não foi possível atualizar o título',
      })
    } finally {
      setLoading(false)
    }
  }

  const validarEdicaoTitulo = () => {
    if (!tituloEmEdicao) return false

    const valor = parseFloat(tituloEmEdicao.valor)
    if (isNaN(valor) || valor <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'O valor deve ser maior que zero',
      })
      return false
    }

    if (!tituloEmEdicao.vencimento) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'A data de vencimento é obrigatória',
      })
      return false
    }

    return true
  }

  const renderModalEdicao = () => (
    <Modal
      visible={modalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            Editar Parcela {tituloEmEdicao?.parcela}
          </Text>

          <TextInput
            label="Valor"
            value={tituloEmEdicao?.valor?.toString() || ''}
            onChangeText={(text) =>
              setTituloEmEdicao((prev) => ({ ...prev, valor: text }))
            }
            keyboardType="numeric"
            style={styles.modalInput}
            mode="outlined"
            theme={{ colors: { primary: '#10a2a7' } }}
          />

          <TextInput
            label="Data de Vencimento"
            value={tituloEmEdicao?.vencimento?.split('T')[0] || ''}
            onChangeText={(text) =>
              setTituloEmEdicao((prev) => ({ ...prev, vencimento: text }))
            }
            placeholder="YYYY-MM-DD"
            style={styles.modalInput}
            mode="outlined"
            theme={{ colors: { primary: '#10a2a7' } }}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonCancel]}
              onPress={() => setModalVisible(false)}
              disabled={loading}>
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSave]}
              onPress={() => {
                if (validarEdicaoTitulo()) {
                  salvarEdicaoTitulo()
                }
              }}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.modalButtonText}>Salvar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )

  const renderPrint = () => (
    <Modal
      visible={printVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setPrintVisible(false)}>
      <View style={styles.modalContainer}>
        <View style={styles.printCard}>
          <Text style={styles.printTitle}>Ordem de Serviço #{orde_nume}</Text>
          <View style={styles.printRow}>
            <Text style={styles.printLabel}>Cliente:</Text>
            <Text style={styles.printValue}>
              {osDetalhe?.cliente_nome || os_clie}
            </Text>
          </View>
          <View style={styles.printRow}>
            <Text style={styles.printLabel}>Local de Trabalho:</Text>
            <Text style={styles.printValue}>
              {osDetalhe?.os_loca_apli || '-'}
            </Text>
          </View>
          <View style={styles.printRow}>
            <Text style={styles.printLabel}>Placa:</Text>
            <Text style={styles.printValue}>{osDetalhe?.os_plac || '-'}</Text>
          </View>
          <View style={styles.divisor} />
          <Text style={styles.printSection}>Diário de Horas</Text>
          <View style={{ marginBottom: 8 }}>
            {horasDia.map((h, idx) => (
              <View key={idx} style={styles.printHoursRow}>
                <Text style={styles.printHoursCol}>{h.os_hora_data}</Text>
                <Text style={styles.printHoursCol}>
                  Manhã: {h.os_hora_manh_ini || '--'} -{' '}
                  {h.os_hora_manh_fim || '--'}
                </Text>
                <Text style={styles.printHoursCol}>
                  Tarde: {h.os_hora_tard_ini || '--'} -{' '}
                  {h.os_hora_tard_fim || '--'}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.divisor} />
          <View style={styles.printRow}>
            <Text style={styles.printLabel}>Total Peças:</Text>
            <Text style={styles.printValue}>R$ {totalPecas.toFixed(2)}</Text>
          </View>
          <View style={styles.printRow}>
            <Text style={styles.printLabel}>Total Serviços:</Text>
            <Text style={styles.printValue}>R$ {totalServicos.toFixed(2)}</Text>
          </View>
          <View style={styles.printRow}>
            <Text style={styles.printLabel}>TOTAL:</Text>
            <Text style={styles.printValue}>R$ {totalGeral.toFixed(2)}</Text>
          </View>
          <View style={styles.divisor} />
          <Text style={styles.printSection}>Assinaturas</Text>
          <View style={styles.signRow}>
            <View style={styles.signBox}>
              {osDetalhe?.os_assi_clie ? (
                <Image
                  source={{
                    uri: `data:image/png;base64,${osDetalhe.os_assi_clie}`,
                  }}
                  style={styles.signImage}
                />
              ) : (
                <Text style={styles.signPlaceholder}>Cliente</Text>
              )}
            </View>
            <View style={styles.signBox}>
              {osDetalhe?.os_assi_oper ? (
                <Image
                  source={{
                    uri: `data:image/png;base64,${osDetalhe.os_assi_oper}`,
                  }}
                  style={styles.signImage}
                />
              ) : (
                <Text style={styles.signPlaceholder}>Operador</Text>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={[styles.button, { marginTop: 12 }]}
            onPress={() => setPrintVisible(false)}>
            <Text style={styles.buttonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Resumo da Ordem de Serviço</Text>

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Total de Peças:</Text>
            <Text style={styles.valor}>R$ {totalPecas.toFixed(2)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Total de Serviços:</Text>
            <Text style={styles.valor}>R$ {totalServicos.toFixed(2)}</Text>
          </View>

          <View style={styles.divisor} />

          <View style={styles.infoRow}>
            <Text style={[styles.label, styles.total]}>Total Geral:</Text>
            <Text style={[styles.valor, styles.totalValor]}>
              R$ {totalGeral.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.divisor} />

        <Text style={styles.cardTitle}>Financeiro</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation?.navigate('OsPdfView', {
              os_os: orde_nume,
              os_empr,
              os_fili,
            })
          }>
          <Text style={styles.buttonText}>Gerar/Imprimir O.S.</Text>
        </TouchableOpacity>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10a2a7" />
            <Text style={styles.loadingText}>Carregando...</Text>
          </View>
        ) : titulos.length > 0 ? (
          <View style={styles.titulosContainer}>
            <Text style={styles.subtitulo}>Títulos Gerados</Text>
            {titulos.map((titulo, index) => (
              <View key={index} style={styles.tituloItem}>
                <View style={styles.tituloHeader}>
                  <Text style={styles.tituloNumero}>
                    Parcela {titulo.parcela}
                  </Text>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => editarTitulo(titulo)}>
                    <Ionicons name="pencil" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>

                <View style={styles.tituloRow}>
                  <Text style={styles.tituloLabel}>Valor:</Text>
                  <Text style={styles.tituloValor}>
                    R$ {parseFloat(titulo.valor).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.tituloRow}>
                  <Text style={styles.tituloLabel}>Vencimento:</Text>
                  <Text style={styles.tituloValor}>
                    {new Date(titulo.vencimento).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.tituloRow}>
                  <Text style={styles.tituloLabel}>Status:</Text>
                  <Text
                    style={[
                      styles.tituloValor,
                      styles[`status${titulo.status || 'Aberta'}`],
                    ]}>
                    {titulo.status || 'Aberta'}
                  </Text>
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.button, styles.buttonDanger]}
              onPress={removerTitulos}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Remover Todos os Títulos</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.formContainer}>
              <Text style={styles.pickerLabel}>Forma de Pagamento</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formaPagamento}
                  onValueChange={setFormaPagamento}
                  style={styles.picker}
                  dropdownIconColor="#fff"
                  enabled={!loading}>
                  {FORMAS_RECEBIMENTO.map((forma) => (
                    <Picker.Item
                      key={forma.codigo}
                      label={forma.descricao}
                      value={forma.codigo}
                      style={styles.pickerItem}
                    />
                  ))}
                </Picker>
              </View>

              <TextInput
                label="Número de Parcelas"
                value={parcelas}
                onChangeText={setParcelas}
                keyboardType="numeric"
                style={styles.input}
                mode="outlined"
                textColor="#fff"
                theme={{
                  colors: {
                    primary: '#10a2a7',
                    text: '#fff', // texto digitado
                    placeholder: '#999', // texto do placeholder
                  },
                }}
                disabled={loading}
              />

              <TextInput
                label="Data Base"
                value={dataBase}
                onChangeText={setDataBase}
                style={styles.input}
                mode="outlined"
                textColor="#fff"
                theme={{
                  colors: {
                    primary: '#10a2a7',
                    text: '#fff',
                    placeholder: '#999',
                  },
                }}
                disabled={loading}
              />

              {parcelasSimuladas.length > 0 && (
                <View style={styles.simulacaoContainer}>
                  <Text style={styles.subtitulo}>Simulação das Parcelas</Text>
                  {parcelasSimuladas.map((parcela, index) => (
                    <View key={index} style={styles.parcelaSimulada}>
                      <Text style={styles.parcelaTexto}>
                        {parcela.parcela}ª Parcela: R${' '}
                        {parcela.valor.toFixed(2)}
                      </Text>
                      <Text style={styles.parcelaData}>
                        Venc.:{' '}
                        {new Date(parcela.vencimento).toLocaleDateString()}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.button,
                  (loading || !orde_nume || !os_clie || totalGeral <= 0) &&
                    styles.buttonDisabled,
                ]}
                onPress={gerarTitulos}
                disabled={loading || !orde_nume || !os_clie || totalGeral <= 0}>
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Gerar Títulos</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.semTitulosContainer}>
              <Text style={styles.semTitulosTexto}>
                Esta ordem de serviço ainda não possui títulos gerados.
              </Text>
            </View>
          </>
        )}
      </View>
      {renderModalEdicao()}
      {renderPrint()}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a2f3d',
  },
  card: {
    backgroundColor: '#232935',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardTitle: {
    color: '#10a2a7',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#1a2f3d',
    borderRadius: 8,
    padding: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  label: {
    color: '#999',
    fontSize: 16,
  },
  valor: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divisor: {
    height: 1,
    backgroundColor: '#2c3e50',
    marginVertical: 20,
  },
  total: {
    color: '#10a2a7',
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValor: {
    color: '#10a2a7',
    fontSize: 20,
  },
  formContainer: {
    backgroundColor: '#1a2f3d',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  pickerLabel: {
    color: '#999',
    fontSize: 16,
    marginBottom: 5,
  },
  pickerContainer: {
    backgroundColor: '#232935',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2c3e50',
  },
  picker: {
    color: '#fff',
    height: 50,
  },
  pickerItem: {
    color: '#fff',
    backgroundColor: '#232935',
  },
  input: {
    marginBottom: 10,
    backgroundColor: '#232935',
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#10a2a7',
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonDanger: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  titulosContainer: {
    backgroundColor: '#1a2f3d',
    borderRadius: 8,
    padding: 15,
  },
  simulacaoContainer: {
    backgroundColor: '#232935',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  parcelaSimulada: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2c3e50',
  },
  parcelaTexto: {
    color: '#fff',
    fontSize: 14,
  },
  parcelaData: {
    color: '#999',
    fontSize: 14,
  },
  subtitulo: {
    color: '#10a2a7',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tituloItem: {
    backgroundColor: '#232935',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  tituloRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  tituloLabel: {
    color: '#999',
    fontSize: 14,
  },
  tituloValor: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#666',
    opacity: 0.7,
  },
  semTitulosContainer: {
    backgroundColor: '#1a2f3d',
    borderRadius: 8,
    padding: 15,
    marginTop: 15,
    alignItems: 'center',
  },
  semTitulosTexto: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
  buttonErrorText: {
    color: '#ff9999',
    fontSize: 12,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  printCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  printTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  printRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  printLabel: { color: '#333' },
  printValue: { color: '#000', fontWeight: 'bold' },
  printSection: { color: '#000', fontWeight: 'bold', marginBottom: 6 },
  printHoursRow: { flexDirection: 'row', justifyContent: 'space-between' },
  printHoursCol: { color: '#000', fontSize: 12 },
  signRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  signBox: {
    width: '48%',
    height: 100,
    borderWidth: 1,
    borderColor: '#999',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signImage: { width: '100%', height: '100%', resizeMode: 'contain' },
  signPlaceholder: { color: '#999' },
  modalContent: {
    backgroundColor: '#232935',
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: {
    color: '#10a2a7',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    marginBottom: 15,
    backgroundColor: '#1a2f3d',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonCancel: {
    backgroundColor: '#666',
  },
  modalButtonSave: {
    backgroundColor: '#10a2a7',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tituloHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tituloNumero: {
    color: '#10a2a7',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#10a2a7',
    padding: 8,
    borderRadius: 6,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#10a2a7',
    marginTop: 10,
    fontSize: 16,
  },
  statusAberta: {
    color: '#ffd700',
  },
  statusPago: {
    color: '#00ff00',
  },
  statusCancelado: {
    color: '#ff0000',
  },
})
