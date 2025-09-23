import React from 'react'
import { View, Text, TextInput, ScrollView } from 'react-native'
import styles from './styles/emissaoNFeStyles'

export default function DadosEmitente({ dados, onChange }) {
  
  const atualizarCampo = (campo, valor) => {
    onChange({
      ...dados,
      [campo]: valor
    })
  }

  const formatarCNPJ = (cnpj) => {
    const apenasNumeros = cnpj.replace(/\D/g, '')
    return apenasNumeros
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 18)
  }

  const formatarCEP = (cep) => {
    const apenasNumeros = cep.replace(/\D/g, '')
    return apenasNumeros
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substring(0, 9)
  }

  const formatarTelefone = (telefone) => {
    const apenasNumeros = telefone.replace(/\D/g, '')
    if (apenasNumeros.length <= 10) {
      return apenasNumeros
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
    } else {
      return apenasNumeros
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .substring(0, 15)
    }
  }

  return (
    <ScrollView style={styles.formulario}>
      <Text style={styles.secaoTitulo}>Dados do Emitente</Text>
      
      <View style={styles.campo}>
        <Text style={styles.label}>Razão Social *</Text>
        <TextInput
          style={styles.input}
          value={dados.razao_social || ''}
          onChangeText={(valor) => atualizarCampo('razao_social', valor)}
          placeholder="Razão social da empresa"
          maxLength={60}
        />
      </View>

      <View style={styles.campo}>
        <Text style={styles.label}>Nome Fantasia</Text>
        <TextInput
          style={styles.input}
          value={dados.nome_fantasia || ''}
          onChangeText={(valor) => atualizarCampo('nome_fantasia', valor)}
          placeholder="Nome fantasia (opcional)"
          maxLength={60}
        />
      </View>

      <View style={styles.campo}>
        <Text style={styles.label}>CNPJ *</Text>
        <TextInput
          style={styles.input}
          value={formatarCNPJ(dados.cnpj || '')}
          onChangeText={(valor) => atualizarCampo('cnpj', valor.replace(/\D/g, ''))}
          placeholder="00.000.000/0000-00"
          keyboardType="numeric"
          maxLength={18}
        />
      </View>

      <View style={styles.campo}>
        <Text style={styles.label}>Inscrição Estadual *</Text>
        <TextInput
          style={styles.input}
          value={dados.inscricao_estadual || ''}
          onChangeText={(valor) => atualizarCampo('inscricao_estadual', valor)}
          placeholder="Inscrição estadual"
          maxLength={14}
        />
      </View>

      <View style={styles.campo}>
        <Text style={styles.label}>Inscrição Municipal</Text>
        <TextInput
          style={styles.input}
          value={dados.inscricao_municipal || ''}
          onChangeText={(valor) => atualizarCampo('inscricao_municipal', valor)}
          placeholder="Inscrição municipal (opcional)"
          maxLength={15}
        />
      </View>

      <View style={styles.campo}>
        <Text style={styles.label}>CNAE Fiscal</Text>
        <TextInput
          style={styles.input}
          value={dados.cnae_fiscal || ''}
          onChangeText={(valor) => atualizarCampo('cnae_fiscal', valor)}
          placeholder="Código CNAE (opcional)"
          keyboardType="numeric"
          maxLength={7}
        />
      </View>

      <Text style={styles.secaoTitulo}>Endereço</Text>

      <View style={styles.campo}>
        <Text style={styles.label}>Logradouro *</Text>
        <TextInput
          style={styles.input}
          value={dados.logradouro || ''}
          onChangeText={(valor) => atualizarCampo('logradouro', valor)}
          placeholder="Rua, avenida, etc."
          maxLength={60}
        />
      </View>

      <View style={styles.linhaHorizontal}>
        <View style={[styles.campo, { flex: 2 }]}>
          <Text style={styles.label}>Número *</Text>
          <TextInput
            style={styles.input}
            value={dados.numero || ''}
            onChangeText={(valor) => atualizarCampo('numero', valor)}
            placeholder="Número"
            maxLength={60}
          />
        </View>

        <View style={[styles.campo, { flex: 3, marginLeft: 10 }]}>
          <Text style={styles.label}>Complemento</Text>
          <TextInput
            style={styles.input}
            value={dados.complemento || ''}
            onChangeText={(valor) => atualizarCampo('complemento', valor)}
            placeholder="Complemento (opcional)"
            maxLength={60}
          />
        </View>
      </View>

      <View style={styles.campo}>
        <Text style={styles.label}>Bairro *</Text>
        <TextInput
          style={styles.input}
          value={dados.bairro || ''}
          onChangeText={(valor) => atualizarCampo('bairro', valor)}
          placeholder="Bairro"
          maxLength={60}
        />
      </View>

      <View style={styles.linhaHorizontal}>
        <View style={[styles.campo, { flex: 3 }]}>
          <Text style={styles.label}>Município *</Text>
          <TextInput
            style={styles.input}
            value={dados.municipio || ''}
            onChangeText={(valor) => atualizarCampo('municipio', valor)}
            placeholder="Município"
            maxLength={60}
          />
        </View>

        <View style={[styles.campo, { flex: 1, marginLeft: 10 }]}>
          <Text style={styles.label}>UF *</Text>
          <TextInput
            style={styles.input}
            value={dados.uf || ''}
            onChangeText={(valor) => atualizarCampo('uf', valor.toUpperCase())}
            placeholder="UF"
            maxLength={2}
          />
        </View>
      </View>

      <View style={styles.campo}>
        <Text style={styles.label}>CEP *</Text>
        <TextInput
          style={styles.input}
          value={formatarCEP(dados.cep || '')}
          onChangeText={(valor) => atualizarCampo('cep', valor.replace(/\D/g, ''))}
          placeholder="00000-000"
          keyboardType="numeric"
          maxLength={9}
        />
      </View>

      <Text style={styles.secaoTitulo}>Contato</Text>

      <View style={styles.campo}>
        <Text style={styles.label}>Telefone</Text>
        <TextInput
          style={styles.input}
          value={formatarTelefone(dados.telefone || '')}
          onChangeText={(valor) => atualizarCampo('telefone', valor.replace(/\D/g, ''))}
          placeholder="(00) 0000-0000"
          keyboardType="phone-pad"
          maxLength={15}
        />
      </View>

      <View style={styles.campo}>
        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          value={dados.email || ''}
          onChangeText={(valor) => atualizarCampo('email', valor)}
          placeholder="email@empresa.com"
          keyboardType="email-address"
          autoCapitalize="none"
          maxLength={60}
        />
      </View>

      <View style={styles.campo}>
        <Text style={styles.label}>Regime Tributário</Text>
        <TextInput
          style={styles.input}
          value={dados.regime_tributario || '1'}
          onChangeText={(valor) => atualizarCampo('regime_tributario', valor)}
          placeholder="1 - Simples Nacional"
          keyboardType="numeric"
          maxLength={1}
        />
        <Text style={styles.ajuda}>
          1-Simples Nacional, 2-Simples Nacional - excesso, 3-Regime Normal
        </Text>
      </View>
    </ScrollView>
  )
}