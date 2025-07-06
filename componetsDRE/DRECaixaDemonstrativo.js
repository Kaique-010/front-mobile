import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function DRECaixaDemonstrativo({ dados }) {
  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(valor) || 0)
  }

  const formatarData = (data) => {
    if (!data) {
      return 'Data não informada'
    }
    
    let date
    
    if (data instanceof Date) {
      date = data
    } else if (typeof data === 'string') {
      const cleanData = data.trim()
      
      if (cleanData.match(/^\d{4}-\d{2}-\d{2}$/)) {
        date = new Date(cleanData + 'T00:00:00')
      } else {
        date = new Date(cleanData)
      }
    } else {
      date = new Date(data)
    }
    
    if (isNaN(date.getTime())) {
      return 'Data inválida'
    }
    
    return date.toLocaleDateString('pt-BR')
  }

  const LinhaItem = ({
    label,
    valor,
    nivel = 0,
    negativo = false,
    destaque = false,
  }) => (
    <View
      style={[
        styles.linha,
        { paddingLeft: 16 + nivel * 20 },
        destaque && styles.linhaDestaque,
      ]}>
      <Text style={[styles.linhaLabel, destaque && styles.labelDestaque]}>
        {label}
      </Text>
      <Text
        style={[
          styles.linhaValor,
          negativo && styles.valorNegativo,
          destaque && styles.valorDestaque,
        ]}>
        {negativo
          ? `(${formatarMoeda(Math.abs(valor))})`
          : formatarMoeda(valor)}
      </Text>
    </View>
  )

  const calcularMargem = (valor, base) => {
    if (!base || base === 0) return 0
    return ((valor / base) * 100).toFixed(1)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>
        💰 Demonstrativo de Fluxo de Caixa
      </Text>

      <View style={styles.periodo}>
        <Text style={styles.periodoTexto}>
          Período: {formatarData(dados.data_ini)} a{' '}
          {formatarData(dados.data_fim)}
        </Text>
      </View>

      <View style={styles.demonstrativo}>
        {/* Entradas */}
        <LinhaItem
          label="(+) TOTAL RECEBIDO"
          valor={dados.total_recebido || 0}
          destaque={true}
        />

        <View style={styles.separador} />

        {/* Saídas */}
        <LinhaItem
          label="(-) TOTAL DESPESAS"
          valor={dados.total_despesas || 0}
          negativo={true}
          destaque={true}
        />

        <View style={styles.separadorFinal} />

        {/* Resultado */}
        <LinhaItem
          label="RESULTADO DO CAIXA"
          valor={dados.resultado_caixa || 0}
          destaque={true}
        />

        {/* Indicadores */}
        <View style={styles.indicadores}>
          <Text style={styles.indicadorTitulo}>
            📊 Análise do Fluxo de Caixa
          </Text>

          <View style={styles.indicadorLinha}>
            <Text style={styles.indicadorLabel}>Eficiência do Caixa:</Text>
            <Text
              style={[
                styles.indicadorValor,
                {
                  color: dados.resultado_caixa >= 0 ? '#4CAF50' : '#F44336',
                },
              ]}>
              {dados.total_despesas > 0
                ? calcularMargem(dados.resultado_caixa, dados.total_recebido)
                : '0.0'}%
            </Text>
          </View>

          <View style={styles.indicadorLinha}>
            <Text style={styles.indicadorLabel}>Cobertura de Despesas:</Text>
            <Text
              style={[
                styles.indicadorValor,
                {
                  color:
                    dados.total_recebido >= dados.total_despesas
                      ? '#4CAF50'
                      : '#F44336',
                },
              ]}>
              {dados.total_despesas > 0
                ? calcularMargem(dados.total_recebido, dados.total_despesas)
                : '0.0'}%
            </Text>
          </View>

          <View style={styles.indicadorLinha}>
            <Text style={styles.indicadorLabel}>Status do Caixa:</Text>
            <Text
              style={[
                styles.indicadorValor,
                {
                  color: dados.resultado_caixa >= 0 ? '#4CAF50' : '#F44336',
                },
              ]}>
              {dados.resultado_caixa >= 0 ? 'POSITIVO' : 'NEGATIVO'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  periodo: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  periodoTexto: {
    fontSize: 14,
    color: '#1976d2',
    textAlign: 'center',
    fontWeight: '500',
  },
  demonstrativo: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  linhaDestaque: {
    backgroundColor: '#f5f5f5',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  linhaLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  labelDestaque: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  linhaValor: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textAlign: 'right',
  },
  valorNegativo: {
    color: '#F44336',
  },
  valorDestaque: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  separador: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  separadorFinal: {
    height: 2,
    backgroundColor: '#333',
    marginVertical: 12,
  },
  indicadores: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  indicadorTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  indicadorLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  indicadorLabel: {
    fontSize: 14,
    color: '#666',
  },
  indicadorValor: {
    fontSize: 14,
    fontWeight: 'bold',
  },
})