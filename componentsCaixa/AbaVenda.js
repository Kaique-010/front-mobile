import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import BuscaClienteInput from '../components/BuscaClienteInput'
import BuscaVendedorInput from '../components/BuscaVendedorInput'
import { Ionicons } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import { apiPostComContexto } from '../utils/api'

import useContextApp from '../hooks/useContextoApp'

function CampoResultado({ label, valor, onClear }) {
  if (!valor) return null
  return (
    <View style={styles.resultadoContainer}>
      <Text style={styles.resultado}>
        {label}: {valor}
      </Text>
      <TouchableOpacity onPress={onClear}>
        <Ionicons name="close-circle" size={20} color="#f55" />
      </TouchableOpacity>
    </View>
  )
}

export default function AbaVenda({ mov, setMov, onAvancar }) {
  const { empresaId, filialId, usuario_id } = useContextApp()
  const [loading, setLoading] = useState(false)

  const vendedorFormatado =
    mov?.movi_vend && mov?.movi_vend_nome
      ? `${mov.movi_vend} - ${mov.movi_vend_nome}`
      : ''

  const handleAvancar = async () => {
    if (!mov.movi_clie || !mov.movi_vend || !mov.movi_caix) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Cliente, vendedor e caixa são obrigatórios',
      })
      return
    }

    try {
      setLoading(true)

      const dadosVenda = {
        cliente: mov.movi_clie,
        vendedor: mov.movi_vend,
        empresa: empresaId,
        filial: filialId,
        operador: usuario_id,
        caixa: mov.movi_caix,
        data: new Date().toISOString().slice(0, 10),
      }

      console.log('🔍 DEBUG AbaVenda - Dados sendo enviados:', {
        mov: mov,
        dadosVenda: dadosVenda,
        cliente_nome: mov.movi_clie_nome,
        vendedor_nome: mov.movi_vend_nome,
        operador: usuario_id,
      })

      const response = await apiPostComContexto(
        'caixadiario/movicaixa/iniciar_venda/',
        dadosVenda
      )

      if (response?.numero_venda) {
        setMov((prev) => ({
          ...prev,
          movi_nume_vend: response.numero_venda,
        }))
        Toast.show({
          type: 'success',
          text1: 'Venda criada',
          text2: `Número da venda: ${response.numero_venda}`,
        })
        onAvancar()
      } else {
        throw new Error('Número da venda não retornado')
      }
    } catch (error) {
      let mensagemErro = 'Erro ao comunicar com servidor'
      if (error.response?.data?.detail?.includes('Licença')) {
        mensagemErro = 'Erro de licença. Por favor, verifique suas credenciais.'
      } else if (error.response?.data?.detail) {
        mensagemErro = error.response.data.detail
      }

      Toast.show({
        type: 'error',
        text1: 'Erro ao criar venda',
        text2: mensagemErro,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.scene}>
      <View style={styles.inputWrapper}>
        <Text style={styles.label}>
          <Ionicons name="person-outline" size={20} color="#aaa" />
          Cliente:
        </Text>
        <BuscaClienteInput
          inputStyle={styles.input}
          onSelect={(item) => {
            if (!item) {
              setMov((prev) => ({
                ...prev,
                movi_clie: null,
                movi_clie_nome: null,
              }))
              return
            }
            setMov((prev) => ({
              ...prev,
              movi_clie: item.enti_clie,
              movi_clie_nome: item.enti_nome,
            }))
          }}
        />
        <CampoResultado
          label="Cliente"
          valor={mov.movi_clie_nome}
          onClear={() =>
            setMov((prev) => ({
              ...prev,
              movi_clie: null,
              movi_clie_nome: '',
            }))
          }
        />
      </View>

      <View style={styles.inputWrapper}>
        <Text style={styles.label}>
          <Ionicons name="business-outline" size={20} color="#aaa" />
          Vendedor:
        </Text>
        <BuscaVendedorInput
          value={vendedorFormatado}
          inputStyle={styles.input}
          onSelect={(item) => {
            if (!item) {
              setMov((prev) => ({
                ...prev,
                movi_vend: null,
                movi_vend_nome: null,
              }))
              return
            }
            setMov((prev) => ({
              ...prev,
              movi_vend: item.enti_vend || item.enti_clie,
              movi_vend_nome: item.enti_nome,
            }))
          }}
        />
        <CampoResultado
          label="Vendedor"
          valor={mov.movi_vend_nome}
          onClear={() =>
            setMov((prev) => ({
              ...prev,
              movi_vend: null,
              movi_vend_nome: '',
            }))
          }
        />
      </View>
      <TouchableOpacity
        style={[styles.botaoAvancar, loading && styles.botaoDesabilitado]}
        onPress={handleAvancar}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.botaoTexto}>Avançar</Text>
        )}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  scene: {
    flex: 1,
    padding: 40,
  },
  inputWrapper: {
    marginBottom: 30,
  },
  label: {
    color: '#bbb',
    marginBottom: 15,
    fontSize: 20,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  resultadoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  resultado: {
    color: '#faebd7',
    fontSize: 16,
  },
  botaoAvancar: {
    backgroundColor: '#10a2a7',
    padding: 15,
    borderRadius: 8,
    alignItems: 'flex-start',
    marginTop: 20,
    width: '30%',
  },
  botaoDesabilitado: {
    opacity: 0.5,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'left',
  },
})
