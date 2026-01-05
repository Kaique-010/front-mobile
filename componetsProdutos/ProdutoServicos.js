import React, { useState, useEffect } from 'react'
import { handleApiError } from '../utils/errorHandler'
import { Picker } from '@react-native-picker/picker'
import {
  View,
  TextInput,
  Switch,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-message'
import { apiPatchComContexto } from '../utils/api'

export default function ProdutoServicos({
  produto = {},
  slug = '',
  atualizarProduto: propAtualizarProduto,
}) {
  const navigation = useNavigation()
  const atualizarProduto = propAtualizarProduto

  const [prodEServico, setProdEServico] = useState(false)
  const [prodExigIss, setProdExigIss] = useState(1)
  const [prodIss, setProdIss] = useState('0,00')
  const [prodCodiServ, setProdCodiServ] = useState('')
  const [prodDescServ, setProdDescServ] = useState('')
  const [prodCnae, setProdCnae] = useState('')
  const [prodListTabeProd, setProdListTabeProd] = useState(false)

  const [empresaId, setEmpresaId] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const carregarContexto = async () => {
      try {
        const empresaIdStorage = await AsyncStorage.getItem('empresaId')
        setEmpresaId(empresaIdStorage || '1')
      } catch (error) {
        console.error('Erro ao carregar empresaId:', error)
      }
    }
    carregarContexto()
  }, [])

  useEffect(() => {
    try {
      console.log('📦 [ProdutoServicos] Recebendo produto:', produto)
      if (produto) {
        // Mapeando prod_e_serv (backend) ou prod_eserv (possível legado)
        if (produto.prod_e_serv !== undefined && produto.prod_e_serv !== null) {
          setProdEServico(Boolean(produto.prod_e_serv))
        } else if (
          produto.prod_eserv !== undefined &&
          produto.prod_eserv !== null
        ) {
          setProdEServico(Boolean(produto.prod_eserv))
        }

        if (
          produto.prod_exig_iss !== undefined &&
          produto.prod_exig_iss !== null
        ) {
          setProdExigIss(Number(produto.prod_exig_iss))
        }

        if (produto.prod_iss !== undefined && produto.prod_iss !== null) {
          setProdIss(String(produto.prod_iss).replace('.', ','))
        }

        if (
          produto.prod_codi_serv !== undefined &&
          produto.prod_codi_serv !== null
        ) {
          setProdCodiServ(String(produto.prod_codi_serv))
        }

        if (
          produto.prod_desc_serv !== undefined &&
          produto.prod_desc_serv !== null
        ) {
          setProdDescServ(String(produto.prod_desc_serv))
        }

        if (produto.prod_cnae !== undefined && produto.prod_cnae !== null) {
          setProdCnae(String(produto.prod_cnae))
        }

        // Mapeando prod_list_tabe_prec (backend)
        if (
          produto.prod_list_tabe_prec !== undefined &&
          produto.prod_list_tabe_prec !== null
        ) {
          setProdListTabeProd(Boolean(produto.prod_list_tabe_prec))
        }
      }
    } catch (error) {
      console.warn('Falha ao pré-preencher campos de serviços:', error)
    }
  }, [produto])

  const salvar = async () => {
    if (!produto?.prod_codi) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Produto inválido: código não informado',
      })
      return
    }

    if (prodEServico) {
      if (!prodCnae) {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Quando é serviço, CNAE é obrigatório.',
        })
        return
      }
      if (!prodCodiServ) {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Quando é serviço, código do serviço é obrigatório.',
        })
        return
      }
    }

    setLoading(true)

    const empresaIdStorage = await AsyncStorage.getItem('empresaId')
    const filialIdStorage = await AsyncStorage.getItem('filialId')

    const payload = {
      prod_empr: parseInt(empresaIdStorage) || 1,
      prod_fili: parseInt(filialIdStorage) || 1,
      prod_codi: String(produto.prod_codi),
      prod_e_serv: Boolean(prodEServico),
      prod_exig_iss: Number(prodExigIss),
      prod_iss: parseFloat(prodIss.replace(',', '.')) || 0,
      prod_codi_serv: String(prodCodiServ),
      prod_desc_serv: String(prodDescServ),
      prod_cnae: String(prodCnae),
      prod_list_tabe_prec: Boolean(prodListTabeProd),
    }
    console.log('payload na aba de serviços', payload)

    const empresa = produto?.prod_empr || payload.prod_empr
    const codigo = String(produto.prod_codi)
    const endpoint = `produtos/produtos/${empresa}/${codigo}/`
    console.log('endpoint', endpoint)

    try {
      const response = await apiPatchComContexto(endpoint, payload, 'prod_')

      // Atualizar o cache com os dados retornados da API
      const dadosAtualizados = response?.data || response || {}

      if (dadosAtualizados) {
        await AsyncStorage.setItem(
          `precos-produto-${produto.prod_codi}`,
          JSON.stringify(dadosAtualizados)
        )
      }

      Toast.show({
        type: 'success',
        text1: 'Sucesso!',
        text2: 'Dados de Serviço atualizados com sucesso',
      })

      // Atualizar o produto localmente com os campos salvos
      const novosCampos = {
        prod_e_serv: payload.prod_e_serv,
        prod_exig_iss: payload.prod_exig_iss,
        prod_iss: payload.prod_iss,
        prod_codi_serv: payload.prod_codi_serv,
        prod_desc_serv: payload.prod_desc_serv,
        prod_cnae: payload.prod_cnae,
        prod_list_tabe_prec: payload.prod_list_tabe_prec,
      }
      atualizarProduto({
        ...produto,
        ...novosCampos,
        ...(dadosAtualizados || {}),
      })
      setTimeout(() => navigation.goBack(), 1000)
    } catch (error) {
      console.error('Erro ao salvar serviço:', error)
      handleApiError(error, 'Não foi possível salvar os dados de Serviços.')
    } finally {
      setLoading(false)
    }
  }

  const formatarNumero = (valor) => {
    // Remove caracteres não numéricos exceto vírgula
    const numero = valor.replace(/[^\d,]/g, '')
    // Garante apenas uma vírgula
    const partes = numero.split(',')
    if (partes.length > 2) {
      return partes[0] + ',' + partes[1]
    }
    return numero
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.switchContainer}>
        <Text style={styles.label}>É Serviço?</Text>
        <Switch
          value={Boolean(prodEServico)}
          onValueChange={setProdEServico}
          trackColor={{ false: '#767577', true: '#0058A2' }}
          thumbColor={prodEServico ? '#f4f3f4' : '#f4f3f4'}
        />
      </View>
      <Campo
        label="Código do Serviço"
        value={prodCodiServ}
        onChange={(valor) => setProdCodiServ(valor)}
        placeholder="Código do Serviço"
        keyboardType="default"
      />
      <Campo
        label="Descrição do Serviço"
        value={prodDescServ}
        onChange={(valor) => setProdDescServ(valor)}
        placeholder="Descrição do Serviço"
        keyboardType="default"
      />
      <Campo
        label="CNAE"
        value={prodCnae}
        onChange={(valor) => setProdCnae(valor)}
        placeholder="CNAE"
      />
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Exigir ISS?</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={prodExigIss}
            onValueChange={(itemValue) => setProdExigIss(Number(itemValue))}
            style={styles.picker}
            dropdownIconColor="white"
            mode="dropdown">
            <Picker.Item label="Exigível" value={1} />
            <Picker.Item label="Não Exigível" value={2} />
            <Picker.Item label="Isenção" value={3} />
            <Picker.Item label="Exportação" value={4} />
          </Picker>
        </View>
      </View>
      <Campo
        label="ISS"
        value={prodIss}
        onChange={(valor) => setProdIss(formatarNumero(valor))}
        placeholder="0,00"
      />
      <View style={styles.switchContainer}>
        <Text style={styles.label}>Listar na Tabela de Produtos?</Text>
        <Switch
          value={prodListTabeProd}
          onValueChange={(valor) => setProdListTabeProd(valor)}
          trackColor={{ false: '#767577', true: '#0058A2' }}
          thumbColor={prodListTabeProd ? '#f4f3f4' : '#f4f3f4'}
        />
      </View>
      <TouchableOpacity
        onPress={salvar}
        style={[styles.button, loading && { opacity: 0.6 }]}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Salvar</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  )
}

function Campo({
  label,
  value,
  onChange,
  editable = true,
  dark = false,
  placeholder,
  keyboardType = 'decimal-pad',
}) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        editable={editable}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={dark ? '#666' : '#999'}
        style={[
          styles.input,
          !editable && {
            backgroundColor: dark ? '#333' : '#eee',
            color: dark ? '#fff' : '#000',
          },
        ]}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 35,
    backgroundColor: '#0B141A',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: 'transparent',
  },
  pickerContainer: {
    marginBottom: 12,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  picker: {
    color: 'white',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
    padding: 10,
    fontSize: 16,
    color: 'white',
  },
  label: {
    marginBottom: 4,
    fontWeight: 'bold',
    fontSize: 14,
    color: '#fff',
  },
  button: {
    backgroundColor: '#0058A2',
    padding: 12,
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
})
