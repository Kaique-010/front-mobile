import React from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'

export default function NotaFiscalAbaCfop({
  styles,
  cfopPadrao,
  setCfopPadrao,
  aplicarCfopPadraoNosItens,
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>CFOP / Tributação</Text>

      <Text style={styles.label}>CFOP</Text>
      <TextInput
        style={styles.input}
        value={cfopPadrao.cfop}
        onChangeText={(v) => setCfopPadrao((c) => ({ ...c, cfop: v }))}
        placeholder=""
        placeholderTextColor="#666"
      />

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>NCM</Text>
          <TextInput
            style={styles.input}
            value={cfopPadrao.ncm}
            onChangeText={(v) => setCfopPadrao((c) => ({ ...c, ncm: v }))}
            placeholder="00000000"
            placeholderTextColor="#666"
          />
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>CEST</Text>
          <TextInput
            style={styles.input}
            value={cfopPadrao.cest}
            onChangeText={(v) => setCfopPadrao((c) => ({ ...c, cest: v }))}
            placeholder=""
            placeholderTextColor="#666"
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>CST ICMS</Text>
          <TextInput
            style={styles.input}
            value={cfopPadrao.cst_icms}
            onChangeText={(v) => setCfopPadrao((c) => ({ ...c, cst_icms: v }))}
            placeholder=""
            placeholderTextColor="#666"
          />
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>CST PIS</Text>
          <TextInput
            style={styles.input}
            value={cfopPadrao.cst_pis}
            onChangeText={(v) => setCfopPadrao((c) => ({ ...c, cst_pis: v }))}
            placeholder=""
            placeholderTextColor="#666"
          />
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>CST COFINS</Text>
          <TextInput
            style={styles.input}
            value={cfopPadrao.cst_cofins}
            onChangeText={(v) => setCfopPadrao((c) => ({ ...c, cst_cofins: v }))}
            placeholder=""
            placeholderTextColor="#666"
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>ICMS %</Text>
          <TextInput
            style={styles.input}
            value={cfopPadrao.icms_aliquota}
            onChangeText={(v) =>
              setCfopPadrao((c) => ({ ...c, icms_aliquota: v }))
            }
            placeholder=""
            placeholderTextColor="#666"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>IBS %</Text>
          <TextInput
            style={styles.input}
            value={cfopPadrao.ibs_aliquota}
            onChangeText={(v) =>
              setCfopPadrao((c) => ({ ...c, ibs_aliquota: v }))
            }
            placeholder=""
            placeholderTextColor="#666"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>CBS %</Text>
          <TextInput
            style={styles.input}
            value={cfopPadrao.cbs_aliquota}
            onChangeText={(v) =>
              setCfopPadrao((c) => ({ ...c, cbs_aliquota: v }))
            }
            placeholder=""
            placeholderTextColor="#666"
            keyboardType="numeric"
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={aplicarCfopPadraoNosItens}>
        <Text style={styles.buttonText}>Aplicar aos Itens</Text>
      </TouchableOpacity>
    </View>
  )
}

