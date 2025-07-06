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

const FluxoCaixaPrevisto = () => {
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
      
      const response = await apiGetComContexto('gerencial/financeiro/fluxo-previsto/', params);
      setDados(response);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setErro('Erro ao carregar dados de fluxo de caixa previsto');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [dataInicial, dataFinal]);

  const prepararDadosGrafico = () => {
    if (!dados || !dados.fluxo_caixa_previsto) return null;

    const labels = dados.fluxo_caixa_previsto.map(item => {
      const [ano, mes] = item.mes.split('-');
      return `${mes}/${ano.slice(-2)}`;
    });
    
    const receitas = dados.fluxo_caixa_previsto.map(item => item.receita);
    const despesas = dados.fluxo_caixa_previsto.map(item => item.despesa);
    const fluxoLiquido = dados.fluxo_caixa_previsto.map(item => item.fluxo_liquido);

    return {
      labels,
      datasets: [
        {
          data: receitas,
          color: (opacity = 1) => `rgba(40, 167, 69, ${opacity})`,
          strokeWidth: 2,
        },
        {
          data: despesas,
          color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
          strokeWidth: 2,
        },
        {
          data: fluxoLiquido,
          color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    };
  };

  const calcularResumo = () => {
    if (!dados || !dados.fluxo_caixa_previsto) return null;
    
    const totalReceita = dados.fluxo_caixa_previsto.reduce((acc, item) => acc + item.receita, 0);
    const totalDespesa = dados.fluxo_caixa_previsto.reduce((acc, item) => acc + item.despesa, 0);
    const fluxoTotal = totalReceita - totalDespesa;
    
    const mesesPositivos = dados.fluxo_caixa_previsto.filter(item => item.fluxo_liquido > 0).length;
    const mesesNegativos = dados.fluxo_caixa_previsto.filter(item => item.fluxo_liquido < 0).length;
    
    return {
      totalReceita,
      totalDespesa,
      fluxoTotal,
      mesesPositivos,
      mesesNegativos,
      mediaFluxo: fluxoTotal / dados.fluxo_caixa_previsto.length
    };
  };

  const dadosGrafico = prepararDadosGrafico();
  const resumo = calcularResumo();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando fluxo de caixa previsto...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card containerStyle={styles.card}>
        <Text style={styles.title}>Fluxo de Caixa Previsto</Text>
        <Text style={styles.subtitle}>Análise Preditiva - Próximos 6 meses</Text>
        
        {dados && (
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              Modelo: {dados.modelo}
            </Text>
            <Text style={styles.infoText}>
              Erro Médio Receita: R$ {dados.erro_medio_receita?.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            <Text style={styles.infoText}>
              Erro Médio Despesa: R$ {dados.erro_medio_despesa?.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>
        )}
      </Card>

      {resumo && (
        <Card containerStyle={styles.card}>
          <Text style={styles.chartTitle}>Resumo do Período</Text>
          <View style={styles.resumoContainer}>
            <View style={styles.resumoItem}>
              <Text style={styles.resumoLabel}>Total Receitas</Text>
              <Text style={[styles.resumoValor, { color: '#28a745' }]}>
                R$ {resumo.totalReceita.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
            <View style={styles.resumoItem}>
              <Text style={styles.resumoLabel}>Total Despesas</Text>
              <Text style={[styles.resumoValor, { color: '#dc3545' }]}>
                R$ {resumo.totalDespesa.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
            <View style={styles.resumoItem}>
              <Text style={styles.resumoLabel}>Fluxo Líquido</Text>
              <Text style={[
                styles.resumoValor, 
                { color: resumo.fluxoTotal >= 0 ? '#28a745' : '#dc3545' }
              ]}>
                R$ {resumo.fluxoTotal.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
            <View style={styles.resumoItem}>
              <Text style={styles.resumoLabel}>Meses Positivos</Text>
              <Text style={styles.resumoValor}>{resumo.mesesPositivos} de 6</Text>
            </View>
          </View>
        </Card>
      )}

      {dadosGrafico && (
        <Card containerStyle={styles.card}>
          <Text style={styles.chartTitle}>Evolução do Fluxo de Caixa</Text>
          <View style={styles.legendaContainer}>
            <View style={styles.legendaItem}>
              <View style={[styles.legendaCor, { backgroundColor: '#28a745' }]} />
              <Text style={styles.legendaTexto}>Receitas</Text>
            </View>
            <View style={styles.legendaItem}>
              <View style={[styles.legendaCor, { backgroundColor: '#ff6384' }]} />
              <Text style={styles.legendaTexto}>Despesas</Text>
            </View>
            <View style={styles.legendaItem}>
              <View style={[styles.legendaCor, { backgroundColor: '#36a2eb' }]} />
              <Text style={styles.legendaTexto}>Fluxo Líquido</Text>
            </View>
          </View>
          <LineChart
            data={dadosGrafico}
            width={screenWidth - 60}
            height={250}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '3',
                strokeWidth: '2',
              },
            }}
            bezier
            style={styles.chart}
          />
        </Card>
      )}

      {dados && dados.fluxo_caixa_previsto && (
        <Card containerStyle={styles.card}>
          <Text style={styles.chartTitle}>Detalhamento Mensal</Text>
          {dados.fluxo_caixa_previsto.map((item, index) => {
            const [ano, mes] = item.mes.split('-');
            const mesNome = new Date(ano, mes - 1).toLocaleDateString('pt-BR', {
              month: 'long',
              year: 'numeric',
            });
            
            const isFluxoPositivo = item.fluxo_liquido >= 0;
            
            return (
              <View key={index} style={styles.detalhamentoItem}>
                <Text style={styles.detalhamentoMes}>{mesNome}</Text>
                <View style={styles.detalhamentoValores}>
                  <View style={styles.valorItem}>
                    <Text style={styles.valorLabel}>Receita:</Text>
                    <Text style={[styles.valorTexto, { color: '#28a745' }]}>
                      R$ {item.receita.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                  </View>
                  <View style={styles.valorItem}>
                    <Text style={styles.valorLabel}>Despesa:</Text>
                    <Text style={[styles.valorTexto, { color: '#dc3545' }]}>
                      R$ {item.despesa.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                  </View>
                  <View style={styles.valorItem}>
                    <Text style={styles.valorLabel}>Fluxo:</Text>
                    <Text style={[
                      styles.valorTexto, 
                      styles.fluxoValor,
                      { color: isFluxoPositivo ? '#28a745' : '#dc3545' }
                    ]}>
                      R$ {item.fluxo_liquido.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                  </View>
                </View>
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
  resumoContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
  },
  resumoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  resumoLabel: {
    fontSize: 14,
    color: '#495057',
  },
  resumoValor: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  legendaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  legendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendaCor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendaTexto: {
    fontSize: 12,
    color: '#666',
  },
  detalhamentoItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  detalhamentoMes: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textTransform: 'capitalize',
  },
  detalhamentoValores: {
    gap: 5,
  },
  valorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valorLabel: {
    fontSize: 14,
    color: '#666',
  },
  valorTexto: {
    fontSize: 14,
    fontWeight: '500',
  },
  fluxoValor: {
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default FluxoCaixaPrevisto;