import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native'
import AbaPecas from '../../componentsFloresta/osFlorestal/AbaPecas'
import AbaServicos from '../../componentsFloresta/osFlorestal/AbaServicos'
import AbaTotais from '../../componentsFloresta/osFlorestal/AbaTotais'
import { apiGetComContexto } from '../../utils/api'
import useContextoApp from '../../hooks/useContextoApp' 

const OrdemFlorestalDetalhe = ({ route, navigation }) => {
  const { osfl_orde, item } = route.params
  const { empresaId, filialId } = useContextoApp()
  const [abaAtiva, setAbaAtiva] = useState('detalhes')
  const [pecas, setPecas] = useState([])
  const [servicos, setServicos] = useState([])
  const [totaisOs, setTotaisOs] = useState({
    osfl_tota_hect: 0,
    osfl_desc: 0,
    osfl_outr: 0,
    osfl_tota: 0,
  })
  const [dadosModificados, setDadosModificados] = useState(false)
  const [financeiroGerado, setFinanceiroGerado] = useState(false) 

  useEffect(() => {
    const beforeRemove = (e) => {
      if (dadosModificados) {
        e.preventDefault()
        Alert.alert(
          'Alterações não salvas',
          'Você tem alterações não salvas. Deseja sair mesmo assim?',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Sair',
              style: 'destructive',
              onPress: () => navigation.dispatch(e.data.action),
            },
          ]
        )
      }
    }

    navigation.addListener('beforeRemove', beforeRemove)
    return () => navigation.removeListener('beforeRemove', beforeRemove)
  }, [navigation, dadosModificados])

  const renderDetalhes = () => (
    <ScrollView style={styles.detalhesContainer}>
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Informações Gerais</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>{osfl_orde.orde_stat|| '-'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.label, { flex: 1 }]}>Total:</Text>
          <Text style={[styles.value, styles.totalValue]}>
            R$ {Number(osfl_orde.osfl_tota || 0).toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Datas</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Abertura:</Text>
          <Text style={styles.value}>{osfl_orde.osfl_data_aber || '-'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Fechamento:</Text>
          <Text style={styles.value}>{osfl_orde.osfl_data_fech || '-'}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Descrições</Text>

        <View style={styles.descriptionRow}>
          <Text style={styles.label}>Problema:</Text>
          <Text style={styles.value}>{osfl_orde.osfl_prob || '-'}</Text>
        </View>

        <View style={styles.descriptionRow}>
          <Text style={styles.label}>Observações:</Text>
          <Text style={styles.value}>{osfl_orde.osfl_obse || '-'}</Text>
        </View>
      </View>
    </ScrollView>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>OS #{osfl_orde.osfl_orde || '-'}</Text>
        <Text style={styles.subtitle}>Cliente: {osfl_orde.cliente_nome || '-'}</Text>
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
        {abaAtiva === 'detalhes' ? (
          renderDetalhes()
        ) : (
          <View style={{ flex: 1 }}>
            {abaAtiva === 'pecas' && (
              <AbaPecas 
                pecas={pecas} 
                setPecas={setPecas} 
                osfl_orde={osfl_orde.osfl_orde || osfl_orde}
                osfl_empr={empresaId}
                osfl_fili={filialId}
                financeiroGerado={financeiroGerado}
              />
            )}
            {abaAtiva === 'servicos' && (
              <AbaServicos
                servicos={servicos}
                setServicos={setServicos}
                osfl_orde={osfl_orde.osfl_orde || osfl_orde}
                osfl_empr={empresaId}
                osfl_fili={filialId}
                financeiroGerado={financeiroGerado} 
              />
            )}
            {abaAtiva === 'totais' && (
              <AbaTotais
                pecas={pecas}
                servicos={servicos}
                totaisOs={totaisOs}
                setTotaisOs={setTotaisOs}
                osfl_orde={osfl_orde.osfl_orde || osfl_orde}
                osfl_empr={empresaId}
                osfl_fili={filialId}
                onFinanceiroGerado={setFinanceiroGerado} 
              />
            )}
          </View>
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
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  tabActive: {
    borderBottomColor: '#10a2a7',
  },
  tabText: {
    color: '#faebd7',
    opacity: 0.7,
    fontSize: 16,
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

export default OrdemFlorestalDetalhe
