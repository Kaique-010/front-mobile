import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TextInput,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import useContextoApp from '../hooks/useContextoApp'
import BuscaClienteInput from '../components/BuscaClienteInput'
import { apiPostComContexto } from '../utils/api'
import AbaServicos from './AbaServicos'
import AbaTotais from './AbaTotais'
import SignatureField from './SignatureField'
import Toast from 'react-native-toast-message'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

export default function OrdemCriacaoExterna({ navigation }) {
  // Adicionamos os_resp e os_resp_nome como propriedades que serao preenchidas
  // pelo BuscaClienteInput, abas ativas como dados, serviços e totais
  const { usuarioId, empresaId, filialId, carregando } = useContextoApp()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState('cliente')
  const [numeroOS, setNumeroOS] = useState(null)
  const [scrollLock, setScrollLock] = useState(false)
  const [financeiroGerado, setFinanceiroGerado] = useState(false)

  // Aqui passamos o states os_resp e os_resp_nome para o BuscaClienteInput
  const [ordemServico, setOrdemServico] = useState({
    os_clie: null,
    os_resp: null,
    os_clie_nome: '',
    os_data_aber: new Date().toISOString().split('T')[0],
    servicos: [],
    os_assi_clie: '',
    os_assi_oper: '',
    os_km_inic: 0,
    os_km_tota: 0,
  })

  const validarOrdemServico = () => {
    if (!ordemServico.os_clie) {
      Toast.show({
        type: 'error',
        text1: 'Cliente não selecionado',
        text2: 'Por favor, selecione um cliente para continuar',
      })
      return false
    }

    if (!ordemServico.os_data_aber) {
      Toast.show({
        type: 'error',
        text1: 'Data inválida',
        text2: 'Por favor, selecione uma data válida',
      })
      return false
    }

    return true
  }

  const salvarOrdemServico = async () => {
    if (!validarOrdemServico() || isSubmitting) return

    setIsSubmitting(true)
    try {
      console.log('Estado atual do ordemServico:', ordemServico)
      console.log(ordemServico.os_assi_clie?.slice(0, 30))

      const payload = {
        osex_clie: ordemServico.os_clie,
        osex_resp: ordemServico.os_resp,
        osex_data_aber: ordemServico.os_data_aber,
        osex_empr: empresaId?.toString() || '',
        osex_fili: filialId?.toString() || '',
        osex_usua: usuarioId?.toString() || '',
        osex_assi_clie: ordemServico.os_assi_clie || '',
        osex_assi_oper: ordemServico.os_assi_oper || '',
        osex_km_inic: ordemServico.os_km_inic || 0,
      }

      delete payload.empresaId
      delete payload.filialId
      delete payload.usuarioId
      delete payload.osex_codi

      console.log('Payload a ser enviado:', payload)

      const data = await apiPostComContexto('osexterna/ordens/', payload)
      console.log('Resposta da API após criar O.S.:', data)

      const novoNumero = data?.osex_codi || data?.osex_os
      if (!novoNumero) {
        throw new Error('Número da O.S não retornado pelo servidor')
      }

      setNumeroOS(novoNumero)
      setAbaAtiva('servicos')

      Toast.show({
        type: 'success',
        text1: 'O.S criada com sucesso!',
        text2: `Número da O.S: ${novoNumero}. Agora você pode incluir serviços.`,
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao criar O.S',
        text2: error.message || 'Tente novamente mais tarde',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (carregando) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#1a2f3d', // Alterado de '#121212' para '#1a2f3d'
        }}>
        <ActivityIndicator size="large" color="#10a2a7" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Carregando...</Text>
      </View>
    )
  }

  const validarMudancaAba = (novaAba) => {
    if (financeiroGerado && novaAba === 'servicos') {
      Toast.show({
        type: 'warning',
        text1: 'Atenção',
        text2: 'Não é possível modificar serviços após gerar o financeiro',
      })
      return false
    }
    return true
  }

  return (
    <KeyboardAwareScrollView
      style={{ backgroundColor: '#1a2f3d' }}
      scrollEnabled={!scrollLock}>
      <View style={{ padding: 20, backgroundColor: '#1a2f3d' }}>
        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          {['cliente', 'servicos', 'totais'].map((aba) => (
            <TouchableOpacity
              key={aba}
              onPress={() => {
                if (validarMudancaAba(aba)) {
                  setAbaAtiva(aba)
                }
              }}
              style={{
                flex: 1,
                padding: 10,
                borderBottomWidth: 2,
                borderBottomColor: abaAtiva === aba ? '#10a2a7' : 'gray',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontWeight: abaAtiva === aba ? 'bold' : 'normal',
                  color: abaAtiva === aba ? '#10a2a7' : '#fff',
                }}>
                {aba === 'cliente'
                  ? 'Dados O.S'
                  : aba.charAt(0).toUpperCase() + aba.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ flex: 1 }}>
          {abaAtiva === 'cliente' && (
            <>
              {numeroOS && (
                <View style={styles.osNumeroContainer}>
                  <Text style={styles.osNumeroLabel}>Nº O.S:</Text>
                  <Text style={styles.osNumero}>{numeroOS}</Text>
                </View>
              )}
              {/* Campos do cliente e data */}
              <Text style={styles.label}>Data de Abertura:</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={styles.datePickerButton}>
                <Text style={{ color: '#fff' }}>
                  {new Date(ordemServico.os_data_aber).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={new Date(ordemServico.os_data_aber)}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(Platform.OS === 'ios')
                    if (selectedDate) {
                      setOrdemServico((prev) => ({
                        ...prev,
                        os_data_aber: selectedDate.toISOString().split('T')[0],
                      }))
                    }
                  }}
                />
              )}
              <Text style={styles.label}>Cliente:</Text>
              <BuscaClienteInput
                onSelect={(item) => {
                  setOrdemServico((prev) => ({
                    ...prev,
                    os_clie: item.enti_clie,
                    os_clie_nome: item.enti_nome,
                  }))
                }}
                value={ordemServico.os_clie_nome}
              />
              <Text style={styles.label}>Responsável Técnico:</Text>
              <BuscaClienteInput
                onSelect={(item) => {
                  setOrdemServico((prev) => ({
                    ...prev,
                    os_resp: item.enti_clie,
                    os_resp_nome: item.enti_nome,
                  }))
                }}
                value={ordemServico.os_resp_nome}
              />
              <Text style={styles.label}>Km Inicial:</Text>
              <TextInput
                style={styles.inputKm}
                value={ordemServico.os_km_inic}
                onChangeText={(text) =>
                  setOrdemServico((prev) => ({
                    ...prev,
                    os_km_inic: Number(text) || 0,
                  }))
                }
                keyboardType="numeric"
              />
              <SignatureField
                label="Assinatura do Cliente"
                value={ordemServico.os_assi_clie}
                onChange={(base64) =>
                  setOrdemServico((prev) => ({ ...prev, os_assi_clie: base64 }))
                }
                onSigningChange={setScrollLock}
              />
              <SignatureField
                label="Assinatura do Operador"
                value={ordemServico.os_assi_oper}
                onChange={(base64) =>
                  setOrdemServico((prev) => ({ ...prev, os_assi_oper: base64 }))
                }
                onSigningChange={setScrollLock}
              />
              <TouchableOpacity
                style={[
                  styles.salvarButton,
                  isSubmitting && styles.salvarButtonDisabled,
                ]}
                onPress={salvarOrdemServico}
                disabled={isSubmitting}>
                <Text style={styles.salvarButtonText}>
                  {isSubmitting ? 'Salvando...' : 'Salvar O.S'}
                </Text>
              </TouchableOpacity>
            </>
          )}
          {abaAtiva === 'servicos' && (
            <AbaServicos
              servicos={ordemServico.servicos}
              setServicos={(novosServicos) =>
                setOrdemServico((prev) => ({
                  ...prev,
                  servicos: novosServicos,
                }))
              }
              os_os={numeroOS}
              financeiroGerado={financeiroGerado}
            />
          )}
          {abaAtiva === 'totais' && (
            <AbaTotais
              servicos={ordemServico.servicos}
              os_os={numeroOS}
              os_clie={ordemServico.os_clie}
              os_empr={empresaId}
              os_fili={filialId}
            />
          )}

          {abaAtiva !== 'cliente' && !numeroOS && (
            <View style={styles.avisoContainer}>
              <Text style={styles.avisoText}>
                Primeiro salve os dados básicos da O.S para continuar
              </Text>
            </View>
          )}
        </View>
      </View>
    </KeyboardAwareScrollView>
  )
}

const styles = StyleSheet.create({
  osNumeroContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2f3d',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  osNumeroLabel: {
    color: '#10a2a7',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  osNumero: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
    marginTop: 15,
  },
  datePickerButton: {
    backgroundColor: '#1a2f3d',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  salvarButton: {
    backgroundColor: '#10a2a7',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  salvarButtonDisabled: {
    backgroundColor: '#0c7c80',
    opacity: 0.7,
  },
  salvarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  assinaturaInput: {
    backgroundColor: '#1a2f3d',
    borderColor: '#2c3e50',
    borderWidth: 1,
    color: '#fff',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  avisoContainer: {
    backgroundColor: '#1a2f3d',
    padding: 20,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  avisoText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  inputKm: {
    backgroundColor: '#1a2f3d',
    borderColor: '#2a4ad6ff',
    borderWidth: 1,
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
})
