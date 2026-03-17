import React, { useMemo } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import BuscaProdutoInput from '../../componentsNotasFiscais/buscas/BuscaProdutosInput'
import { notasFiscaisUtils } from '../notasFiscaisService'

const normalizarNumero = (v) => {
  if (v == null) return 0
  const s = String(v).trim()
  if (!s) return 0
  const n = Number(s.replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

const precoPreferido = (produto) => {
  const vista = Number(produto?.prod_preco_vista || 0)
  const normal = Number(produto?.prod_preco_normal || 0)
  if (Number.isFinite(vista) && vista > 0) return vista
  if (Number.isFinite(normal) && normal > 0) return normal
  return 0
}

export default function NotaFiscalAbaItens({
  styles,
  itens,
  destinatarioId,
  selecionarItem,
  removerItem,
  itemEditandoIndex,
  itemEditando,
  setItemEditando,
  salvarItemEditando,
  cancelarEdicao,
}) {
  const tituloEdicao =
    itemEditandoIndex != null
      ? `Editando item #${itemEditandoIndex + 1}`
      : 'Novo item'

  const initialValueProduto = useMemo(() => {
    return itemEditando?.produto_nome ? String(itemEditando.produto_nome) : ''
  }, [itemEditando?.produto_nome])

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Itens</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{tituloEdicao}</Text>

        <Text style={styles.label}>Produto</Text>
        <BuscaProdutoInput
          initialValue={initialValueProduto}
          destinatarioId={destinatarioId}
          onSelect={(produto) => {
            const id =
              produto?.prod_codi != null ? String(produto.prod_codi) : ''
            const nome =
              produto?.prod_nome != null ? String(produto.prod_nome) : ''

            setItemEditando((it) => {
              const unitAtual = String(it?.unitario ?? '').trim()
              const unitNum = normalizarNumero(unitAtual)
              const preco = precoPreferido(produto)
              const unitario =
                unitAtual.length === 0 || unitNum === 0
                  ? String(preco.toFixed(2))
                  : String(it.unitario ?? '')

              const preferirSugestao = (atual, sugestao) => {
                const sug = sugestao == null ? '' : String(sugestao).trim()
                if (sug) return sug
                return atual == null ? '' : String(atual)
              }

              const cfop = preferirSugestao(it?.cfop, produto?.cfop_sugerido)
              const ncm = preferirSugestao(
                it?.ncm,
                produto?.prod_ncm ?? produto?.ncm,
              )
              const cest = preferirSugestao(
                it?.cest,
                produto?.prod_cest ?? produto?.cest,
              )
              const cst_icms = preferirSugestao(
                it?.cst_icms,
                produto?.cst_icms_sugerido ?? produto?.cst_icms,
              )
              const cst_pis = preferirSugestao(
                it?.cst_pis,
                produto?.cst_pis_sugerido ?? produto?.cst_pis,
              )
              const cst_cofins = preferirSugestao(
                it?.cst_cofins,
                produto?.cst_cofins_sugerido ?? produto?.cst_cofins,
              )

              console.log('🧾 [NF-ITENS] Preenchimento por produto:', {
                produto: id,
                destinatarioId:
                  destinatarioId != null ? String(destinatarioId) : destinatarioId,
                cfop,
                ncm,
                cest,
                cst_icms,
                cst_pis,
                cst_cofins,
              })

              return {
                ...it,
                produto: id,
                produto_nome: nome,
                unitario,
                cfop,
                ncm,
                cest,
                cst_icms,
                cst_pis,
                cst_cofins,
              }
            })
          }}
        />

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Quantidade</Text>
            <TextInput
              style={styles.input}
              value={String(itemEditando.quantidade ?? '')}
              onChangeText={(v) =>
                setItemEditando((it) => ({ ...it, quantidade: v }))
              }
              placeholder="1"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Unitário</Text>
            <TextInput
              style={styles.input}
              value={String(itemEditando.unitario ?? '')}
              onChangeText={(v) =>
                setItemEditando((it) => ({ ...it, unitario: v }))
              }
              placeholder="0"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
          </View>
        </View>

        <Text style={styles.label}>Desconto</Text>
        <TextInput
          style={styles.input}
          value={String(itemEditando.desconto ?? '')}
          onChangeText={(v) =>
            setItemEditando((it) => ({ ...it, desconto: v }))
          }
          placeholder="0"
          placeholderTextColor="#666"
          keyboardType="numeric"
        />

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>CFOP</Text>
            <TextInput
              style={styles.input}
              value={String(itemEditando.cfop ?? '')}
              onChangeText={(v) =>
                setItemEditando((it) => ({ ...it, cfop: v }))
              }
              placeholder=""
              placeholderTextColor="#666"
            />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>NCM</Text>
            <TextInput
              style={styles.input}
              value={String(itemEditando.ncm ?? '')}
              onChangeText={(v) => setItemEditando((it) => ({ ...it, ncm: v }))}
              placeholder=""
              placeholderTextColor="#666"
            />
          </View>
        </View>

        <Text style={styles.label}>CEST</Text>
        <TextInput
          style={styles.input}
          value={String(itemEditando.cest ?? '')}
          onChangeText={(v) => setItemEditando((it) => ({ ...it, cest: v }))}
          placeholder=""
          placeholderTextColor="#666"
        />

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>CST ICMS</Text>
            <TextInput
              style={styles.input}
              value={String(itemEditando.cst_icms ?? '')}
              onChangeText={(v) =>
                setItemEditando((it) => ({ ...it, cst_icms: v }))
              }
              placeholder=""
              placeholderTextColor="#666"
            />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>CST PIS</Text>
            <TextInput
              style={styles.input}
              value={String(itemEditando.cst_pis ?? '')}
              onChangeText={(v) =>
                setItemEditando((it) => ({ ...it, cst_pis: v }))
              }
              placeholder=""
              placeholderTextColor="#666"
            />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>CST COFINS</Text>
            <TextInput
              style={styles.input}
              value={String(itemEditando.cst_cofins ?? '')}
              onChangeText={(v) =>
                setItemEditando((it) => ({ ...it, cst_cofins: v }))
              }
              placeholder=""
              placeholderTextColor="#666"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={salvarItemEditando}>
          <Text style={styles.buttonText}>Salvar Item</Text>
        </TouchableOpacity>

        {itemEditandoIndex != null ? (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={cancelarEdicao}>
            <Text style={styles.buttonText}>Cancelar Edição</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.listSection}>
        {(itens || []).map((it, idx) => {
          const qtd = normalizarNumero(it.quantidade)
          const unit = normalizarNumero(it.unitario)
          const desc = normalizarNumero(it.desconto)
          const totalLinha = qtd * unit - desc

          const titulo = it.produto_nome
            ? `${it.produto} - ${it.produto_nome}`
            : `Produto ${it.produto}`

          return (
            <View key={`${idx}-${it.produto}`} style={styles.listItem}>
              <View style={styles.listItemHeader}>
                <Text style={styles.listItemTitle} numberOfLines={1}>
                  {titulo}
                </Text>
                <Text style={styles.listItemValue}>
                  {notasFiscaisUtils.formatarMoeda(totalLinha)}
                </Text>
              </View>
              <Text style={styles.listItemSub}>
                Qtd: {String(it.quantidade ?? '')} | Unit:{' '}
                {String(it.unitario ?? '')} | Desc: {String(it.desconto ?? '')}
              </Text>
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.smallButton, styles.editButton]}
                  onPress={() => selecionarItem(idx)}>
                  <Text style={styles.smallButtonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.smallButton, styles.dangerButton]}
                  onPress={() => removerItem(idx)}>
                  <Text style={styles.smallButtonText}>Remover</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        })}
      </View>
    </View>
  )
}
