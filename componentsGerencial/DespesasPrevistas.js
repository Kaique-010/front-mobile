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

const DespesasPrevistas = () => {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(false);
  const [periodo, setPeriodo] = useState({
    data_ini: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    data_fim: new Date().toISOString().split('T')[0],
  });

  const buscarDados = async () => {
    setLoading(true);
    try {
      const params = {
        data_ini: periodo.data_ini,
        data_fim: periodo.data_fim,
      };
      
      const response = await apiGetComContexto('gerencial/financeiro/despesas-previstas/', params);
      setDados(response);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar dados de despesas previstas');
      console.error('Erro ao buscar despesas previstas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarDados();
  }, [periodo]);

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
          color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  const dadosGrafico = prepararDadosGrafico();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando análise de despesas...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card containerStyle={styles.card}>
        <Text style={styles.title}>Análise de Despesas Previstas</Text>
        <Text style={styles.subtitle}>Regressão Linear - Próximos 6 meses</Text>
        
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
          </View>
        )}
      </Card>

      {dadosGrafico && (
        <Card containerStyle={styles.card}>
          <Text style={styles.chartTitle}>Evolução das Despesas</Text>
          <LineChart
            data={dadosGrafico}
            width={screenWidth - 60}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#ff6384',
              },
            }}
            bezier
            style={styles.chart}
          />
        </Card>
      )}

      {dados && dados.previsao && (
        <Card containerStyle={styles.card}>
          <Text style={styles.chartTitle}>Previsões para os Próximos Meses</Text>
          {dados.previsao.map((item, index) => {
            const [ano, mes] = item.mes.split('-');
            const mesNome = new Date(ano, mes - 1).toLocaleDateString('pt-BR', {
              month: 'long',
              year: 'numeric',
            });
            
            return (
              <View key={index} style={styles.previsaoItem}>
                <Text style={styles.previsaoMes}>{mesNome}</Text>
                <Text style={styles.previsaoValor}>
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
    borderLeftColor: '#ff6384',
  },
  previsaoMes: {
    fontSize: 16,
    color: '#333',
    textTransform: 'capitalize',
  },
  previsaoValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6384',
  },
});

export default DespesasPrevistas;