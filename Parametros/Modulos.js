import React, { useEffect, useMemo, useState } from 'react'
import {
  ActionSheetIOS,
  View,
  Text,
  FlatList,
  Switch,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  TextInput,
  Platform,
  Pressable,
  SafeAreaView,
} from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { apiGetComContexto, apiPatchComContexto } from '../utils/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'

const PermissoesModulos = () => {
  const [modulos, setModulos] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [filiais, setFiliais] = useState([])
  const [empresaSelecionada, setEmpresaSelecionada] = useState('')
  const [filialSelecionada, setFilialSelecionada] = useState('')
  const [buscaNome, setBuscaNome] = useState('')
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    buscarEmpresas()
  }, [])

  useEffect(() => {
    if (empresaSelecionada) {
      setFilialSelecionada('')
      setFiliais([])
      setModulos([])
      setBuscaNome('')
      buscarFiliais(empresaSelecionada)
    }
  }, [empresaSelecionada])

  useEffect(() => {
    if (empresaSelecionada && filialSelecionada) {
      setBuscaNome('')
      buscarModulos()
    }
  }, [empresaSelecionada, filialSelecionada])

  const getFilialId = (filial) =>
    filial?.fili_codi || filial?.empr_empr || filial?.filial_id || filial?.id

  const buscarEmpresas = async () => {
    try {
      const data = await apiGetComContexto('licencas/empresas/')
      setEmpresas(data)
      if (data.length > 0) {
        setEmpresaSelecionada(data[0].empr_codi.toString())
      }
    } catch (error) {
      console.error('Erro ao buscar empresas:', error)
      Alert.alert('Erro', 'Erro ao carregar empresas')
    }
  }

  const buscarFiliais = async (empresaId) => {
    try {
      const data = await apiGetComContexto(
        `licencas/filiais/?empresa_id=${empresaId}`,
      )
      setFiliais(data)
      if (data.length > 0) {
        const primeiraFilial = data[0]

        // Lógica robusta: tenta as três propriedades na ordem de prioridade
        const filialId = getFilialId(primeiraFilial)

        if (filialId) {
          setFilialSelecionada(filialId.toString())
        } else {
          console.warn(
            '⚠️ [DEBUG] Nenhuma propriedade de filial encontrada:',
            primeiraFilial,
          )
        }
      }
    } catch (error) {
      console.error('Erro ao buscar filiais:', error)
      Alert.alert('Erro', 'Erro ao carregar filiais')
    }
  }

  const buscarModulos = async () => {
    try {
      setLoading(true)
      if (!empresaSelecionada || !filialSelecionada) {
        setModulos([])
        return
      }

      const data = await apiGetComContexto(
        `parametros-admin/atualizapermissoes/?empresa_id=${empresaSelecionada}&filial_id=${filialSelecionada}`,
      )

      setModulos(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao buscar módulos:', error)
      setModulos([])
    } finally {
      setLoading(false)
    }
  }

  const empresaOptions = empresas
    .map((empresa, index) => ({
      label: empresa?.empr_nome || `Empresa ${index + 1}`,
      value: (empresa?.empr_codi ?? index).toString(),
    }))
    .filter((o) => o.value)

  const filialOptions = filiais
    .map((filial, index) => {
      const filialId = getFilialId(filial)
      return {
        label:
          filial?.filial_nome || filial?.empr_nome || `Filial ${index + 1}`,
        value: filialId ? filialId.toString() : '',
      }
    })
    .filter((o) => o.value)

  const empresaLabel =
    empresaOptions.find((o) => o.value === empresaSelecionada)?.label || '—'
  const filialLabel =
    filialOptions.find((o) => o.value === filialSelecionada)?.label || '—'

  const abrirActionSheet = ({ title, options, selectedValue, onChange }) => {
    const labels = options.map((o) => o.label)
    const cancelButtonIndex = labels.length
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title,
        options: [...labels, 'Cancelar'],
        cancelButtonIndex,
        destructiveButtonIndex: undefined,
        userInterfaceStyle: 'dark',
      },
      (buttonIndex) => {
        if (buttonIndex === cancelButtonIndex) return
        const next = options[buttonIndex]?.value
        if (next && next !== selectedValue) onChange(next)
      },
    )
  }

  const alternarModulo = (nome) => {
    setModulos((prev) =>
      prev.map((mod) =>
        mod.nome === nome ? { ...mod, ativo: !mod.ativo } : mod,
      ),
    )
  }

  const modulosVisiveis = useMemo(() => {
    const query = buscaNome.trim().toLowerCase()
    const lista = Array.isArray(modulos) ? modulos : []

    return [...lista]
      .filter((m) => {
        const nome = String(m?.nome ?? '')
        if (!query) return true
        return nome.toLowerCase().includes(query)
      })
      .sort((a, b) =>
        String(a?.nome ?? '').localeCompare(String(b?.nome ?? ''), 'pt-BR', {
          sensitivity: 'base',
        }),
      )
  }, [buscaNome, modulos])

  const salvarPermissoes = async () => {
    if (!empresaSelecionada || !filialSelecionada) {
      Alert.alert('Atenção', 'Selecione empresa e filial')
      return
    }

    setSalvando(true)
    try {
      const usuario = await AsyncStorage.getItem('usuario_id')

      const payload = {
        usuario,
        empresa_id: empresaSelecionada,
        filial_id: filialSelecionada,
        modulos: modulos.map(({ nome, ativo }) => ({ nome, ativo })),
      }

      await apiPatchComContexto('parametros-admin/atualizapermissoes/', payload)
      Toast.show({
        type: 'success',
        text1: 'Permissões salvas',
        text2: 'Módulos atualizados com sucesso.',
        visibilityTime: 2500,
      })
    } catch (error) {
      console.error('Erro ao salvar permissões:', error)
      Alert.alert('Erro', 'Erro ao salvar permissões.')
    } finally {
      setSalvando(false)
    }
  }

  const renderItem = ({ item }) => (
    <View
      style={{
        flex: 1,
        backgroundColor: '#2f3e52',
        padding: 12,
        marginHorizontal: 6,
        marginBottom: 12,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 4,
      }}>
      <Text
        style={{
          color: '#fff',
          fontSize: 14,
          fontWeight: '600',
          flex: 1,
          paddingRight: 10,
        }}>
        {item.nome}
      </Text>
      <Switch
        value={item.ativo}
        onValueChange={() => alternarModulo(item.nome)}
        trackColor={{ false: '#777', true: '#34d399' }}
        thumbColor={item.ativo ? '#22c55e' : '#ccc'}
      />
    </View>
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#243242' }}>
      <View style={{ flex: 1, padding: 16 }}>
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{ color: '#fff', fontSize: 14, marginBottom: 8 }}>
              Empresa:
            </Text>
            {Platform.OS === 'ios' ? (
              <Pressable
                onPress={() =>
                  abrirActionSheet({
                    title: 'Empresa',
                    options: empresaOptions,
                    selectedValue: empresaSelecionada,
                    onChange: setEmpresaSelecionada,
                  })
                }
                style={{
                  backgroundColor: '#2f3e52',
                  borderRadius: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  minHeight: 44,
                  justifyContent: 'center',
                }}>
                <Text numberOfLines={1} style={{ color: '#fff', fontSize: 14 }}>
                  {empresaLabel}
                </Text>
              </Pressable>
            ) : (
              <View style={{ backgroundColor: '#2f3e52', borderRadius: 8 }}>
                <Picker
                  selectedValue={empresaSelecionada}
                  onValueChange={setEmpresaSelecionada}
                  style={{ color: '#fff' }}
                  dropdownIconColor="#fff">
                  {empresaOptions.map((empresa) => (
                    <Picker.Item
                      key={empresa.value}
                      label={empresa.label}
                      value={empresa.value}
                    />
                  ))}
                </Picker>
              </View>
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontSize: 14, marginBottom: 8 }}>
              Filial:
            </Text>
            {Platform.OS === 'ios' ? (
              <Pressable
                onPress={() =>
                  abrirActionSheet({
                    title: 'Filial',
                    options: filialOptions,
                    selectedValue: filialSelecionada,
                    onChange: setFilialSelecionada,
                  })
                }
                disabled={!empresaSelecionada || filialOptions.length === 0}
                style={{
                  backgroundColor:
                    !empresaSelecionada || filialOptions.length === 0
                      ? '#3a4a60'
                      : '#2f3e52',
                  borderRadius: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  minHeight: 44,
                  justifyContent: 'center',
                  opacity:
                    !empresaSelecionada || filialOptions.length === 0 ? 0.6 : 1,
                }}>
                <Text numberOfLines={1} style={{ color: '#fff', fontSize: 14 }}>
                  {filialLabel}
                </Text>
              </Pressable>
            ) : (
              <View style={{ backgroundColor: '#2f3e52', borderRadius: 8 }}>
                <Picker
                  selectedValue={filialSelecionada}
                  onValueChange={setFilialSelecionada}
                  style={{ color: '#fff' }}
                  dropdownIconColor="#fff">
                  {filialOptions.map((filial) => (
                    <Picker.Item
                      key={filial.value}
                      label={filial.label}
                      value={filial.value}
                    />
                  ))}
                </Picker>
              </View>
            )}
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
          }}>
          <Text style={{ color: '#fff', fontSize: 14, marginRight: 10 }}>
            Buscar:
          </Text>
          <View style={{ flex: 1 }}>
            <View
              style={{
                backgroundColor: '#2f3e52',
                borderRadius: 8,
                paddingHorizontal: 12,
              }}>
              <TextInput
                value={buscaNome}
                onChangeText={setBuscaNome}
                placeholder="Nome do módulo"
                placeholderTextColor="#9aa6b2"
                style={{ color: '#fff', fontSize: 14, paddingVertical: 10 }}
                autoCapitalize="none"
                autoCorrect={false}
                clearButtonMode="while-editing"
                keyboardAppearance="dark"
              />
            </View>
          </View>
        </View>

        {loading ? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <ActivityIndicator size="large" color="#0ea5e9" />
            <Text style={{ color: '#fff', marginTop: 10 }}>
              Carregando módulos...
            </Text>
          </View>
        ) : (
          <>
            <FlatList
              data={modulosVisiveis}
              keyExtractor={(item) => item.nome}
              renderItem={renderItem}
              numColumns={2}
              contentContainerStyle={{
                paddingBottom: 30,
                marginHorizontal: -6,
              }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={{ paddingVertical: 20 }}>
                  <Text style={{ color: '#fff', textAlign: 'center' }}>
                    Nenhum módulo encontrado para essa filial.
                  </Text>
                </View>
              }
            />

            <TouchableOpacity
              onPress={salvarPermissoes}
              style={{
                backgroundColor: salvando ? '#555' : '#0ea5e9',
                padding: 15,
                borderRadius: 8,
                marginTop: 20,
              }}
              disabled={salvando}>
              <Text
                style={{
                  color: '#fff',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: 16,
                }}>
                {salvando ? 'Salvando...' : 'Salvar Permissões'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  )
}

export default PermissoesModulos
