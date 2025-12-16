import React from 'react'
import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import styles from './styles/emissaoNFeStyles'

export default function DadosNFe({ dados, onChange, proximoNumero }) {
  
  const atualizarCampo = (campo, valor) => {
    onChange({
      ...dados,
      [campo]: valor
    })
  }

  const formatarData = (data) => {
    const apenasNumeros = data.replace(/\D/g, '')
    return apenasNumeros
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .substring(0, 10)
  }

  const formatarHora = (hora) => {
    const apenasNumeros = hora.replace(/\D/g, '')
    return apenasNumeros
      .replace(/(\d{2})(\d)/, '$1:$2')
      .replace(/(\d{2})(\d)/, '$1:$2')
      .substring(0, 8)
  }

  const obterDataAtual = () => {
    const hoje = new Date()
    const dia = String(hoje.getDate()).padStart(2, '0')
    const mes = String(hoje.getMonth() + 1).padStart(2, '0')
    const ano = hoje.getFullYear()
    return `${dia}/${mes}/${ano}`
  }

  const obterHoraAtual = () => {
    const agora = new Date()
    const horas = String(agora.getHours()).padStart(2, '0')
    const minutos = String(agora.getMinutes()).padStart(2, '0')
    const segundos = String(agora.getSeconds()).padStart(2, '0')
    return `${horas}:${minutos}:${segundos}`
  }

  const preencherDataHoraAtual = () => {
    atualizarCampo('data_emissao', obterDataAtual())
    atualizarCampo('hora_emissao', obterHoraAtual())
  }

  return (
    <ScrollView style={styles.formulario}>
      <Text style={styles.secaoTitulo}>Dados da NFe</Text>
      
      <View style={styles.linhaHorizontal}>
        <View style={[styles.campo, { flex: 2 }]}>
          <Text style={styles.label}>Número da NFe *</Text>
          <TextInput
            style={styles.input}
            value={dados.numero || proximoNumero?.toString() || ''}
            onChangeText={(valor) => atualizarCampo('numero', valor)}
            placeholder="Número sequencial"
            keyboardType="numeric"
            maxLength={9}
          />
        </View>

        <View style={[styles.campo, { flex: 2, marginLeft: 10 }]}>
          <Text style={styles.label}>Série *</Text>
          <TextInput
            style={styles.input}
            value={dados.serie || '1'}
            onChangeText={(valor) => atualizarCampo('serie', valor)}
            placeholder="Série"
            keyboardType="numeric"
            maxLength={3}
          />
        </View>
      </View>

      <View style={styles.campo}>
        <Text style={styles.label}>Tipo de Operação *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={dados.tipo_operacao || '1'}
            style={styles.picker}
            onValueChange={(valor) => atualizarCampo('tipo_operacao', valor)}
          >
            <Picker.Item label="1 - Saída" value="1" />
            <Picker.Item label="0 - Entrada" value="0" />
          </Picker>
        </View>
      </View>

      <View style={styles.campo}>
        <Text style={styles.label}>Natureza da Operação *</Text>
        <TextInput
          style={styles.input}
          value={dados.natureza_operacao || 'Venda'}
          onChangeText={(valor) => atualizarCampo('natureza_operacao', valor)}
          placeholder="Ex: Venda, Prestação de Serviço"
          maxLength={60}
        />
      </View>

      <View style={styles.campo}>
        <Text style={styles.label}>Finalidade da NFe *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={dados.finalidade || '1'}
            style={styles.picker}
            onValueChange={(valor) => atualizarCampo('finalidade', valor)}
          >
            <Picker.Item label="1 - Normal" value="1" />
            <Picker.Item label="2 - Complementar" value="2" />
            <Picker.Item label="3 - Ajuste" value="3" />
            <Picker.Item label="4 - Devolução" value="4" />
          </Picker>
        </View>
      </View>

      <View style={styles.campo}>
        <Text style={styles.label}>Tipo de Emissão *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={dados.tipo_emissao || '1'}
            style={styles.picker}
            onValueChange={(valor) => atualizarCampo('tipo_emissao', valor)}
          >
            <Picker.Item label="1 - Normal" value="1" />
            <Picker.Item label="2 - Contingência FS" value="2" />
            <Picker.Item label="3 - Contingência SCAN" value="3" />
            <Picker.Item label="4 - Contingência DPEC" value="4" />
            <Picker.Item label="5 - Contingência FS-DA" value="5" />
            <Picker.Item label="6 - Contingência SVC-AN" value="6" />
            <Picker.Item label="7 - Contingência SVC-RS" value="7" />
            <Picker.Item label="9 - Contingência Off-line" value="9" />
          </Picker>
        </View>
      </View>

      <Text style={styles.secaoTitulo}>Data e Hora</Text>

      <View style={styles.linhaHorizontal}>
        <TouchableOpacity
          style={styles.botaoPreencherData}
          onPress={preencherDataHoraAtual}
        >
          <Text style={styles.textoBotaoPreencherData}>
            Preencher Data/Hora Atual
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.linhaHorizontal}>
        <View style={[styles.campo, { flex: 1 }]}>
          <Text style={styles.label}>Data de Emissão *</Text>
          <TextInput
            style={styles.input}
            value={formatarData(dados.data_emissao || '')}
            onChangeText={(valor) => atualizarCampo('data_emissao', valor)}
            placeholder="DD/MM/AAAA"
            keyboardType="numeric"
            maxLength={10}
          />
        </View>

        <View style={[styles.campo, { flex: 1, marginLeft: 10 }]}>
          <Text style={styles.label}>Hora de Emissão *</Text>
          <TextInput
            style={styles.input}
            value={formatarHora(dados.hora_emissao || '')}
            onChangeText={(valor) => atualizarCampo('hora_emissao', valor)}
            placeholder="HH:MM:SS"
            keyboardType="numeric"
            maxLength={8}
          />
        </View>
      </View>

      <View style={styles.campo}>
        <Text style={styles.label}>Data de Saída/Entrada</Text>
        <TextInput
          style={styles.input}
          value={formatarData(dados.data_saida || '')}
          onChangeText={(valor) => atualizarCampo('data_saida', valor)}
          placeholder="DD/MM/AAAA (opcional)"
          keyboardType="numeric"
          maxLength={10}
        />
      </View>

      <View style={styles.campo}>
        <Text style={styles.label}>Hora de Saída/Entrada</Text>
        <TextInput
          style={styles.input}
          value={formatarHora(dados.hora_saida || '')}
          onChangeText={(valor) => atualizarCampo('hora_saida', valor)}
          placeholder="HH:MM:SS (opcional)"
          keyboardType="numeric"
          maxLength={8}
        />
      </View>

      <Text style={styles.secaoTitulo}>Informações Adicionais</Text>

      <View style={styles.campo}>
        <Text style={styles.label}>Informações Complementares</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={dados.informacoes_complementares || ''}
          onChangeText={(valor) => atualizarCampo('informacoes_complementares', valor)}
          placeholder="Informações adicionais da NFe (opcional)"
          multiline
          numberOfLines={4}
          maxLength={2000}
        />
      </View>

      <View style={styles.campo}>
        <Text style={styles.label}>Informações do Fisco</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={dados.informacoes_fisco || ''}
          onChangeText={(valor) => atualizarCampo('informacoes_fisco', valor)}
          placeholder="Informações de interesse do fisco (opcional)"
          multiline
          numberOfLines={3}
          maxLength={2000}
        />
      </View>

      <View style={styles.campo}>
        <Text style={styles.label}>Modalidade do Frete *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={dados.modalidade_frete || '9'}
            style={styles.picker}
            onValueChange={(valor) => atualizarCampo('modalidade_frete', valor)}
          >
            <Picker.Item label="0 - Emitente" value="0" />
            <Picker.Item label="1 - Destinatário" value="1" />
            <Picker.Item label="2 - Terceiros" value="2" />
            <Picker.Item label="3 - Próprio Remetente" value="3" />
            <Picker.Item label="4 - Próprio Destinatário" value="4" />
            <Picker.Item label="9 - Sem Frete" value="9" />
          </Picker>
        </View>
      </View>
    </ScrollView>
  )
}