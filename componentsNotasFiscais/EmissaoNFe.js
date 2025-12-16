import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useNavigation } from '@react-navigation/native'
import emissaoNFeService from '../services/emissaoNFeService'
import DadosEmitente from './DadosEmitente'
import DadosDestinatario from './DadosDestinatario'
import DadosNFe from './DadosNFe'
import ItensNFe from './ItensNFe'
import styles from './styles/emissaoNFeStyles'

export default function EmissaoNFe({ navigation }) {
  const [carregando, setCarregando] = useState(false)
  const [statusServico, setStatusServico] = useState(null)
  const [etapaAtual, setEtapaAtual] = useState(0)
  const [proximoNumero, setProximoNumero] = useState(null)
  
  const [dadosEmitente, setDadosEmitente] = useState({})
  const [dadosDestinatario, setDadosDestinatario] = useState({})
  const [dadosNFe, setDadosNFe] = useState({
    serie: '1',
    tipo_operacao: '1',
    natureza_operacao: 'Venda',
    finalidade: '1',
    tipo_emissao: '1',
    modalidade_frete: '9'
  })
  const [itens, setItens] = useState([])

  const etapas = [
    { titulo: 'Emitente', componente: 'emitente' },
    { titulo: 'Destinatário', componente: 'destinatario' },
    { titulo: 'NFe', componente: 'nfe' },
    { titulo: 'Itens', componente: 'itens' }
  ]

  useEffect(() => {
    verificarStatusServico()
    obterProximoNumero()
  }, [])

  const verificarStatusServico = async () => {
    try {
      setCarregando(true)
      const status = await emissaoNFeService.verificarStatusServico()
      setStatusServico(status)
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível verificar o status do serviço da SEFAZ')
    } finally {
      setCarregando(false)
    }
  }

  const obterProximoNumero = async () => {
    try {
      const numero = await emissaoNFeService.obterProximoNumero()
      setProximoNumero(numero)
      setDadosNFe(prev => ({ ...prev, numero: numero.toString() }))
    } catch (error) {
      console.error('Erro ao obter próximo número:', error)
    }
  }

  const validarEtapa = (etapa) => {
    switch (etapa) {
      case 1: // Dados do Emitente
        const camposEmitente = ['razao_social', 'cnpj', 'inscricao_estadual', 'logradouro', 'numero', 'bairro', 'municipio', 'uf', 'cep']
        return camposEmitente.every(campo => dadosEmitente[campo])
      
      case 2: // Dados do Destinatário
        const camposDestinatario = ['razao_social', 'logradouro', 'numero', 'bairro', 'municipio', 'uf', 'cep']
        const temDocumento = dadosDestinatario.cnpj || dadosDestinatario.cpf
        return camposDestinatario.every(campo => dadosDestinatario[campo]) && temDocumento
      
      case 3: // Dados da NFe
        const camposNFe = ['natureza_operacao', 'numero', 'serie']
        return camposNFe.every(campo => dadosNFe[campo])
      
      case 4: // Itens
        return itens.length > 0 && itens.every(item => 
          item.codigo && item.descricao && item.quantidade > 0 && item.valor_unitario > 0
        )
      
      default:
        return false
    }
  }

  const proximaEtapa = () => {
    if (etapaAtual < etapas.length - 1) {
      setEtapaAtual(etapaAtual + 1)
    }
  }

  const etapaAnterior = () => {
    if (etapaAtual > 0) {
      setEtapaAtual(etapaAtual - 1)
    }
  }

  const validarEtapaAtual = () => {
    const erros = []
    
    switch (etapaAtual) {
      case 0: // Emitente
        if (!dadosEmitente.razao_social) erros.push('Razão social é obrigatória')
        if (!dadosEmitente.cnpj) erros.push('CNPJ é obrigatório')
        if (!dadosEmitente.inscricao_estadual) erros.push('Inscrição estadual é obrigatória')
        if (!dadosEmitente.logradouro) erros.push('Logradouro é obrigatório')
        if (!dadosEmitente.numero) erros.push('Número é obrigatório')
        if (!dadosEmitente.bairro) erros.push('Bairro é obrigatório')
        if (!dadosEmitente.municipio) erros.push('Município é obrigatório')
        if (!dadosEmitente.uf) erros.push('UF é obrigatória')
        if (!dadosEmitente.cep) erros.push('CEP é obrigatório')
        break
      
      case 1: // Destinatário
        if (dadosDestinatario.tipo_pessoa === 'juridica') {
          if (!dadosDestinatario.razao_social) erros.push('Razão social é obrigatória')
          if (!dadosDestinatario.cnpj) erros.push('CNPJ é obrigatório')
        } else {
          if (!dadosDestinatario.nome) erros.push('Nome é obrigatório')
          if (!dadosDestinatario.cpf) erros.push('CPF é obrigatório')
        }
        if (!dadosDestinatario.logradouro) erros.push('Logradouro é obrigatório')
        if (!dadosDestinatario.numero) erros.push('Número é obrigatório')
        if (!dadosDestinatario.bairro) erros.push('Bairro é obrigatório')
        if (!dadosDestinatario.municipio) erros.push('Município é obrigatório')
        if (!dadosDestinatario.uf) erros.push('UF é obrigatória')
        if (!dadosDestinatario.cep) erros.push('CEP é obrigatório')
        break
      
      case 2: // NFe
        if (!dadosNFe.numero) erros.push('Número da NFe é obrigatório')
        if (!dadosNFe.serie) erros.push('Série é obrigatória')
        if (!dadosNFe.natureza_operacao) erros.push('Natureza da operação é obrigatória')
        if (!dadosNFe.data_emissao) erros.push('Data de emissão é obrigatória')
        if (!dadosNFe.hora_emissao) erros.push('Hora de emissão é obrigatória')
        break
      
      case 3: // Itens
        if (itens.length === 0) erros.push('Pelo menos um item deve ser adicionado')
        itens.forEach((item, index) => {
          if (!item.codigo) erros.push(`Item ${index + 1}: Código é obrigatório`)
          if (!item.descricao) erros.push(`Item ${index + 1}: Descrição é obrigatória`)
          if (!item.ncm) erros.push(`Item ${index + 1}: NCM é obrigatório`)
          if (!item.cfop) erros.push(`Item ${index + 1}: CFOP é obrigatório`)
          if (!item.quantidade || parseFloat(item.quantidade.replace(',', '.')) <= 0) {
            erros.push(`Item ${index + 1}: Quantidade deve ser maior que zero`)
          }
          if (!item.valor_unitario || parseFloat(item.valor_unitario.replace(',', '.')) <= 0) {
            erros.push(`Item ${index + 1}: Valor unitário deve ser maior que zero`)
          }
        })
        break
    }
    
    return erros
  }

  const emitirNFe = async () => {
    try {
      setCarregando(true)
      
      // Validar todos os dados
      const erros = emissaoNFeService.validarDadosNFe({
        emitente: dadosEmitente,
        destinatario: dadosDestinatario,
        nfe: dadosNFe,
        itens: itens
      })
      
      if (erros.length > 0) {
        Alert.alert('Erro de Validação', erros.join('\n'))
        return
      }
      
      // Formatar dados para API
      const dadosFormatados = emissaoNFeService.formatarDadosParaAPI({
        emitente: dadosEmitente,
        destinatario: dadosDestinatario,
        nfe: dadosNFe,
        itens: itens
      })
      
      // Emitir NFe
      const resultado = await emissaoNFeService.emitirNFe(dadosFormatados)
      
      Alert.alert(
        'Sucesso',
        `NFe emitida com sucesso!\nChave: ${resultado.chave_acesso}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      )
      
    } catch (error) {
      Alert.alert('Erro', error.message || 'Erro ao emitir NFe')
    } finally {
      setCarregando(false)
    }
  }

  const renderizarEtapa = () => {
    switch (etapaAtual) {
      case 0:
        return (
          <DadosEmitente
            dados={dadosEmitente}
            onChange={setDadosEmitente}
          />
        )
      case 1:
        return (
          <DadosDestinatario
            dados={dadosDestinatario}
            onChange={setDadosDestinatario}
          />
        )
      case 2:
        return (
          <DadosNFe
            dados={dadosNFe}
            onChange={setDadosNFe}
            proximoNumero={proximoNumero}
          />
        )
      case 3:
        return (
          <ItensNFe
            itens={itens}
            onChange={setItens}
          />
        )
      default:
        return null
    }
  }

  const renderizarIndicadorEtapas = () => {
    return (
      <View style={styles.indicadorEtapas}>
        <View style={styles.etapasContainer}>
          {etapas.map((etapa, index) => (
            <React.Fragment key={index}>
              <View style={styles.etapa}>
                <View style={[
                  styles.etapaNumero,
                  index === etapaAtual && styles.etapaNumeroAtiva,
                  index < etapaAtual && styles.etapaNumeroCompleta
                ]}>
                  <Text style={[
                    styles.etapaTextoNumero,
                    (index === etapaAtual || index < etapaAtual) && styles.etapaTextoNumeroAtiva
                  ]}>
                    {index + 1}
                  </Text>
                </View>
                <Text style={[
                  styles.etapaTitulo,
                  index === etapaAtual && styles.etapaTituloAtiva,
                  index < etapaAtual && styles.etapaTituloCompleta
                ]}>
                  {etapa.titulo}
                </Text>
              </View>
              {index < etapas.length - 1 && (
                <View style={[
                  styles.linhaConetor,
                  index < etapaAtual && styles.linhaConectorCompleta
                ]} />
              )}
            </React.Fragment>
          ))}
        </View>
      </View>
    )
  }

  const handleProximaEtapa = () => {
    const erros = validarEtapaAtual()
    
    if (erros.length > 0) {
      Alert.alert('Validação', erros.join('\n'))
      return
    }
    
    proximaEtapa()
  }

  if (carregando) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingTexto}>Carregando...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Emissão de NFe</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Status do Serviço */}
      {statusServico && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitulo}>Status da SEFAZ</Text>
          <Text style={[
            styles.statusTexto,
            statusServico.online ? styles.statusOnline : styles.statusOffline
          ]}>
            {statusServico.online ? 'Online' : 'Offline'} - {statusServico.motivo}
          </Text>
        </View>
      )}

      {/* Indicador de Etapas */}
      {renderizarIndicadorEtapas()}

      {/* Conteúdo da Etapa */}
      {renderizarEtapa()}

      {/* Botões de Navegação */}
      <View style={styles.botoesNavegacao}>
        <TouchableOpacity
          style={[
            styles.botaoNavegacao,
            styles.botaoVoltar,
            etapaAtual === 0 && styles.botaoDesabilitado
          ]}
          onPress={etapaAnterior}
          disabled={etapaAtual === 0}
        >
          <Text style={[
            styles.textoBotaoNavegacao,
            etapaAtual === 0 && styles.textoBotaoDesabilitado
          ]}>
            Voltar
          </Text>
        </TouchableOpacity>

        {etapaAtual < etapas.length - 1 ? (
          <TouchableOpacity
            style={[styles.botaoNavegacao, styles.botaoProximo]}
            onPress={handleProximaEtapa}
          >
            <Text style={styles.textoBotaoNavegacao}>Próximo</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.botaoNavegacao, styles.botaoEmitir]}
            onPress={emitirNFe}
            disabled={carregando}
          >
            <Text style={styles.textoBotaoNavegacao}>
              {carregando ? 'Emitindo...' : 'Emitir NFe'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}