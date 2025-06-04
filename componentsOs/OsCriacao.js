import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import useContextoApp from '../hooks/useContextoApp'
import BuscaClienteInput from '../components/BuscaClienteInput'
import { apiPostComContexto } from '../utils/api'
import AbaPecas from '../componentsOs/AbaPecas'
import AbaServicos from '../componentsOs/AbaServicos'
import AbaFotos from '../componentsOs/AbaForos'
import AbaTotais from '../componentsOs/AbaTotais'
import Toast from 'react-native-toast-message'

export default function CriarOrdemServico() {
  const { usuarioId, empresaId, filialId, carregando } = useContextoApp()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState('cliente')
  const [numeroOS, setNumeroOS] = useState(null)

  const [ordemServico, setOrdemServico] = useState({
    orde_enti: null,
    orde_clie_nome: '',
    orde_data_abertura: new Date().toISOString(),
    pecas: [],
    servicos: [],
    fotos: [],
  })

  const validarOrdemServico = () => {
    if (!ordemServico.orde_enti) {
      Toast.show({
        type: 'error',
        text1: 'Cliente não selecionado',
        text2: 'Por favor, selecione um cliente para continuar',
      })
      return false
    }

    if (!ordemServico.orde_data_abertura) {
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
      const payload = {
        ...ordemServico,
        orde_empr: empresaId.toString(),
        orde_fili: filialId.toString(),
        usua: usuarioId.toString(),
      }

      delete payload.empresaId
      delete payload.filialId
      delete payload.usuarioId
      delete payload.orde_nume

      console.log('Payload a ser enviado:', payload)

      const data = await apiPostComContexto('ordemdeservico/ordens/', payload)
      console.log('Resposta da API após criar O.S.:', data)

      if (!data.orde_nume) {
        throw new Error('Número da O.S não retornado pelo servidor')
      }

      setNumeroOS(data.orde_nume)
      setAbaAtiva('pecas')

      Toast.show({
        type: 'success',
        text1: 'O.S criada com sucesso!',
        text2: `Número da O.S: ${data.orde_nume}. Agora você pode incluir peças.`,
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
          backgroundColor: '#121212',
        }}>
        <ActivityIndicator size="large" color="#10a2a7" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Carregando...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#121212' }}>
      <View style={{ padding: 20 }}>
        {/* Abas */}
        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          {['cliente', 'pecas', 'servicos', 'fotos', 'totais'].map((aba) => (
            <TouchableOpacity
              key={aba}
              onPress={() => setAbaAtiva(aba)}
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

              <Text style={styles.label}>Data de Abertura:</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={styles.datePickerButton}>
                <Text style={{ color: '#fff' }}>
                  {new Date(
                    ordemServico.orde_data_abertura
                  ).toLocaleDateString()}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={new Date(ordemServico.orde_data_abertura)}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(Platform.OS === 'ios')
                    if (selectedDate) {
                      setOrdemServico((prev) => ({
                        ...prev,
                        orde_data_abertura: selectedDate.toISOString(),
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
                    orde_enti: item.enti_clie,
                    orde_clie_nome: item.enti_nome,
                  }))
                }}
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

          {abaAtiva === 'pecas' && numeroOS && (
            <AbaPecas
              pecas={ordemServico.pecas}
              setPecas={(pecasNovas) =>
                setOrdemServico((prev) => ({ ...prev, pecas: pecasNovas }))
              }
              orde_nume={numeroOS}
            />
          )}

          {abaAtiva === 'servicos' && numeroOS && (
            <AbaServicos
              servicos={ordemServico.servicos}
              setServicos={(servicosNovos) =>
                setOrdemServico((prev) => ({
                  ...prev,
                  servicos: servicosNovos,
                }))
              }
              orde_nume={numeroOS}
            />
          )}

          {abaAtiva === 'fotos' && numeroOS && (
            <AbaFotos
              fotos={ordemServico.fotos}
              setFotos={(fotosNovas) =>
                setOrdemServico((prev) => ({ ...prev, fotos: fotosNovas }))
              }
              orde_nume={numeroOS}
            />
          )}

          {abaAtiva === 'totais' && numeroOS && (
            <AbaTotais
              pecas={ordemServico.pecas}
              servicos={ordemServico.servicos}
              orde_nume={numeroOS}
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
    </ScrollView>
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
})
