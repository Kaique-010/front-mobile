import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import AbaPecas from '../componentsOs/AbaPecas'
import AbaServicos from '../componentsOs/AbaServicos'
import AbaFotos from '../componentsOs/AbaForos'
import AbaTotais from '../componentsOs/AbaTotais'
import { apiGetComContexto } from '../utils/api'
import useContextoApp from '../hooks/useContextoApp'

const OrdemDetalhe = ({ route }) => {
  const { ordem } = route.params
  const { usuarioId } = useContextoApp()
  const [abaAtiva, setAbaAtiva] = useState('detalhes')
  const [pecas, setPecas] = useState([])
  const [servicos, setServicos] = useState([])

  useEffect(() => {
    carregarPecas()
    carregarServicos()
  }, [])

  useEffect(() => {
    if (abaAtiva === 'totais') {
      carregarPecas()
      carregarServicos()
    }
  }, [abaAtiva])

  const carregarPecas = async () => {
    try {
      const response = await apiGetComContexto('ordemdeservico/pecas/', {
        peca_orde: ordem.orde_nume,
        peca_empr: ordem.orde_empr,
        peca_fili: ordem.orde_fili,
      })
      setPecas(response?.results || [])
    } catch (error) {
      console.error('Erro ao carregar peças:', error)
    }
  }

  const carregarServicos = async () => {
    try {
      const response = await apiGetComContexto('ordemdeservico/servicos/', {
        serv_orde: ordem.orde_nume,
        serv_empr: ordem.orde_empr,
        serv_fili: ordem.orde_fili,
      })
      setServicos(response?.results || [])
    } catch (error) {
      console.error('Erro ao carregar serviços:', error)
    }
  }

  const renderDetalhes = () => (
    <ScrollView style={styles.detalhesContainer}>
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Informações Gerais</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Tipo:</Text>
          <Text style={styles.value}>{ordem.orde_tipo || '-'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>{ordem.orde_stat || '-'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Prioridade:</Text>
          <Text style={styles.value}>{ordem.orde_prio || '-'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Total:</Text>
          <Text style={[styles.value, styles.totalValue]}>
            R$ {Number(ordem.orde_tota || 0).toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Datas</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Abertura:</Text>
          <Text style={styles.value}>{ordem.orde_data_aber || '-'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Fechamento:</Text>
          <Text style={styles.value}>{ordem.orde_data_fech || '-'}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Descrições</Text>

        <View style={styles.descriptionRow}>
          <Text style={styles.label}>Problema:</Text>
          <Text style={styles.value}>{ordem.orde_prob || '-'}</Text>
        </View>

        <View style={styles.descriptionRow}>
          <Text style={styles.label}>Defeito:</Text>
          <Text style={styles.value}>{ordem.orde_defe_desc || '-'}</Text>
        </View>

        <View style={styles.descriptionRow}>
          <Text style={styles.label}>Observações:</Text>
          <Text style={styles.value}>{ordem.orde_obse || '-'}</Text>
        </View>
      </View>
    </ScrollView>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>OS #{ordem.orde_nume}</Text>
        <Text style={styles.subtitle}>Cliente: {ordem.cliente_nome}</Text>
      </View>

      <View style={styles.tabs}>
        {['detalhes', 'pecas', 'servicos', 'fotos', 'totais'].map((aba) => (
          <TouchableOpacity
            key={aba}
            onPress={() => setAbaAtiva(aba)}
            style={[styles.tab, abaAtiva === aba && styles.tabActive]}>
            <Text
              style={[
                styles.tabText,
                abaAtiva === aba && styles.tabTextActive,
              ]}>
              {aba.charAt(0).toUpperCase() + aba.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {abaAtiva === 'detalhes' && renderDetalhes()}
        {abaAtiva === 'pecas' && (
          <AbaPecas
            pecas={pecas}
            setPecas={setPecas}
            orde_nume={ordem.orde_nume}
          />
        )}
        {abaAtiva === 'servicos' && (
          <AbaServicos
            servicos={servicos}
            setServicos={setServicos}
            orde_nume={ordem.orde_nume}
          />
        )}
        {abaAtiva === 'fotos' && (
          <AbaFotos
            fotos={[]}
            setFotos={() => {}}
            orde_nume={ordem.orde_nume}
            codTecnico={usuarioId}
          />
        )}
        {abaAtiva === 'totais' && (
          <AbaTotais
            pecas={pecas}
            servicos={servicos}
            orde_nume={ordem.orde_nume}
            orde_clie={ordem.orde_enti}
            orde_empr={ordem.orde_empr}
            orde_fili={ordem.orde_fili}
          />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a2f3d',
  },
  header: {
    padding: 20,
    backgroundColor: '#232935',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10a2a7',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 20,
    color: '#faebd7',
    opacity: 0.8,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#232935',
    paddingHorizontal: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#10a2a7',
  },
  tabText: {
    color: '#faebd7',
    opacity: 0.7,
  },
  tabTextActive: {
    color: '#10a2a7',
    opacity: 1,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  detalhesContainer: {
    padding: 15,
  },
  infoCard: {
    backgroundColor: '#232935',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  cardTitle: {
    color: '#10a2a7',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1a2f3d',
  },
  descriptionRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1a2f3d',
  },
  label: {
    color: '#faebd7',
    opacity: 0.7,
    flex: 1,
  },
  value: {
    color: '#fff',
    flex: 2,
    textAlign: 'right',
  },
  totalValue: {
    color: '#10a2a7',
    fontWeight: 'bold',
    fontSize: 16,
  },
})

export default OrdemDetalhe
