import React from 'react'
import { Modal, ScrollView, Text, TouchableOpacity } from 'react-native'
import styles from '../styles/formStyles'

const TELAS_POR_MODULO = {
  cadastro: [
    'Entidades',
    'Centros de Custos',
    'CFOPs',
    'Grupo de Entidades',
    'Mensagens Fiscais',
    'Condições de Recebimento',
  ],
  estoque: ['Cadastro de Produtos', 'Entradas', 'Saídas', 'Saldo', 'Etiquetas'],
  compras: [
    'Entrada Xml',
    'Pedidos de Compra',
    'Relatórios',
    'Nota de Entrada Própria',
  ],
  vendas: ['Pedidos de Venda', 'Orçamentos', 'Nota Fiscal', 'Relatórios'],
  financeiro: ['Contas a Pagar', 'Contas a Receber', 'Fluxo de Caixa'],
  agricola: ['Talhões', 'Aplicações', 'Colheitas', 'Abastecimento'],
  os: ['Abertura de OS', 'Execução', 'Encerramento', 'Relatórios'],
  transportes: ['MDFe', 'Cte', 'Rotas', 'Entregas', 'Motoristas'],
  confeccao: ['Confecção de Jóias', 'Ordens de Produção'],
  materiais: ['Consumo', 'Requisição', 'Estoque Interno'],
}

export default function TelasModal({
  modalModuloAtual,
  setModalModuloAtual,
  telasSelecionadasPorModulo,
  setTelasSelecionadasPorModulo,
}) {
  if (!modalModuloAtual) return null

  const telas = TELAS_POR_MODULO[modalModuloAtual] || []
  const selecionadas = telasSelecionadasPorModulo[modalModuloAtual] || []

  return (
    <Modal visible animationType="slide">
      <ScrollView style={{ padding: 20 }}>
        <Text style={styles.label}>Telas do módulo: {modalModuloAtual}</Text>
        {telas.map((tela) => {
          const marcada = selecionadas.includes(tela)
          return (
            <TouchableOpacity
              key={tela}
              style={[
                styles.choiceButton,
                marcada && styles.choiceButtonSelected,
              ]}
              onPress={() => {
                const novasTelas = marcada
                  ? selecionadas.filter((t) => t !== tela)
                  : [...selecionadas, tela]

                setTelasSelecionadasPorModulo((prev) => ({
                  ...prev,
                  [modalModuloAtual]: novasTelas,
                }))
              }}>
              <Text style={styles.choiceButtonText}>{tela}</Text>
            </TouchableOpacity>
          )
        })}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => setModalModuloAtual(null)}>
          <Text style={styles.saveButtonText}>Confirmar Telas</Text>
        </TouchableOpacity>
      </ScrollView>
    </Modal>
  )
}
