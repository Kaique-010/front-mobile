import React, { useState } from 'react'
import {
  View,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { handleApiError } from '../../utils/errorHandler'
import BuscaClienteInput from '../../components/BuscaClienteInput'
import { usePonto } from '../hooks/usePonto'
import ListarPontos from '../listarPontos'

export default function PontoScreen() {
  const [entidade, setEntidade] = useState(null)
  const colaboradorId = entidade?.enti_clie
  const { pontos, registrarPonto, loading } = usePonto(colaboradorId)

  async function baterPonto(tipo_movimento) {
    if (!entidade) {
      handleApiError('Colaborador é obrigatório.')
      return
    }

    await registrarPonto({
      colaborador_id: entidade.enti_clie,
      tipo: tipo_movimento,
    })
  }

  if (loading && !pontos.length) {
  }

  // If we want a "cool" loading screen
  if (loading && !pontos.length && !entidade) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1f2d3aff" />

      <View style={styles.headerContainer}>
        <Ionicons
          name="time"
          size={28}
          color="#40E0D0"
          style={styles.headerIcon}
        />
        <Text style={styles.headerText}>Controle de Ponto</Text>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.inputCard}>
          <Text style={styles.label}>Selecione o Colaborador</Text>
          <BuscaClienteInput
            tipo="FU"
            placeholder="Buscar por nome..."
            onSelect={setEntidade}
          />
        </View>

        {entidade && (
          <View style={styles.actionsContainer}>
            <View style={styles.buttonsRow}>
              <TouchableOpacity
                style={[styles.button, styles.buttonEntrada]}
                activeOpacity={0.7}
                disabled={loading}
                onPress={() => baterPonto('ENTRADA')}>
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons
                      name="enter-outline"
                      size={24}
                      color="#fff"
                      style={styles.btnIcon}
                    />
                    <Text style={styles.buttonText}>ENTRADA</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.buttonSaida]}
                activeOpacity={0.7}
                disabled={loading}
                onPress={() => baterPonto('SAIDA')}>
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons
                      name="exit-outline"
                      size={24}
                      color="#fff"
                      style={styles.btnIcon}
                    />
                    <Text style={styles.buttonText}>SAÍDA</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Histórico Recente</Text>
              <Ionicons name="list" size={20} color="#ccc" />
            </View>

            <View style={styles.listWrapper}>
              <ListarPontos
                colaboradorId={colaboradorId}
                pontos={pontos}
                loading={loading}
              />
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f2d3aff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1f2d3aff',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerIcon: {
    marginRight: 10,
  },
  headerText: {
    textAlign: 'left',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  inputCard: {
    backgroundColor: '#2c3e50',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  label: {
    color: '#bdc3c7',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  actionsContainer: {
    flex: 1,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonEntrada: {
    backgroundColor: '#316346ff',
    marginRight: 10,
  },
  buttonSaida: {
    backgroundColor: '#993f36ff',
    marginLeft: 10,
  },
  btnIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  listTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  listWrapper: {
    flex: 1,
    backgroundColor: '#ecf0f1',
    borderRadius: 12,
    overflow: 'hidden', // Ensures list doesn't overflow rounded corners
    padding: 5,
  },
})
