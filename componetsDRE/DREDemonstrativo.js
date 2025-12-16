import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function DREDemonstrativo({ dados }) {
  // Debug: verificar dados recebidos
  console.log('🔍 DREDemonstrativo - dados recebidos:', dados)
  console.log('🔍 data_ini:', dados?.data_ini, 'tipo:', typeof dados?.data_ini)
  console.log('🔍 data_fim:', dados?.data_fim, 'tipo:', typeof dados?.data_fim)
  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(valor) || 0)
  }

  const formatarData = (data) => {
    console.log('📅 formatarData chamada com:', data, 'tipo:', typeof data)
    
    if (!data) {
      console.log('📅 Data é null/undefined')
      return 'Data não informada'
    }
    
    // Tenta diferentes formatos de data
    let date
    
    // Se já é um objeto Date
    if (data instanceof Date) {
      date = data
    } else if (typeof data === 'string') {
      // Remove possíveis caracteres extras e tenta parsear
      const cleanData = data.trim()
      
      // Formato ISO (YYYY-MM-DD)
      if (cleanData.match(/^\d{4}-\d{2}-\d{2}$/)) {
        date = new Date(cleanData + 'T00:00:00')
      } else {
        date = new Date(cleanData)
      }
    } else {
      date = new Date(data)
    }
    
    if (isNaN(date.getTime())) {
      console.log('⚠️ Data inválida recebida:', data)
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

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>
        📋 Demonstração do Resultado do Exercício
      </Text>

      <View style={styles.periodo}>
        <Text style={styles.periodoTexto}>
          Período: {formatarData(dados.data_ini)} a{' '}
          {formatarData(dados.data_fim)}
        </Text>
      </View>

      <View style={styles.demonstrativo}>
        {/* Receitas */}
        <LinhaItem
          label="RECEITA OPERACIONAL BRUTA"
          valor={dados.receita_bruta}
          destaque={true}
        />

        <LinhaItem
          label="(-) Deduções da Receita Bruta"
          valor={dados.deducoes}
          nivel={1}
          negativo={true}
        />

        <View style={styles.separador} />

        <LinhaItem
          label="RECEITA OPERACIONAL LÍQUIDA"
          valor={dados.receita_liquida}
          destaque={true}
        />

        {/* Custos */}
        <LinhaItem
          label="(-) Custo das Mercadorias Vendidas"
          valor={dados.cmv}
          nivel={1}
          negativo={true}
        />

        <View style={styles.separador} />

        <LinhaItem
          label="LUCRO BRUTO"
          valor={dados.lucro_bruto}
          destaque={true}
        />

        {/* Despesas */}
        <LinhaItem
          label="(-) Despesas Operacionais"
          valor={dados.total_despesas}
          nivel={1}
          negativo={true}
        />

        <View style={styles.separadorFinal} />

        <LinhaItem
          label="RESULTADO OPERACIONAL"
          valor={dados.resultado_operacional}
          destaque={true}
        />

        {/* Indicadores */}
        <View style={styles.indicadores}>
          <Text style={styles.indicadorTitulo}>
            📈 Indicadores de Performance
          </Text>

          <View style={styles.indicadorLinha}>
            <Text style={styles.indicadorLabel}>Margem Bruta:</Text>
            <Text style={styles.indicadorValor}>
              {((dados.lucro_bruto / dados.receita_liquida) * 100).toFixed(1)}%
            </Text>
          </View>

          <View style={styles.indicadorLinha}>
            <Text style={styles.indicadorLabel}>Margem Operacional:</Text>
            <Text
              style={[
                styles.indicadorValor,
                {
                  color:
                    dados.resultado_operacional >= 0 ? '#4CAF50' : '#F44336',
                },
              ]}>
              {(
                (dados.resultado_operacional / dados.receita_liquida) *
                100
              ).toFixed(1)}
              %
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
    textAlign: 'center',
    fontWeight: '600',
    color: '#1976d2',
  },
  demonstrativo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    alignItems: 'center',
  },
  linhaDestaque: {
    backgroundColor: '#f5f5f5',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  linhaLabel: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  labelDestaque: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  linhaValor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  valorNegativo: {
    color: '#F44336',
  },
  valorDestaque: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
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
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  indicadorTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  indicadorLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  indicadorLabel: {
    fontSize: 13,
    color: '#666',
  },
  indicadorValor: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
})
