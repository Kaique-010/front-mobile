import React, { useState, useEffect, useRef } from 'react'
import {
  Modal,
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  Switch,
} from 'react-native'
import { LogBox } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import LeitorCodigoBarras from '../components/Leitor'
import { Ionicons } from '@expo/vector-icons'
import BuscaProdutoInput from '../components/BuscaProdutosInput'
import { apiGetComContexto } from '../utils/api'
import Toast from 'react-native-toast-message'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Cache para itens de pedidos
const ITENS_PEDIDOS_CACHE_KEY = 'itens_pedidos_cache'
const ITENS_PEDIDOS_CACHE_DURATION = 3 * 60 * 1000 // 3 minutos

export default function ItensModal({
  visivel,
  onFechar,
  onAdicionar,
  itemEditando,
}) {
  // ... existing code ...
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1a2f3d',
  },
  cabecalho: {
    color: 'white',
    textAlign: 'center',
    margin: 15,
    fontSize: 22,
    textDecorationLine: 'underline',
  },
  label: {
    color: 'white',
    textAlign: 'center',
    marginTop: 25,
  },
  input: {
    backgroundColor: '#232935',
    color: 'white',
    textAlign: 'center',
    marginTop: 10,
    borderRadius: 8,
    padding: 10,
  },
  highlight: {
    borderColor: '#10a2a7',
    borderWidth: 2,
  },
  total: {
    color: 'white',
    marginTop: 40,
    marginBottom: 60,
    textAlign: 'right',
    fontSize: 16,
  },
  botaoAdicionar: {
    padding: 12,
    backgroundColor: '#10a2a7',
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoCancelar: {
    padding: 12,
    marginTop: 15,
    backgroundColor: '#a80909',
    borderRadius: 8,
    alignItems: 'center',
  },
  textoBotao: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buscaComIcone: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  produtoInput: {
    flex: 1,
  },
  iconeLeitorInline: {
    padding: 10,
    backgroundColor: '#10a2a7',
    borderRadius: 8,
  },
  produtoNome: {
    color: '#ccc',
    textAlign: 'center',
    marginTop: 5,
    fontSize: 14,
  },
})
