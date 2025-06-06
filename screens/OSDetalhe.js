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
import AbaTotais from '../componentsOs/AbaTotais'
import { apiGetComContexto } from '../utils/api'

const OsDetalhe = ({ route }) => {
  const { os } = route.params
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
      const response = await apiGetComContexto('os/pecas/', {
        peca_os: os.os_os,
        peca_empr: os.os_empr,
        peca_fili: os.os_fili,
      })
      setPecas(response?.results || [])
    } catch (error) {
      console.error('Erro ao carregar peças:', error)
    }
  }

  const carregarServicos = async () => {
    try {
      const response = await apiGetComContexto('os/servicos/', {
        serv_os: os.os_os,
        serv_empr: os.os_empr,
        serv_fili: os.os_fili,
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
          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>{os.os_stat_os || '-'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Prioridade:</Text>
          <Text style={styles.value}>{os.os_prio || '-'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Total:</Text>
          <Text style={[styles.value, styles.totalValue]}>
            R$ {Number(os.os_tota || 0).toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Datas</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Abertura:</Text>
          <Text style={styles.value}>{os.os_data_aber || '-'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Fechamento:</Text>
          <Text style={styles.value}>{os.os_data_fech || '-'}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Descrições</Text>

        <View style={styles.descriptionRow}>
          <Text style={styles.label}>Problema:</Text>
          <Text style={styles.value}>{os.os_prob || '-'}</Text>
        </View>

        <View style={styles.descriptionRow}>
          <Text style={styles.label}>Observações:</Text>
          <Text style={styles.value}>{os.os_obse || '-'}</Text>
        </View>
      </View>
    </ScrollView>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>OS #{os.os_os}</Text>
        <Text style={styles.subtitle}>Cliente: {os.cliente_nome}</Text>
      </View>

      <View style={styles.tabs}>
        {['detalhes', 'pecas', 'servicos', 'totais'].map((aba) => (
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
          <AbaPecas pecas={pecas} setPecas={setPecas} os_os={os.os_os} />
        )}
        {abaAtiva === 'servicos' && (
          <AbaServicos
            servicos={servicos}
            setServicos={setServicos}
            os_os={os.os_os}
          />
        )}
        {abaAtiva === 'totais' && (
          <AbaTotais
            pecas={pecas}
            servicos={servicos}
            os_os={os.os_os}
            os_clie={os.os_enti}
            os_empr={os.os_empr}
            os_fili={os.os_fili}
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
    bosrBottomWidth: 2,
    bosrBottomColor: 'transparent',
  },
  tabActive: {
    bosrBottomColor: '#10a2a7',
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
    bosrRadius: 8,
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
    bosrBottomWidth: 1,
    bosrBottomColor: '#1a2f3d',
  },
  descriptionRow: {
    paddingVertical: 8,
    bosrBottomWidth: 1,
    bosrBottomColor: '#1a2f3d',
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

export default OsDetalhe
