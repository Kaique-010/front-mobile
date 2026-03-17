import React from 'react'
import { View, Text, TextInput } from 'react-native'

export default function NotaFiscalAbaTransporte({
  styles,
  transporte,
  setTransporte,
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Transporte</Text>

      <Text style={styles.label}>Modalidade Frete</Text>
      <TextInput
        style={styles.input}
        value={transporte.modalidade_frete}
        onChangeText={(v) =>
          setTransporte((t) => ({ ...t, modalidade_frete: v }))
        }
        placeholder="0"
        placeholderTextColor="#666"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Transportadora (ID)</Text>
      <TextInput
        style={styles.input}
        value={transporte.transportadora}
        onChangeText={(v) =>
          setTransporte((t) => ({ ...t, transportadora: v }))
        }
        placeholder="0"
        placeholderTextColor="#666"
        keyboardType="numeric"
      />

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Placa</Text>
          <TextInput
            style={styles.input}
            value={transporte.placa_veiculo}
            onChangeText={(v) =>
              setTransporte((t) => ({ ...t, placa_veiculo: v }))
            }
            placeholder=""
            placeholderTextColor="#666"
          />
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>UF</Text>
          <TextInput
            style={styles.input}
            value={transporte.uf_veiculo}
            onChangeText={(v) =>
              setTransporte((t) => ({ ...t, uf_veiculo: v }))
            }
            placeholder=""
            placeholderTextColor="#666"
            maxLength={2}
            autoCapitalize="characters"
          />
        </View>
      </View>
    </View>
  )
}
