import React, { useState } from 'react'
import {
  View,
  Text,
  Button,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import useContextoApp from '../hooks/useContextoApp'
import BuscaClienteInput from '../components/BuscaClienteInput'
import { apiPostComContexto } from '../utils/api'
import AbaPecas from '../componentsOs/AbaPecas'
import AbaServicos from '../componentsOs/AbaServicos'
import AbaFotos from '../componentsOs/AbaForos'

export default function CriarOrdemServico() {
  const { usuarioId, empresaId, filialId, carregando } = useContextoApp()

  const [showDatePicker, setShowDatePicker] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState('cliente')
  const [numeroOS, setNumeroOS] = useState(null)

  const [ordemServico, setOrdemServico] = useState({
    orde_clie: null,
    orde_clie_nome: '',
    orde_data_abertura: new Date().toISOString(),
    pecas: [],
    servicos: [],
    fotos: [],
  })

  if (carregando)
    return <Text style={{ color: '#fff' }}>Carregando contexto...</Text>

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#121212' }}>
      {/* Abas */}
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        {['cliente', 'pecas', 'servicos', 'fotos'].map((aba) => (
          <TouchableOpacity
            key={aba}
            onPress={() => setAbaAtiva(aba)}
            style={{
              flex: 1,
              padding: 10,
              borderBottomWidth: 2,
              borderBottomColor: abaAtiva === aba ? 'deepskyblue' : 'gray',
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontWeight: abaAtiva === aba ? 'bold' : 'normal',
                color: '#fff',
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
              <Text style={{ color: '#0f0', fontWeight: 'bold', fontSize: 18 }}>
                Nº O.S: {numeroOS}
              </Text>
            )}

            <Text style={{ marginTop: 10, color: '#fff' }}>
              Data de Abertura:
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={{
                padding: 10,
                backgroundColor: '#222',
                borderRadius: 4,
                marginBottom: 20,
              }}>
              <Text style={{ color: '#fff' }}>
                {new Date(ordemServico.orde_data_abertura).toLocaleDateString()}
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

            <Text style={{ marginTop: 10, color: '#fff' }}>Cliente:</Text>
            <BuscaClienteInput
              onSelect={(item) => {
                setOrdemServico((prev) => ({
                  ...prev,
                  orde_clie: item.enti_clie,
                  orde_clie_nome: item.enti_nome,
                }))
              }}
            />

            <Button
              title="Salvar O.S"
              onPress={async () => {
                if (!ordemServico.orde_clie) {
                  alert('Selecione um cliente.')
                  return
                }

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

                try {
                  const data = await apiPostComContexto(
                    'ordemdeservico/ordens/',
                    payload
                  )

                  if (!data.orde_nume)
                    throw new Error('Número da O.S não retornado.')

                  setNumeroOS(data.orde_nume)
                  setAbaAtiva('pecas')
                  alert(
                    `O.S criada: ${data.orde_nume}. Agora pode incluir peças.`
                  )
                } catch (error) {
                  alert('Erro ao criar O.S: ' + error.message)
                }
              }}
            />
          </>
        )}

        {abaAtiva === 'pecas' && (
          <AbaPecas
            pecas={ordemServico.pecas}
            setPecas={(pecasNovas) =>
              setOrdemServico((prev) => ({ ...prev, pecas: pecasNovas }))
            }
            orde_nume={numeroOS}
          />
        )}

        {abaAtiva === 'servicos' && (
          <AbaServicos
            servicos={ordemServico.servicos}
            setServicos={(servicosNovos) =>
              setOrdemServico((prev) => ({ ...prev, servicos: servicosNovos }))
            }
          />
        )}

        {abaAtiva === 'fotos' && (
          <AbaFotos
            ordemServico={ordemServico}
            setOrdemServico={setOrdemServico}
          />
        )}
      </View>
    </View>
  )
}
