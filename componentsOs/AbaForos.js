import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Alert,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker' // ou sua lib preferida

export default function AbaFotos({ fotos, setFotos }) {
  const adicionarFoto = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (permissionResult.granted === false) {
      Alert.alert(
        'Permissão negada',
        'Você precisa permitir o acesso às fotos.'
      )
      return
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: false,
    })

    if (!pickerResult.cancelled) {
      setFotos((old) => [...old, { id: Date.now(), uri: pickerResult.uri }])
    }
  }

  const removerFoto = (id) => {
    setFotos((old) => old.filter((f) => f.id !== id))
  }

  const renderItem = ({ item }) => (
    <View style={styles.fotoContainer}>
      <Image source={{ uri: item.uri }} style={styles.foto} />
      <TouchableOpacity
        style={styles.btnRemover}
        onPress={() => removerFoto(item.id)}>
        <Text style={{ color: 'white' }}>X</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <FlatList
        data={fotos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        horizontal
        ListEmptyComponent={
          <Text style={{ color: 'white', textAlign: 'center', marginTop: 20 }}>
            Nenhuma foto adicionada
          </Text>
        }
      />

      <TouchableOpacity style={styles.botaoAdicionar} onPress={adicionarFoto}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          Adicionar Foto
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  fotoContainer: {
    marginRight: 10,
    position: 'relative',
  },
  foto: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  btnRemover: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255,0,0,0.7)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoAdicionar: {
    marginTop: 10,
    backgroundColor: '#10a2a7',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
})
