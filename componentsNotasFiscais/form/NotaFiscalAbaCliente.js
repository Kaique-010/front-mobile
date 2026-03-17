import React, { useMemo } from 'react'
import { View, Text } from 'react-native'
import BuscaClienteInput from '../../componentsNotasFiscais/buscas/BuscaClienteInput'

const textoCliente = (item) => {
  if (!item) return ''
  const id = item.enti_clie != null ? String(item.enti_clie) : ''
  const nome = item.enti_nome != null ? String(item.enti_nome) : ''
  const cidade = item.enti_cida != null ? String(item.enti_cida) : ''
  const partes = [id, nome, cidade].filter((p) => String(p).trim().length > 0)
  return partes.join(' - ')
}

export default function NotaFiscalAbaCliente({
  styles,
  cliente,
  setCliente,
  clienteSelecionado,
  setClienteSelecionado,
}) {
  const value = useMemo(() => {
    const txt = textoCliente(clienteSelecionado)
    if (txt) return txt
    return cliente?.destinatario ? String(cliente.destinatario) : ''
  }, [cliente?.destinatario, clienteSelecionado])

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Destinatário</Text>
      <Text style={styles.label}>Cliente</Text>
      <BuscaClienteInput
        onSelect={(item) => {
          setClienteSelecionado(item)
          if (item?.enti_clie != null) {
            setCliente({ destinatario: String(item.enti_clie) })
          } else {
            setCliente({ destinatario: '' })
          }
        }}
        placeholder="Buscar cliente..."
        value={value}
        tipo="clientes"
      />
    </View>
  )
}
