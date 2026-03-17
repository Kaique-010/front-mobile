import React, { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { notasFiscaisService } from '../componentsNotasFiscais/notasFiscaisService'
import NotaFiscalAbaPrincipal from '../componentsNotasFiscais/form/NotaFiscalAbaPrincipal'
import NotaFiscalAbaCliente from '../componentsNotasFiscais/form/NotaFiscalAbaCliente'
import NotaFiscalAbaItens from '../componentsNotasFiscais/form/NotaFiscalAbaItens'
import NotaFiscalAbaCfop from '../componentsNotasFiscais/form/NotaFiscalAbaCfop'
import NotaFiscalAbaTransporte from '../componentsNotasFiscais/form/NotaFiscalAbaTransporte'
import NotaFiscalAbaTotais from '../componentsNotasFiscais/form/NotaFiscalAbaTotais'

const ABAS = {
  PRINCIPAL: 'principal',
  CLIENTE: 'cliente',
  ITENS: 'itens',
  CFOP: 'cfop',
  TRANSPORTE: 'transporte',
  TOTAIS: 'totais',
}

const hojeISO = () => new Date().toISOString().split('T')[0]

const normalizarNumero = (v) => {
  if (v == null) return ''
  const s = String(v).trim()
  if (!s) return ''
  const n = Number(s.replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

const normalizarInt = (v) => {
  if (v == null) return null
  const s = String(v).trim()
  if (!s) return null
  const n = parseInt(s, 10)
  return Number.isFinite(n) ? n : null
}

const temValor = (v) => {
  if (v == null) return false
  if (typeof v === 'number') return Number.isFinite(v) && v !== 0
  return String(v).trim().length > 0
}

const impostoVazio = () => ({
  icms_base: '',
  icms_aliquota: '',
  icms_valor: '',
  ipi_valor: '',
  pis_valor: '',
  cofins_valor: '',
  fcp_valor: '',
  ibs_base: '',
  ibs_aliquota: '',
  ibs_valor: '',
  cbs_base: '',
  cbs_aliquota: '',
  cbs_valor: '',
})

const itemVazio = (cfopPadrao) => ({
  produto: '',
  produto_nome: '',
  quantidade: '1',
  unitario: '0',
  desconto: '0',
  cfop: cfopPadrao?.cfop ?? '',
  ncm: cfopPadrao?.ncm ?? '',
  cest: cfopPadrao?.cest ?? '',
  cst_icms: cfopPadrao?.cst_icms ?? '',
  cst_pis: cfopPadrao?.cst_pis ?? '',
  cst_cofins: cfopPadrao?.cst_cofins ?? '',
  impostos: {
    ...impostoVazio(),
    icms_aliquota: cfopPadrao?.icms_aliquota ?? '',
    ibs_aliquota: cfopPadrao?.ibs_aliquota ?? '',
    cbs_aliquota: cfopPadrao?.cbs_aliquota ?? '',
  },
})

export default function NotaFiscalForm({ route, navigation }) {
  const { notaFiscal: notaFiscalParam } = route.params || {}
  const [abaAtiva, setAbaAtiva] = useState(ABAS.PRINCIPAL)

  const [carregando, setCarregando] = useState(!!notaFiscalParam?.id)
  const [salvando, setSalvando] = useState(false)

  const [principal, setPrincipal] = useState({
    modelo: '55',
    serie: '',
    numero: '',
    data_emissao: hojeISO(),
    data_saida: hojeISO(),
    tipo_operacao: '1',
    finalidade: '1',
    ambiente: '2',
  })
  const [cliente, setCliente] = useState({
    destinatario: '',
  })
  const [clienteSelecionado, setClienteSelecionado] = useState(null)
  const [cfopPadrao, setCfopPadrao] = useState({
    cfop: '',
    ncm: '',
    cest: '',
    cst_icms: '',
    cst_pis: '',
    cst_cofins: '',
    icms_aliquota: '',
    ibs_aliquota: '',
    cbs_aliquota: '',
  })
  const [transporte, setTransporte] = useState({
    modalidade_frete: '',
    transportadora: '',
    placa_veiculo: '',
    uf_veiculo: '',
  })
  const [itens, setItens] = useState([itemVazio(cfopPadrao)])
  const [itemEditandoIndex, setItemEditandoIndex] = useState(null)
  const [itemEditando, setItemEditando] = useState(itemVazio(cfopPadrao))

  const getAbaIcon = (aba) => {
    switch (aba) {
      case ABAS.PRINCIPAL:
        return 'info'
      case ABAS.CLIENTE:
        return 'person'
      case ABAS.ITENS:
        return 'inventory'
      case ABAS.CFOP:
        return 'tune'
      case ABAS.TRANSPORTE:
        return 'local-shipping'
      case ABAS.TOTAIS:
        return 'receipt'
      default:
        return 'info'
    }
  }

  const getAbaLabel = (aba) => {
    switch (aba) {
      case ABAS.PRINCIPAL:
        return 'Principal'
      case ABAS.CLIENTE:
        return 'Cliente'
      case ABAS.ITENS:
        return 'Itens'
      case ABAS.CFOP:
        return 'CFOP'
      case ABAS.TRANSPORTE:
        return 'Transporte'
      case ABAS.TOTAIS:
        return 'Totais'
      default:
        return 'Principal'
    }
  }

  const totais = useMemo(() => {
    const linhas = itens || []

    const sum = (arr) => arr.reduce((acc, v) => acc + v, 0)
    const produtos = sum(
      linhas.map((it) => {
        const qtd = normalizarNumero(it.quantidade)
        const unit = normalizarNumero(it.unitario)
        return qtd * unit
      }),
    )
    const desconto = sum(linhas.map((it) => normalizarNumero(it.desconto)))

    const impostos = {
      icms: sum(linhas.map((it) => normalizarNumero(it.impostos?.icms_valor))),
      ipi: sum(linhas.map((it) => normalizarNumero(it.impostos?.ipi_valor))),
      pis: sum(linhas.map((it) => normalizarNumero(it.impostos?.pis_valor))),
      cofins: sum(
        linhas.map((it) => normalizarNumero(it.impostos?.cofins_valor)),
      ),
      fcp: sum(linhas.map((it) => normalizarNumero(it.impostos?.fcp_valor))),
      ibs: sum(linhas.map((it) => normalizarNumero(it.impostos?.ibs_valor))),
      cbs: sum(linhas.map((it) => normalizarNumero(it.impostos?.cbs_valor))),
    }

    const tributos =
      impostos.icms +
      impostos.ipi +
      impostos.pis +
      impostos.cofins +
      impostos.fcp +
      impostos.ibs +
      impostos.cbs

    const total = produtos - desconto + tributos

    return {
      produtos,
      desconto,
      tributos,
      total,
      impostos,
    }
  }, [itens])

  const carregarDetalheEdicao = async (id) => {
    setCarregando(true)
    try {
      const data = await notasFiscaisService.buscarNotaFiscalPorPk(id)

      setPrincipal({
        modelo: String(data?.modelo ?? '55'),
        serie: data?.serie != null ? String(data.serie) : '',
        numero: data?.numero != null ? String(data.numero) : '',
        data_emissao: data?.data_emissao
          ? String(data.data_emissao)
          : hojeISO(),
        data_saida: data?.data_saida ? String(data.data_saida) : '',
        tipo_operacao:
          data?.tipo_operacao != null ? String(data.tipo_operacao) : '',
        finalidade: data?.finalidade != null ? String(data.finalidade) : '',
        ambiente: data?.ambiente != null ? String(data.ambiente) : '',
      })

      setCliente({
        destinatario:
          data?.destinatario_id != null
            ? String(data.destinatario_id)
            : data?.destinatario?.enti_clie != null
              ? String(data.destinatario.enti_clie)
              : '',
      })
      setClienteSelecionado(data?.destinatario ?? null)

      const itensApi = Array.isArray(data?.itens) ? data.itens : []
      const itensMapeados = itensApi.map((it) => ({
        produto: it?.produto != null ? String(it.produto) : '',
        quantidade: it?.quantidade != null ? String(it.quantidade) : '1',
        unitario: it?.unitario != null ? String(it.unitario) : '0',
        desconto: it?.desconto != null ? String(it.desconto) : '0',
        cfop: it?.cfop != null ? String(it.cfop) : '',
        ncm: it?.ncm != null ? String(it.ncm) : '',
        cest: it?.cest != null ? String(it.cest) : '',
        cst_icms: it?.cst_icms != null ? String(it.cst_icms) : '',
        cst_pis: it?.cst_pis != null ? String(it.cst_pis) : '',
        cst_cofins: it?.cst_cofins != null ? String(it.cst_cofins) : '',
        produto_nome: it?.produto_nome != null ? String(it.produto_nome) : '',
        impostos: {
          ...impostoVazio(),
          ...(it?.impostos || {}),
        },
      }))

      setItens(itensMapeados.length ? itensMapeados : [itemVazio(cfopPadrao)])
      setItemEditando(itemVazio(cfopPadrao))
      setItemEditandoIndex(null)

      setTransporte({
        modalidade_frete:
          data?.transporte?.modalidade_frete != null
            ? String(data.transporte.modalidade_frete)
            : '',
        transportadora:
          data?.transporte?.transportadora != null
            ? String(data.transporte.transportadora)
            : '',
        placa_veiculo:
          data?.transporte?.placa_veiculo != null
            ? String(data.transporte.placa_veiculo)
            : '',
        uf_veiculo:
          data?.transporte?.uf_veiculo != null
            ? String(data.transporte.uf_veiculo)
            : '',
      })

      const primeiroItem = itensMapeados[0]
      if (primeiroItem) {
        setCfopPadrao({
          cfop: primeiroItem.cfop || '',
          ncm: primeiroItem.ncm || '',
          cest: primeiroItem.cest || '',
          cst_icms: primeiroItem.cst_icms || '',
          cst_pis: primeiroItem.cst_pis || '',
          cst_cofins: primeiroItem.cst_cofins || '',
          icms_aliquota: primeiroItem.impostos?.icms_aliquota ?? '',
          ibs_aliquota: primeiroItem.impostos?.ibs_aliquota ?? '',
          cbs_aliquota: primeiroItem.impostos?.cbs_aliquota ?? '',
        })
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar dados da nota fiscal')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    if (notaFiscalParam?.id) {
      carregarDetalheEdicao(notaFiscalParam.id)
    }
    if (!notaFiscalParam?.id) {
      setItens([itemVazio(cfopPadrao)])
      setItemEditando(itemVazio(cfopPadrao))
      setClienteSelecionado(null)
    }
  }, [notaFiscalParam?.id])

  useEffect(() => {
    if (itemEditandoIndex == null) {
      setItemEditando((prev) => ({
        ...prev,
        cfop: prev.cfop || cfopPadrao.cfop,
        ncm: prev.ncm || cfopPadrao.ncm,
        cest: prev.cest || cfopPadrao.cest,
        cst_icms: prev.cst_icms || cfopPadrao.cst_icms,
        cst_pis: prev.cst_pis || cfopPadrao.cst_pis,
        cst_cofins: prev.cst_cofins || cfopPadrao.cst_cofins,
        impostos: {
          ...prev.impostos,
          icms_aliquota:
            prev.impostos?.icms_aliquota || cfopPadrao.icms_aliquota,
          ibs_aliquota: prev.impostos?.ibs_aliquota || cfopPadrao.ibs_aliquota,
          cbs_aliquota: prev.impostos?.cbs_aliquota || cfopPadrao.cbs_aliquota,
        },
      }))
    }
  }, [cfopPadrao, itemEditandoIndex])

  const aplicarCfopPadraoNosItens = () => {
    setItens((prev) =>
      prev.map((it) => ({
        ...it,
        cfop: cfopPadrao.cfop,
        ncm: cfopPadrao.ncm,
        cest: cfopPadrao.cest,
        cst_icms: cfopPadrao.cst_icms,
        cst_pis: cfopPadrao.cst_pis,
        cst_cofins: cfopPadrao.cst_cofins,
        impostos: {
          ...it.impostos,
          icms_aliquota: cfopPadrao.icms_aliquota,
          ibs_aliquota: cfopPadrao.ibs_aliquota,
          cbs_aliquota: cfopPadrao.cbs_aliquota,
        },
      })),
    )
    Alert.alert('Ok', 'CFOP/CST aplicados aos itens')
  }

  const selecionarItem = (index) => {
    const it = itens[index]
    if (!it) return
    setItemEditandoIndex(index)
    setItemEditando({
      ...it,
      impostos: {
        ...impostoVazio(),
        ...(it.impostos || {}),
      },
    })
    setAbaAtiva(ABAS.ITENS)
  }

  const removerItem = (index) => {
    setItens((prev) => {
      const novos = prev.filter((_, i) => i !== index)
      return novos.length ? novos : [itemVazio(cfopPadrao)]
    })
    if (itemEditandoIndex === index) {
      setItemEditandoIndex(null)
      setItemEditando(itemVazio(cfopPadrao))
    }
  }

  const cancelarEdicao = () => {
    setItemEditandoIndex(null)
    setItemEditando(itemVazio(cfopPadrao))
  }

  const salvarItemEditando = () => {
    const produtoId = normalizarInt(itemEditando.produto)
    if (!produtoId) {
      Alert.alert('Atenção', 'Informe o produto (ID)')
      return
    }
    const qtd = normalizarNumero(itemEditando.quantidade)
    if (qtd <= 0) {
      Alert.alert('Atenção', 'Quantidade deve ser maior que zero')
      return
    }

    const unit = normalizarNumero(itemEditando.unitario)
    const desc = normalizarNumero(itemEditando.desconto)
    const base = Math.max(0, qtd * unit - desc)

    const itemParaSalvar = {
      ...itemEditando,
      produto: String(produtoId),
      quantidade: String(itemEditando.quantidade ?? '1'),
      unitario: String(itemEditando.unitario ?? '0'),
      desconto: String(itemEditando.desconto ?? '0'),
      impostos: {
        ...impostoVazio(),
        ...(itemEditando.impostos || {}),
        icms_base:
          temValor(itemEditando.impostos?.icms_base) ||
          !temValor(cfopPadrao.icms_aliquota)
            ? (itemEditando.impostos?.icms_base ?? '')
            : String(base.toFixed(2)),
        ibs_base:
          temValor(itemEditando.impostos?.ibs_base) ||
          !temValor(cfopPadrao.ibs_aliquota)
            ? (itemEditando.impostos?.ibs_base ?? '')
            : String(base.toFixed(2)),
        cbs_base:
          temValor(itemEditando.impostos?.cbs_base) ||
          !temValor(cfopPadrao.cbs_aliquota)
            ? (itemEditando.impostos?.cbs_base ?? '')
            : String(base.toFixed(2)),
      },
    }

    setItens((prev) => {
      const novos = [...prev]
      if (itemEditandoIndex != null && novos[itemEditandoIndex]) {
        novos[itemEditandoIndex] = itemParaSalvar
        return novos
      }
      return [...novos, itemParaSalvar]
    })

    setItemEditandoIndex(null)
    setItemEditando(itemVazio(cfopPadrao))
    Alert.alert('Ok', 'Item salvo')
  }

  const montarPayload = () => {
    const numero = normalizarInt(principal.numero)
    const tipoOperacao = normalizarInt(principal.tipo_operacao)
    const finalidade = normalizarInt(principal.finalidade)
    const ambiente = normalizarInt(principal.ambiente)
    const destinatario = normalizarInt(cliente.destinatario)

    const serie =
      principal.serie != null && String(principal.serie).trim().length > 0
        ? String(principal.serie)
        : null

    if (!principal.modelo) {
      throw new Error('Informe o modelo')
    }
    if (!principal.data_emissao) {
      throw new Error('Informe a data de emissão')
    }
    if (tipoOperacao == null) {
      throw new Error('Informe o tipo de operação')
    }
    if (!destinatario) {
      throw new Error('Informe o destinatário (ID)')
    }

    const itensValidos = (itens || [])
      .map((it) => ({
        ...it,
        produto: normalizarInt(it.produto),
      }))
      .filter((it) => it.produto)

    if (!itensValidos.length) {
      throw new Error('Adicione ao menos um item')
    }

    const itensPayload = itensValidos.map((it) => ({
      produto: it.produto,
      quantidade: String(it.quantidade ?? '1'),
      unitario: String(it.unitario ?? '0'),
      desconto: String(it.desconto ?? '0'),
      cfop: String(it.cfop ?? ''),
      ncm: String(it.ncm ?? ''),
      cest: it.cest != null ? String(it.cest) : null,
      cst_icms: String(it.cst_icms ?? ''),
      cst_pis: String(it.cst_pis ?? ''),
      cst_cofins: String(it.cst_cofins ?? ''),
    }))

    const impostosPayload = itensValidos.map((it) => ({
      icms_base: it.impostos?.icms_base ?? null,
      icms_aliquota: it.impostos?.icms_aliquota ?? null,
      icms_valor: it.impostos?.icms_valor ?? null,
      ipi_valor: it.impostos?.ipi_valor ?? null,
      pis_valor: it.impostos?.pis_valor ?? null,
      cofins_valor: it.impostos?.cofins_valor ?? null,
      fcp_valor: it.impostos?.fcp_valor ?? null,
      ibs_base: it.impostos?.ibs_base ?? null,
      ibs_aliquota: it.impostos?.ibs_aliquota ?? null,
      ibs_valor: it.impostos?.ibs_valor ?? null,
      cbs_base: it.impostos?.cbs_base ?? null,
      cbs_aliquota: it.impostos?.cbs_aliquota ?? null,
      cbs_valor: it.impostos?.cbs_valor ?? null,
    }))

    const temAlgumImposto = impostosPayload.some((imp) =>
      Object.values(imp).some((v) => temValor(v)),
    )

    const temTransporte = Object.values(transporte || {}).some((v) =>
      temValor(v),
    )

    const payload = {
      modelo: String(principal.modelo),
      ...(serie != null ? { serie } : {}),
      ...(numero != null ? { numero } : {}),
      data_emissao: String(principal.data_emissao),
      data_saida: principal.data_saida ? String(principal.data_saida) : null,
      tipo_operacao: tipoOperacao,
      ...(finalidade != null ? { finalidade } : {}),
      ...(ambiente != null ? { ambiente } : {}),
      destinatario,
      itens: itensPayload,
      ...(temAlgumImposto ? { impostos: impostosPayload } : {}),
      ...(temTransporte
        ? {
            transporte: {
              modalidade_frete: normalizarInt(transporte.modalidade_frete) || 0,
              transportadora: normalizarInt(transporte.transportadora) || null,
              placa_veiculo: transporte.placa_veiculo
                ? String(transporte.placa_veiculo)
                : null,
              uf_veiculo: transporte.uf_veiculo
                ? String(transporte.uf_veiculo)
                : null,
            },
          }
        : {}),
    }

    return payload
  }

  const salvarNota = async () => {
    setSalvando(true)
    try {
      const payload = montarPayload()
      const id = notaFiscalParam?.id

      const response = id
        ? await notasFiscaisService.atualizarNotaFiscalPorPk(id, payload, 'put')
        : await notasFiscaisService.criarNotaFiscalV2(payload)

      Alert.alert('Sucesso', id ? 'Nota atualizada' : 'Nota criada')
      navigation.replace('NotaFiscalDetalhe', { notaFiscal: response })
    } catch (error) {
      const msg =
        typeof error === 'string'
          ? error
          : error?.message
            ? error.message
            : 'Falha ao salvar nota fiscal'
      Alert.alert('Erro', msg)
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#a8e6cf" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    )
  }

  const renderConteudo = () => {
    switch (abaAtiva) {
      case ABAS.PRINCIPAL:
        return (
          <NotaFiscalAbaPrincipal
            styles={styles}
            principal={principal}
            setPrincipal={setPrincipal}
          />
        )
      case ABAS.CLIENTE:
        return (
          <NotaFiscalAbaCliente
            styles={styles}
            cliente={cliente}
            setCliente={setCliente}
            clienteSelecionado={clienteSelecionado}
            setClienteSelecionado={setClienteSelecionado}
          />
        )
      case ABAS.ITENS:
        return (
          <NotaFiscalAbaItens
            styles={styles}
            itens={itens}
            destinatarioId={cliente?.destinatario}
            selecionarItem={selecionarItem}
            removerItem={removerItem}
            itemEditandoIndex={itemEditandoIndex}
            itemEditando={itemEditando}
            setItemEditando={setItemEditando}
            salvarItemEditando={salvarItemEditando}
            cancelarEdicao={cancelarEdicao}
          />
        )
      case ABAS.CFOP:
        return (
          <NotaFiscalAbaCfop
            styles={styles}
            cfopPadrao={cfopPadrao}
            setCfopPadrao={setCfopPadrao}
            aplicarCfopPadraoNosItens={aplicarCfopPadraoNosItens}
          />
        )
      case ABAS.TRANSPORTE:
        return (
          <NotaFiscalAbaTransporte
            styles={styles}
            transporte={transporte}
            setTransporte={setTransporte}
          />
        )
      case ABAS.TOTAIS:
        return <NotaFiscalAbaTotais styles={styles} totais={totais} />
      default:
        return (
          <NotaFiscalAbaPrincipal
            styles={styles}
            principal={principal}
            setPrincipal={setPrincipal}
          />
        )
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        {Object.values(ABAS).map((aba) => {
          const isAtiva = abaAtiva === aba
          return (
            <TouchableOpacity
              key={aba}
              style={[styles.tab, isAtiva && styles.tabAtiva]}
              onPress={() => setAbaAtiva(aba)}
              activeOpacity={0.7}>
              <MaterialIcons
                name={getAbaIcon(aba)}
                size={18}
                color={isAtiva ? '#fff' : '#a8e6cf'}
              />
              <Text style={[styles.tabText, isAtiva && styles.tabTextAtiva]}>
                {getAbaLabel(aba)}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}>
        {renderConteudo()}

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.saveButton,
              salvando && styles.buttonDisabled,
            ]}
            onPress={salvarNota}
            disabled={salvando}>
            <Text style={styles.buttonText}>
              {salvando
                ? 'Salvando...'
                : notaFiscalParam?.id
                  ? 'Salvar Alterações'
                  : 'Criar Nota'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  loadingText: {
    marginTop: 10,
    color: '#f5f5f5',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  tabAtiva: {
    backgroundColor: 'rgba(168, 230, 207, 0.2)',
    borderBottomWidth: 3,
    borderBottomColor: '#a8e6cf',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#a8e6cf',
    marginLeft: 4,
  },
  tabTextAtiva: {
    color: '#fff',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 12,
    paddingBottom: 28,
  },
  section: {
    backgroundColor: 'rgba(168, 230, 207, 0.05)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(168, 230, 207, 0.25)',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f5f5f5',
    marginBottom: 10,
  },
  label: {
    color: '#a8e6cf',
    fontSize: 12,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    flex: 1,
  },
  selectValue: {
    color: '#fff',
  },
  selectPlaceholder: {
    color: '#666',
  },
  selectChevron: {
    color: '#a8e6cf',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#121212',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(168, 230, 207, 0.25)',
    maxHeight: '80%',
    paddingVertical: 12,
  },
  modalTitle: {
    color: '#f5f5f5',
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  modalOptionText: {
    color: '#fff',
  },
  modalCloseBtn: {
    marginTop: 10,
    marginHorizontal: 12,
    borderRadius: 10,
    paddingVertical: 10,
    backgroundColor: 'rgba(168, 230, 207, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(168, 230, 207, 0.25)',
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#a8e6cf',
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  col: {
    flex: 1,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(168, 230, 207, 0.2)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  cardTitle: {
    color: '#fff',
    fontWeight: '600',
    marginBottom: 6,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    position: 'relative',
  },
  primaryButton: {
    backgroundColor: '#2ecc71',
  },
  secondaryButton: {
    backgroundColor: '#3498db',
  },
  saveButton: {
    backgroundColor: '#a8e6cf',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#0a0a0a',
    fontWeight: '700',
  },
  listSection: {
    gap: 10,
  },
  listItem: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    padding: 12,
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  listItemTitle: {
    color: '#fff',
    fontWeight: '600',
    flex: 1,
  },
  listItemValue: {
    color: '#a8e6cf',
    fontWeight: '700',
  },
  listItemSub: {
    color: '#aaa',
    marginTop: 6,
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: '#3498db',
  },
  dangerButton: {
    backgroundColor: '#e74c3c',
  },
  smallButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  footer: {
    marginTop: 6,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(168, 230, 207, 0.15)',
  },
  totalRowStrong: {
    borderBottomWidth: 0,
    paddingTop: 14,
  },
  totalLabel: {
    color: '#fff',
    fontSize: 14,
  },
  totalValue: {
    color: '#a8e6cf',
    fontWeight: '700',
    fontSize: 14,
  },
  totalLabelStrong: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  totalValueStrong: {
    color: '#2ecc71',
    fontWeight: '800',
    fontSize: 16,
  },
}
