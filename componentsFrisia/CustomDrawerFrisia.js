import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { MaterialIcons } from '@expo/vector-icons';
import { useContextoApp } from '../hooks/useContextoApp';
import MenuCategory from '../navigation/MenuCategory';
import MenuItem from '../navigation/MenuItem';
import { getFrisiaMenuItems } from '../navigation/menuConfig';

const CustomDrawerFrisia = (props) => {
  const { logout, hasModulo } = useContextoApp();

  const handleLogout = () => {
    Alert.alert(
      'Confirmar Logout',
      'Tem certeza que deseja sair?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          onPress: logout,
        },
      ],
      { cancelable: false }
    );
  };

  const frisiaMenuItems = getFrisiaMenuItems(hasModulo);

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollView}>
        <View style={styles.drawerContent}>
          {/* Header */}
          <View style={styles.userInfoSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>FR</Text>
            </View>
            <Text style={styles.title}>Frisia</Text>
          </View>

          {/* Menu Items */}
          <View style={styles.drawerSection}>
            {frisiaMenuItems.map((item, index) => (
              <MenuItem
                key={index}
                name={item.name}
                route={item.route}
                icon={item.icon}
                navigation={props.navigation}
                styles={styles}
                condition={item.condition}
              />
            ))}
          </View>
        </View>
      </DrawerContentScrollView>

      {/* Logout Button */}
      <View style={styles.bottomDrawerSection}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <MaterialIcons name="logout" size={22} color="#fff" />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50',
  },
  scrollView: {
    flexGrow: 1,
  },
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    paddingLeft: 20,
    paddingVertical: 20,
    borderBottomColor: '#34495e',
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  drawerSection: {
    marginTop: 15,
  },
  bottomDrawerSection: {
    marginBottom: 15,
    borderTopColor: '#34495e',
    borderTopWidth: 1,
    paddingTop: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#e74c3c',
    marginHorizontal: 10,
    borderRadius: 5,
  },
  logoutText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  menuSection: {
    marginVertical: 5,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#2c3e50',
    borderBottomWidth: 1,
    borderBottomColor: '#34495e',
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});

export default CustomDrawerFrisia;