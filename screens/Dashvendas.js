import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const Dashvendas = ({ navigation }) => {
  const dashboardOptions = [
    {
      title: 'Dashboard de Contratos',
      description: 'Visualize informações sobre contratos',
      icon: 'file-text',
      route: 'Dashboard de Contratos',
      color: '#3498db',
    },
    {
      title: 'Extrato de Caixa',
      description: 'Acompanhe movimentações do caixa',
      icon: 'credit-card',
      route: 'DashExtratoCaixa',
      color: '#2ecc71',
    },
  ];

  const navigateTo = (route) => {
    navigation.navigate(route);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard de Vendas</Text>
        <Text style={styles.subtitle}>Escolha o dashboard que deseja visualizar</Text>
      </View>

      <View style={styles.dashboardGrid}>
        {dashboardOptions.map((dashboard, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.dashboardCard, { borderLeftColor: dashboard.color }]}
            onPress={() => navigateTo(dashboard.route)}
          >
            <View style={styles.cardHeader}>
              <MaterialIcons
                name={dashboard.icon}
                size={24}
                color={dashboard.color}
              />
              <Text style={styles.cardTitle}>{dashboard.title}</Text>
            </View>
            <Text style={styles.cardDescription}>{dashboard.description}</Text>
            <View style={styles.cardFooter}>
              <Text style={[styles.accessText, { color: dashboard.color }]}>
                Acessar →
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  dashboardGrid: {
    padding: 20,
  },
  dashboardCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 10,
    flex: 1,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 15,
    lineHeight: 20,
  },
  cardFooter: {
    alignItems: 'flex-end',
  },
  accessText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Dashvendas;