import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import useContextoApp from '../../hooks/useContextoApp'
import BuscaClienteInput from '../../components/BuscaClienteInput'
import DatePickerCrossPlatform from '../../components/DatePickerCrossPlatform'
import { Picker } from '@react-native-picker/picker'
import { apiPostComContexto } from '../../utils/api'
import AbaPecas from '../../componentsFloresta/osFlorestal/AbaPecas'
import AbaServicos from '../../componentsFloresta/osFlorestal/AbaServicos'
import AbaTotais from '../../componentsFloresta/osFlorestal/AbaTotais'
import Toast from 'react-native-toast-message'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import BuscaPropriedades from '../../components/BuscaPropriedades'



export default function CriarOrdemServico({ navigation }) {
  const { usuarioId, empresaId, filialId, carregando } = useContextoApp()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState('cliente')
  const [osfl_orde, setOsflOrde] = useState(null)
  const [financeiroGerado, setFinanceiroGerado] = useState(false)
  const [totaisOs, setTotaisOs] = useState({
    osfl_tota_hect: 0,
    osfl_desc: 0,
    osfl_outr: 0,
    osfl_tota: 0,
  })
  
  const STATUS_ORDEM = [
    {
      label: 'Aberta',
      value: 0,
    },
    {
      label: 'Parcial',
      value: 1,
    },
    {
      label: 'Faturada',
      value: 2,
    },
    {
      label: 'Cancelada',
      value: 3,
    }
  ]
  const [ordemServico, setOrdemServico] = useState({
    osfl_forn: '',
    osfl_forn_nome: '',
    osfl_data_aber: new Date().toISOString().split('T')[0],
    osfl_tota_hect: 0,
    osfl_desc: 0,
    osfl_outr: 0,
    osfl_tota: 0,
    osfl_prop: '',
    osfl_stat: 0,
    pecas: [],
    servicos: [],
  })

  // Sincronizar totais entre ordemServico e totaisOs
  useEffect(() => {
    setTotaisOs(prev => ({
      ...prev,
      osfl_tota_hect: ordemServico.osfl_tota_hect || 0,
      osfl_desc: ordemServico.osfl_desc || 0,
      osfl_outr: ordemServico.osfl_outr || 0,
      osfl_tota: ordemServico.osfl_tota || 0,
    }))
  }, [ordemServico.osfl_tota_hect, ordemServico.osfl_desc, ordemServico.osfl_outr, ordemServico.osfl_tota])

  // Sincronizar mudanças de totaisOs de volta para ordemServico
  useEffect(() => {
    setOrdemServico(prev => ({
      ...prev,
      osfl_tota_hect: totaisOs.osfl_tota_hect || 0,
      osfl_desc: totaisOs.osfl_desc || 0,
      osfl_outr: totaisOs.osfl_outr || 0,
      osfl_tota: totaisOs.osfl_tota || 0,
    }))
  }, [totaisOs])

  const validarOrdemServico = () => {
    if (!ordemServico.osfl_forn) {
      Toast.show({
        type: 'error',
        text1: 'Cliente não selecionado',
        text2: 'Por favor, selecione um cliente para continuar',
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
        osfl_forn: ordemServico.osfl_forn,
        osfl_data_aber: ordemServico.osfl_data_aber,
        osfl_tota_hect: ordemServico.osfl_tota_hect || 0,
        osfl_desc: ordemServico.osfl_desc || 0,
        osfl_outr: ordemServico.osfl_outr || 0,
        osfl_tota: ordemServico.osfl_tota || 0,
        osfl_empr: empresaId?.toString() || '',
        osfl_fili: filialId?.toString() || '',
        osfl_prop: ordemServico.osfl_prop || '',  
        osfl_stat: ordemServico.osfl_stat || 0,
        usua: usuarioId?.toString() || '',
      }

      console.log('Payload a ser enviado:', payload)

      const data = await apiPostComContexto('Floresta/osflorestal/', payload)
      console.log('Resposta da API após criar O.S.:', data)

      if (!data.osfl_orde) {
        throw new Error('Número da O.S não retornado pelo servidor')
      }

      setOsflOrde(data.osfl_orde)
      setAbaAtiva('pecas')

      Toast.show({
        type: 'success',
        text1: 'O.S criada com sucesso!',
        text2: `Número da O.S: ${data.osfl_orde}. Agora você pode incluir peças.`,
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
          backgroundColor: '#f5f5f5',
        }}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{ color: '#333', marginTop: 10 }}>Carregando...</Text>
      </View>
    )
  }

  const validarMudancaAba = (novaAba) => {
    if (novaAba === 'cliente') {
      setAbaAtiva(novaAba)
      return
    }

    if (!osfl_orde) {
      Toast.show({
        type: 'error',
        text1: 'Atenção',
        text2: 'Salve a OS primeiro antes de acessar outras abas',
      })
      return
    }

    if (financeiroGerado && (novaAba === 'pecas' || novaAba === 'servicos')) {
      Toast.show({
        type: 'error',
        text1: 'Atenção',
        text2: 'Não é possível modificar peças/serviços após gerar o financeiro',
      })
      return
    }

    setAbaAtiva(novaAba)
  }

  return (
    <KeyboardAwareScrollView style={{ backgroundColor: '#f5f5f5' }}>
      <View style={{ padding: 20, backgroundColor: '#f5f5f5' }}>
        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          {['cliente', 'pecas', 'servicos', 'totais'].map((aba) => (
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
                borderBottomColor: abaAtiva === aba ? '#007bff' : '#ccc',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontWeight: abaAtiva === aba ? 'bold' : 'normal',
                  color: abaAtiva === aba ? '#007bff' : '#666',
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
              {osfl_orde && (
                <View style={styles.osNumeroContainer}>
                  <Text style={styles.osNumeroLabel}>Nº O.S:</Text>
                  <Text style={styles.osNumero}>{osfl_orde}</Text>
                </View>
              )}
              <Text style={styles.label}>Status:</Text>
              <Picker
                selectedValue={ordemServico.osfl_stat}
                style={styles.picker}
                onValueChange={(itemValue) => {
                  setOrdemServico((prev) => ({
                    ...prev,
                    osfl_stat: itemValue,
                  }))
                }}
                disabled={!!osfl_orde}
              >
                {STATUS_ORDEM.map((item) => (
                  <Picker.Item key={item.value} label={item.label} value={item.value} />
                ))}
              </Picker>
              
              <Text style={styles.label}>Data de Abertura:</Text>
              <DatePickerCrossPlatform
                value={ordemServico.osfl_data_aber}
                onChange={(selectedDate) => {
                  if (selectedDate && selectedDate instanceof Date && !isNaN(selectedDate.getTime())) {
                    setOrdemServico((prev) => ({
                      ...prev,
                      osfl_data_aber: selectedDate.toISOString().split('T')[0],
                    }))
                  }
                }}
                style={styles.datePickerButton}
                disabled={!!osfl_orde}
                placeholder="Selecione a data de abertura"
              />
              
              <Text style={styles.label}>Cliente:</Text>
              <BuscaClienteInput
                value={ordemServico.osfl_forn_nome}
                onSelect={(cliente) => {
                  setOrdemServico(prev => ({
                    ...prev,
                    osfl_forn: cliente.enti_clie,
                    osfl_forn_nome: cliente.enti_nome
                  }))
                }}
                placeholder="Selecione o cliente"
                editable={!osfl_orde}
              />
              <Text style={styles.label}>Propriedade:</Text>
              <BuscaPropriedades
                value={ordemServico.osfl_prop}
                onSelect={(propriedade) => {
                  setOrdemServico(prev => ({
                    ...prev,
                    osfl_prop: propriedade.prop_codi,
                    osfl_prop_nome: propriedade.prop_nome
                  }))
                }}
                placeholder="Selecione a propriedade"
                editable={!osfl_orde}
                style={styles.input}
              />
              <TouchableOpacity
                style={[
                  styles.salvarButton,
                  isSubmitting && styles.salvarButtonDisabled,
                ]}
                onPress={salvarOrdemServico}
                disabled={isSubmitting || !!osfl_orde}>
                <Text style={styles.salvarButtonText}>
                  {osfl_orde ? `OS Nº ${osfl_orde}` : isSubmitting ? 'Salvando...' : 'Salvar O.S'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {abaAtiva === 'pecas' && osfl_orde && (
            <AbaPecas
              pecas={ordemServico.pecas}
              setPecas={(pecas) => setOrdemServico(prev => ({ ...prev, pecas }))}
              osfl_orde={osfl_orde}
              financeiroGerado={financeiroGerado}
              osfl_forn={ordemServico.osfl_forn}
              osfl_empr={empresaId}
              osfl_fili={filialId}
            />
          )}
          
          {abaAtiva === 'servicos' && osfl_orde && (
            <AbaServicos
              servicos={ordemServico.servicos}
              setServicos={(servicos) => setOrdemServico(prev => ({ ...prev, servicos }))}
              osfl_orde={osfl_orde}
              financeiroGerado={financeiroGerado}
              osfl_forn={ordemServico.osfl_forn}
              osfl_empr={empresaId}
              osfl_fili={filialId}
            />
          )}
          
          {abaAtiva === 'totais' && osfl_orde && (
            <AbaTotais
              pecas={ordemServico.pecas}
              servicos={ordemServico.servicos}
              totaisOs={totaisOs}
              setTotaisOs={setTotaisOs}
              osfl_orde={osfl_orde}
              financeiroGerado={financeiroGerado}
              onFinanceiroGerado={setFinanceiroGerado}
            />
          )}

          {abaAtiva !== 'cliente' && !osfl_orde && (
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
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  osNumeroLabel: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  osNumero: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  label: {
    color: '#333',
    fontSize: 16,
    marginBottom: 8,
    marginTop: 15,
    fontWeight: '500',
  },
  datePickerButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  salvarButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  salvarButtonDisabled: {
    backgroundColor: '#6c757d',
    opacity: 0.7,
  },
  salvarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  avisoContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffc107',
    backgroundColor: '#fff3cd',
  },
  avisoText: {
    color: '#856404',
    textAlign: 'center',
    fontSize: 16,
  },
})
