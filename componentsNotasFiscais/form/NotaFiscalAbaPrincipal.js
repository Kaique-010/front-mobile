import React, { useMemo, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native'

export default function NotaFiscalAbaPrincipal({
  styles,
  principal,
  setPrincipal,
}) {
  const TIPO_OPERACAO_OPCOES = useMemo(
    () => [
      { value: '0', label: 'Entrada' },
      { value: '1', label: 'Saída' },
    ],
    [],
  )
  const FINALIDADE_OPCOES = useMemo(
    () => [
      { value: '1', label: 'Normal' },
      { value: '2', label: 'Complementar' },
      { value: '3', label: 'Ajuste' },
      { value: '4', label: 'Devolução' },
    ],
    [],
  )
  const AMBIENTE_OPCOES = useMemo(
    () => [
      { value: '1', label: 'Produção' },
      { value: '2', label: 'Homologação' },
    ],
    [],
  )

  const labelFrom = (opts, v) => {
    const s = v == null ? '' : String(v)
    const found = (opts || []).find((o) => String(o.value) === s)
    return found ? found.label : ''
  }

  const SelectField = ({ label, value, onChange, options, placeholder }) => {
    const [open, setOpen] = useState(false)
    const display = labelFrom(options, value)
    return (
      <View>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          style={[styles.input, styles.selectInput]}
          onPress={() => setOpen(true)}
          activeOpacity={0.8}>
          <Text
            style={[
              styles.selectText,
              display ? styles.selectValue : styles.selectPlaceholder,
            ]}>
            {display || placeholder || 'Selecione...'}
          </Text>
          <Text style={styles.selectChevron}>▼</Text>
        </TouchableOpacity>

        <Modal
          visible={open}
          transparent
          animationType="fade"
          onRequestClose={() => setOpen(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{label}</Text>
              <FlatList
                data={options}
                keyExtractor={(item) => String(item.value)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalOption}
                    onPress={() => {
                      onChange(String(item.value))
                      setOpen(false)
                    }}>
                    <Text style={styles.modalOptionText}>
                      {item.value} - {item.label}
                    </Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setOpen(false)}>
                <Text style={styles.modalCloseText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    )
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Informações Principais</Text>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Modelo</Text>
          <TextInput
            style={styles.input}
            value={principal.modelo}
            onChangeText={(v) => setPrincipal((p) => ({ ...p, modelo: v }))}
            placeholder="55"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.col}>
          <Text style={styles.label}>Série</Text>
          <TextInput
            style={styles.input}
            value={principal.serie}
            onChangeText={(v) => setPrincipal((p) => ({ ...p, serie: v }))}
            placeholder="1"
            placeholderTextColor="#666"
            keyboardType="numeric"
          />
        </View>
      </View>

      <Text style={styles.label}>Número</Text>
      <TextInput
        style={styles.input}
        value={principal.numero}
        onChangeText={(v) => setPrincipal((p) => ({ ...p, numero: v }))}
        placeholder="0"
        placeholderTextColor="#666"
        keyboardType="numeric"
      />

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Data Emissão</Text>
          <TextInput
            style={styles.input}
            value={principal.data_emissao}
            onChangeText={(v) =>
              setPrincipal((p) => ({ ...p, data_emissao: v }))
            }
            placeholder="AAAA-MM-DD"
            placeholderTextColor="#666"
          />
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Data Saída</Text>
          <TextInput
            style={styles.input}
            value={principal.data_saida}
            onChangeText={(v) => setPrincipal((p) => ({ ...p, data_saida: v }))}
            placeholder="AAAA-MM-DD"
            placeholderTextColor="#666"
          />
        </View>
      </View>

      <Text style={styles.label}>Tipo Operação</Text>
      <SelectField
        label="Tipo Operação"
        value={principal.tipo_operacao}
        onChange={(v) => setPrincipal((p) => ({ ...p, tipo_operacao: v }))}
        options={TIPO_OPERACAO_OPCOES}
        placeholder="Selecione..."
      />

      <View style={styles.row}>
        <View style={styles.col}>
          <SelectField
            label="Finalidade"
            value={principal.finalidade}
            onChange={(v) => setPrincipal((p) => ({ ...p, finalidade: v }))}
            options={FINALIDADE_OPCOES}
            placeholder="Selecione..."
          />
        </View>
        <View style={styles.col}>
          <SelectField
            label="Ambiente"
            value={principal.ambiente}
            onChange={(v) => setPrincipal((p) => ({ ...p, ambiente: v }))}
            options={AMBIENTE_OPCOES}
            placeholder="Selecione..."
          />
        </View>
      </View>
    </View>
  )
}
