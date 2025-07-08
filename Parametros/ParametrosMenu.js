import React from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { parametrosStyles } from './styles/parametrosStyles' 

export default function ParametrosMenu() {
  const navigation = useNavigation()

  const menuItems = [
    {
      title: 'Parâmetros Gerais',
      description: 'Configurações gerais do sistema',
      icon: '⚙️',
      route: 'ParametrosGeraisList',
      color: '#007bff'
    },
    {
      title: 'Permissões de Módulos',
      description: 'Controle de acesso aos módulos',
      icon: '🔐',
      route: 'PermissoesModulosList',
      color: '#28a745'
    },
    {
      title: 'Configuração de Estoque',
      description: 'Parâmetros de movimentação de estoque',
      icon: '📦',
      route: 'ConfiguracaoEstoqueForm',
      color: '#ffc107'
    },
    {
      title: 'Configuração Financeira',
      description: 'Parâmetros financeiros e de pagamento',
      icon: '💰',
      route: 'ConfiguracaoFinanceiroForm',
      color: '#17a2b8'
    },
    {
      title: 'Logs de Alterações',
      description: 'Histórico de modificações',
      icon: '📋',
      route: 'LogParametrosList',
      color: '#6c757d'
    }
  ]

  return (
    <ScrollView style={parametrosStyles.container}> {/* Usar parametrosStyles em vez de styles */}
      <View style={parametrosStyles.header}>
        <Text style={parametrosStyles.headerTitle}>Parâmetros Administrativos</Text>
        <Text style={parametrosStyles.headerSubtitle}>Gerencie as configurações do sistema</Text>
      </View>

      <View style={parametrosStyles.menuGrid}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[parametrosStyles.menuCard, { borderLeftColor: item.color }]}
            onPress={() => navigation.navigate(item.route)}
          >
            <View style={parametrosStyles.menuCardHeader}>
              <Text style={parametrosStyles.menuIcon}>{item.icon}</Text>
              <Text style={parametrosStyles.menuTitle}>{item.title}</Text>
            </View>
            <Text style={parametrosStyles.menuDescription}>{item.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}