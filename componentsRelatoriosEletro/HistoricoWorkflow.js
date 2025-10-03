import React, { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { apiGetComContexto } from '../utils/api'
import styles from './OrdensEletroStyles'

const coresSetor = [
  '#FF9800',
  '#2196F3',
  '#4CAF50',
  '#9C27B0',
  '#F44336',
  '#FFC107',
]

export default function HistoricoWorkflow({ navigation }) {
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [detalhePorOs, setDetalhePorOs] = useState([])
  const [resumoGeral, setResumoGeral] = useState([])
  const [page, setPage] = useState(1)
  const [nextPage, setNextPage] = useState(null)
  const [prevPage, setPrevPage] = useState(null)
  const [filtroOs, setFiltroOs] = useState('')
  const [filtroSetor, setFiltroSetor] = useState('')
  const [viewPorOs, setViewPorOs] = useState(true)
  const [mapSetores, setMapSetores] = useState({})
  const [listaSetores, setListaSetores] = useState([])

  useEffect(() => {
    carregarSetores()
  }, [])

  useEffect(() => {
    buscarHistorico()
  }, [page])

  const carregarSetores = async () => {
    try {
      const res = await apiGetComContexto('ordemdeservico/fase-setor/', {
        page_size: 1000,
      })
      const lista = res.results || res
      const mapa = {}
      const arr = []
      ;(Array.isArray(lista) ? lista : []).forEach((s) => {
        if (s.osfs_codi) {
          mapa[String(s.osfs_codi)] = s.osfs_nome || String(s.osfs_codi)
          arr.push({
            id: String(s.osfs_codi),
            nome: s.osfs_nome || String(s.osfs_codi),
          })
        }
      })
      setMapSetores(mapa)
      setListaSetores(arr)
    } catch (e) {
      console.log('Erro ao carregar setores', e.message)
    }
  }

  const buscarHistorico = async () => {
    setLoading(true)
    setErro('')
    try {
      const params = { page_size: 20 }
      if (filtroOs) params.hist_orde = filtroOs
      if (filtroSetor) params.hist_seto_dest = filtroSetor
      if (page) params.page = page

      const res = await apiGetComContexto(
        'ordemdeservico/historico-workflow/',
        params
      )
      const payload = res?.results ? res.results : res
      const detalhe = payload?.detalhe_por_os || []
      const resumo = payload?.resumo_setor_total || []

      setDetalhePorOs(Array.isArray(detalhe) ? detalhe : [])
      setResumoGeral(Array.isArray(resumo) ? resumo : [])
      setNextPage(res?.next || null)
      setPrevPage(res?.previous || null)
    } catch (e) {
      const msg =
        e.response?.data?.detail || e.message || 'Erro ao buscar histórico'
      setErro(msg)
    } finally {
      setLoading(false)
    }
  }

  const aplicarFiltros = () => {
    setPage(1)
    buscarHistorico()
  }

  const limparFiltros = () => {
    setFiltroOs('')
    setFiltroSetor('')
    setPage(1)
  }

  const nomeDoSetor = (codigo) => {
    const key = String(codigo).replace('Setor_', '')
    return mapSetores[key] || `Setor ${key}`
  }

  const maxSegundosResumo = useMemo(() => {
    return resumoGeral.reduce(
      (acc, item) => Math.max(acc, item.total_segundos || 0),
      0
    )
  }, [resumoGeral])

  const BarraResumo = ({ valor, cor }) => {
    const max = maxSegundosResumo || 1
    const pct = Math.min(100, Math.round(((valor || 0) / max) * 100))
    return (
      <View
        style={{
          backgroundColor: '#e0e0e0',
          height: 12,
          borderRadius: 6,
          overflow: 'hidden',
        }}>
        <View
          style={{
            width: `${pct}%`,
            height: 12,
            backgroundColor: cor,
            borderRadius: 6,
          }}
        />
      </View>
    )
  }

  const Header = () => (
    <View
      style={{
        backgroundColor: '#1976d2',
        paddingHorizontal: 16,
        paddingVertical: 20,
        paddingTop: 40,
      }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: '#fff',
              marginBottom: 4,
            }}>
            Histórico Workflow
          </Text>
          <Text style={{ fontSize: 13, color: '#bbdefb' }}>
            Acompanhe o tempo de cada OS por setor
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setViewPorOs(!viewPorOs)}
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
            gap: 6,
          }}>
          <MaterialIcons
            name={viewPorOs ? 'bar-chart' : 'list'}
            size={18}
            color="#fff"
          />
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>
            {viewPorOs ? 'Resumo' : 'Por OS'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const Filtros = () => (
    <View
      style={{
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
      }}>
      <View style={{ gap: 12 }}>
        <View style={{ position: 'relative' }}>
          <MaterialIcons
            name="search"
            size={20}
            color="#757575"
            style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }}
          />
          <TextInput
            style={{
              backgroundColor: '#f5f5f5',
              paddingLeft: 40,
              paddingRight: 16,
              paddingVertical: 12,
              borderRadius: 8,
              fontSize: 14,
              borderWidth: 1,
              borderColor: '#e0e0e0',
            }}
            placeholder="Buscar por nº da OS..."
            value={filtroOs}
            onChangeText={setFiltroOs}
            keyboardType="numeric"
          />
        </View>

        <View style={{ position: 'relative' }}>
          <MaterialIcons
            name="filter-list"
            size={20}
            color="#757575"
            style={{ position: 'absolute', left: 12, top: 12, zIndex: 1 }}
          />
          <View
            style={{
              backgroundColor: '#f5f5f5',
              paddingLeft: 40,
              paddingRight: 16,
              paddingVertical: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#e0e0e0',
            }}>
            <Text
              style={{ fontSize: 14, color: filtroSetor ? '#000' : '#757575' }}>
              {filtroSetor ? nomeDoSetor(filtroSetor) : 'Todos os setores'}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={aplicarFiltros}
            style={{
              flex: 1,
              backgroundColor: '#1976d2',
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: 'center',
            }}>
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
              Buscar
            </Text>
          </TouchableOpacity>

          {(filtroOs || filtroSetor) && (
            <TouchableOpacity
              onPress={limparFiltros}
              style={{
                backgroundColor: '#f5f5f5',
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <MaterialIcons name="clear" size={20} color="#757575" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  )

  const CardPorOS = ({ item, index }) => {
    const setores = Object.entries(item.tempos_por_setor || {})
    const mais = item.setor_mais_tempo
    const menos = item.setor_menos_tempo

    return (
      <View
        style={{
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: '#e0e0e0',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              style={{
                width: 40,
                height: 40,
                backgroundColor: '#e3f2fd',
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{ color: '#1976d2', fontWeight: 'bold', fontSize: 13 }}>
                #{item.ordem}
              </Text>
            </View>
            <View>
              <Text
                style={{ fontSize: 16, fontWeight: '600', color: '#212121' }}>
                OS {item.ordem}
              </Text>
              <Text style={{ fontSize: 12, color: '#757575' }}>
                {setores.length} setor(es)
              </Text>
            </View>
          </View>
          <MaterialIcons name="schedule" size={20} color="#9e9e9e" />
        </View>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 12,
          }}>
          {setores.map(([cod, hhmm], i) => (
            <View
              key={`${item.ordem}-${cod}`}
              style={{
                backgroundColor: coresSetor[i % coresSetor.length],
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 20,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}>
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>
                {nomeDoSetor(cod)}
              </Text>
              <Text style={{ color: '#fff', fontSize: 12, opacity: 0.9 }}>
                • {hhmm}
              </Text>
            </View>
          ))}
        </View>

        {setores.length > 1 && (
          <View
            style={{
              backgroundColor: '#f5f5f5',
              borderRadius: 8,
              padding: 12,
              gap: 8,
            }}>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, color: '#616161' }}>
                ⏱️ Mais demorou:
              </Text>
              <Text
                style={{ fontSize: 13, fontWeight: '600', color: '#212121' }}>
                {nomeDoSetor(mais.setor)} ({mais.hhmmss})
              </Text>
            </View>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 13, color: '#616161' }}>
                ⚡ Menos demorou:
              </Text>
              <Text
                style={{ fontSize: 13, fontWeight: '600', color: '#212121' }}>
                {nomeDoSetor(menos.setor)} ({menos.hhmmss})
              </Text>
            </View>
          </View>
        )}
      </View>
    )
  }

  const ResumoGeralView = () => (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 20,
            borderWidth: 1,
            borderColor: '#e0e0e0',
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16,
            }}>
            <MaterialIcons name="bar-chart" size={20} color="#1976d2" />
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#212121' }}>
              Resumo Geral por Setor
            </Text>
          </View>

          <View style={{ gap: 16 }}>
            {resumoGeral.map((r, i) => (
              <View key={`res-${r.setor}-${i}`}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#424242',
                    }}>
                    {nomeDoSetor(r.setor)}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#757575' }}>
                    {r.total_hhmmss}
                  </Text>
                </View>
                <BarraResumo
                  valor={r.total_segundos}
                  cor={coresSetor[i % coresSetor.length]}
                />
              </View>
            ))}
            {(!resumoGeral || resumoGeral.length === 0) && (
              <Text
                style={{
                  textAlign: 'center',
                  color: '#9e9e9e',
                  paddingVertical: 20,
                }}>
                Sem dados de resumo
              </Text>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  )

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fafafa',
        }}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={{ marginTop: 12, color: '#757575', fontSize: 14 }}>
          Carregando histórico...
        </Text>
      </View>
    )
  }

  if (erro) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
          backgroundColor: '#fafafa',
        }}>
        <MaterialIcons name="error-outline" size={56} color="#f44336" />
        <Text
          style={{
            marginTop: 16,
            fontSize: 16,
            color: '#424242',
            textAlign: 'center',
          }}>
          {erro}
        </Text>
        <TouchableOpacity
          onPress={buscarHistorico}
          style={{
            marginTop: 20,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#1976d2',
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 8,
            gap: 8,
          }}>
          <MaterialIcons name="refresh" size={20} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
            Tentar novamente
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fafafa' }}>
      <Header />
      <Filtros />

      {viewPorOs ? (
        <FlatList
          data={detalhePorOs}
          keyExtractor={(item, idx) => `${item.ordem}-${idx}`}
          renderItem={({ item, index }) => (
            <CardPorOS item={item} index={index} />
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <MaterialIcons name="history" size={64} color="#bdbdbd" />
              <Text style={{ marginTop: 12, fontSize: 14, color: '#757575' }}>
                Nenhum histórico encontrado
              </Text>
            </View>
          }
        />
      ) : (
        <ResumoGeralView />
      )}

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 16,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        }}>
        <TouchableOpacity
          onPress={() => prevPage && setPage(page - 1)}
          disabled={!prevPage}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: prevPage ? '#424242' : '#e0e0e0',
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 8,
            gap: 4,
          }}>
          <MaterialIcons
            name="chevron-left"
            size={20}
            color={prevPage ? '#fff' : '#9e9e9e'}
          />
          <Text
            style={{
              color: prevPage ? '#fff' : '#9e9e9e',
              fontWeight: '600',
              fontSize: 14,
            }}>
            Anterior
          </Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 13, color: '#757575' }}>
          Página{' '}
          <Text style={{ fontWeight: '600', color: '#424242' }}>{page}</Text>
        </Text>

        <TouchableOpacity
          onPress={() => nextPage && setPage(page + 1)}
          disabled={!nextPage}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: nextPage ? '#424242' : '#e0e0e0',
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 8,
            gap: 4,
          }}>
          <Text
            style={{
              color: nextPage ? '#fff' : '#9e9e9e',
              fontWeight: '600',
              fontSize: 14,
            }}>
            Próxima
          </Text>
          <MaterialIcons
            name="chevron-right"
            size={20}
            color={nextPage ? '#fff' : '#9e9e9e'}
          />
        </TouchableOpacity>
      </View>
    </View>
  )
}
