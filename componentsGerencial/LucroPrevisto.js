import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Card } from 'react-native-paper';
import { useContextoApp } from '../hooks/useContextoApp';
import { apiGetComContexto } from '../utils/api';

const { width: screenWidth } = Dimensions.get('window');

const LucroPrevisto = () => {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataInicial, setDataInicial] = useState('2024-01-01');
  const [dataFinal, setDataFinal] = useState('2024-06-30');

  const carregarDados = async () => {
    try {
      setLoading(true);
      setErro(null);
      
      const params = {
        data_ini: dataInicial,
        data_fim: dataFinal,
      };
      
      const response = await apiGetComContexto('gerencial/financeiro/lucro-previsto/', params);
      setDados(response);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErro('Erro ao carregar dados de lucro previsto');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [dataInicial, dataFinal]);

  const prepararDadosGrafico = () => {
    if (!dados || !dados.historico || !dados.previsao) return null;

    const todosOsDados = [...dados.historico, ...dados.previsao];
    const labels = todosOsDados.map(item => {
      const [ano, mes] = item.mes.split('-');
      return `${mes}/${ano.slice(-2)}`;
    });
    const valores = todosOsDados.map(item => item.valor);

    return {
      labels,
      datasets: [
        {
          data: valores,
          color: (opacity = 1) => `rgba(40, 167, 69, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  const calcularTendencia = () => {
    if (!dados || !dados.previsao || dados.previsao.length < 2) return null;
    
    const primeiro = dados.previsao[0].valor;
    const ultimo = dados.previsao[dados.previsao.length - 1].valor;
    const crescimento = ((ultimo - primeiro) / primeiro) * 100;
    
    return {
      crescimento: crescimento.toFixed(1),
      tendencia: crescimento > 0 ? 'crescimento' : crescimento < 0 ? 'queda' : 'estável'
    };
  };

  const dadosGrafico = prepararDadosGrafico();
  const tendencia = calcularTendencia();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#28a745" />
        <Text style={styles.loadingText}>Carregando previsão de lucro...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card containerStyle={styles.card}>
        <Text style={styles.title}>Previsão de Lucro</Text>
        <Text style={styles.subtitle}>Análise Preditiva - Próximos 6 meses</Text>
        
        {dados && (
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              Modelo: {dados.modelo}
            </Text>
            <Text style={styles.infoText}>
              Erro Médio: R$ {dados.erro_medio?.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            {tendencia && (
              <Text style={[styles.infoText, {
                color: tendencia.tendencia === 'crescimento' ? '#28a745' : 
                       tendencia.tendencia === 'queda' ? '#dc3545' : '#6c757d'
              }]}>
                Tendência: {tendencia.tendencia} de {Math.abs(tendencia.crescimento)}%
              </Text>
            )}
          </View>
        )}
      </Card>

      {dadosGrafico && (
        <Card containerStyle={styles.card}>
          <Text style={styles.chartTitle}>Evolução do Lucro</Text>
          <LineChart
            data={dadosGrafico}
            width={screenWidth - 60}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(40, 167, 69, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#28a745',
              },
            }}
            bezier
            style={styles.chart}
          />
        </Card>
      )}

      {dados && dados.previsao && (
        <Card containerStyle={styles.card}>
          <Text style={styles.chartTitle}>Previsões de Lucro</Text>
          {dados.previsao.map((item, index) => {
            const [ano, mes] = item.mes.split('-');
            const mesNome = new Date(ano, mes - 1).toLocaleDateString('pt-BR', {
              month: 'long',
              year: 'numeric',
            });
            
            const isPositivo = item.valor >= 0;
            
            return (
              <View key={index} style={[
                styles.previsaoItem,
                { borderLeftColor: isPositivo ? '#28a745' : '#dc3545' }
              ]}>
                <Text style={styles.previsaoMes}>{mesNome}</Text>
                <Text style={[
                  styles.previsaoValor,
                  { color: isPositivo ? '#28a745' : '#dc3545' }
                ]}>
                  R$ {item.valor.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </View>
            );
          })}
        </Card>
      )}

      {dados && dados.historico && (
        <Card containerStyle={styles.card}>
          <Text style={styles.chartTitle}>Histórico Recente</Text>
          {dados.historico.slice(-3).map((item, index) => {
            const [ano, mes] = item.mes.split('-');
            const mesNome = new Date(ano, mes - 1).toLocaleDateString('pt-BR', {
              month: 'long',
              year: 'numeric',
            });
            
            const isPositivo = item.valor >= 0;
            
            return (
              <View key={index} style={[
                styles.historicoItem,
                { borderLeftColor: isPositivo ? '#17a2b8' : '#dc3545' }
              ]}>
                <Text style={styles.previsaoMes}>{mesNome}</Text>
                <Text style={[
                  styles.previsaoValor,
                  { color: isPositivo ? '#17a2b8' : '#dc3545' }
                ]}>
                  R$ {item.valor.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </View>
            );
          })}
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  card: {
    margin: 15,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 15,
  },
  infoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 5,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  previsaoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    marginVertical: 2,
    borderRadius: 5,
    borderLeftWidth: 4,
  },
  historicoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    marginVertical: 2,
    borderRadius: 5,
    borderLeftWidth: 4,
  },
  previsaoMes: {
    fontSize: 16,
    color: '#333',
    textTransform: 'capitalize',
  },
  previsaoValor: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LucroPrevisto;