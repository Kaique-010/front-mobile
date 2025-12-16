import React from 'react'
import { Modal, TouchableOpacity, ScrollView, View, Image } from 'react-native'
import { Text, VStack, Divider, HStack } from 'native-base'
import InfoRow from './InfoRow'
import Feather from '@expo/vector-icons/Feather'

const ProdutoModal = ({ produto, visible, onClose }) => {
  if (!produto) return null

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
        <View
          style={{
            backgroundColor: '#fffdfb',
            borderRadius: 20,
            maxHeight: '90%',
            width: '100%',
            maxWidth: 400,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 5,
          }}>
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 16,
              backgroundColor: '#f9f4ee',
              borderBottomWidth: 1,
              borderBottomColor: '#e5dacb',
            }}>
            <HStack alignItems="center" space={2} flex={1}>
              <Feather name="box" size={20} color="#A17438" />
              <Text
                numberOfLines={2}
                fontSize="lg"
                fontWeight="bold"
                color="#444">
                {produto?.nome}
              </Text>
            </HStack>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Body */}
          <ScrollView
            style={{ paddingHorizontal: 20 }}
            contentContainerStyle={{ paddingVertical: 20 }}
            showsVerticalScrollIndicator={false}>
            {/* Imagem */}
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Image
                source={
                  produto?.imagem_base64
                    ? {
                        uri: produto.imagem_base64.startsWith('data:')
                          ? produto.imagem_base64
                          : `data:image/png;base64,${produto.imagem_base64}`,
                      }
                    : require('../assets/logo.png')
                }
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: 16,
                  backgroundColor: '#f1e9d7',
                  borderWidth: 1,
                  borderColor: '#ddd',
                }}
                resizeMode="cover"
              />
            </View>

            {/* Informações básicas */}
            <VStack space={2}>
              <HStack space={1} alignItems="center" mb={1}>
                <Feather name="tag" size={18} color="#A17438" />
                <Text fontSize="md" fontWeight="bold" color="#A17438">
                  Informações Básicas
                </Text>
              </HStack>
              <InfoRow label="Código" value={produto?.codigo || '-'} />
              <InfoRow
                label="Marca"
                value={produto?.marca_nome || 'Sem marca'}
              />
              <InfoRow label="Grupo" value={produto?.grupo_nome || '-'} />
              <InfoRow label="Unidade" value={produto?.unidade || '-'} />
              <InfoRow
                label="Saldo em Estoque"
                value={produto?.saldo || '0'}
                color={produto?.saldo > 0 ? 'green.600' : 'red.500'}
              />
            </VStack>

            <Divider my={4} />

            {/* Preços */}
            <VStack space={2}>
              <HStack space={1} alignItems="center" mb={1}>
                <Feather name="dollar-sign" size={18} color="#A17438" />
                <Text fontSize="md" fontWeight="bold" color="#A17438">
                  Valores e Preços
                </Text>
              </HStack>
              <InfoRow
                label="Custo Unitário"
                value={`R$ ${Number(produto?.custo ?? 0).toFixed(2)}`}
                color="orange.600"
              />
              <InfoRow
                label="Preço à Vista"
                value={`R$ ${Number(produto?.preco_vista ?? 0).toFixed(2)}`}
                color="green.600"
              />
              <InfoRow
                label="Preço a Prazo"
                value={`R$ ${Number(produto?.preco_prazo ?? 0).toFixed(2)}`}
                color="blue.600"
              />
            </VStack>

            <Divider my={4} />

            {/* Localização */}
            <VStack space={2}>
              <HStack space={1} alignItems="center" mb={1}>
                <Feather name="map-pin" size={18} color="#A17438" />
                <Text fontSize="md" fontWeight="bold" color="#A17438">
                  Localização e Origem
                </Text>
              </HStack>
              <InfoRow label="Empresa" value={produto?.empresa || '-'} />
              <InfoRow label="Filial" value={produto?.filial || '-'} />
            </VStack>
            <Divider my={4} />

            {/* Pesos Liquido e Bruto */}
            <VStack space={2}>
              <HStack space={1} alignItems="center" mb={1}>
                <Feather name="truck" size={18} color="#A17438" />
                <Text fontSize="md" fontWeight="bold" color="#A17438">
                  Pesos Liquido e Bruto
                </Text>
              </HStack>
              <InfoRow
                label="Peso Líquido"
                value={produto?.peso_liquido || '-'}
              />
              <InfoRow label="Peso Bruto" value={produto?.peso_bruto || '-'} />
            </VStack>
          </ScrollView>

          {/* Footer */}
          <View
            style={{
              padding: 16,
              borderTopWidth: 1,
              borderTopColor: '#eee',
              backgroundColor: '#fff',
            }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                backgroundColor: '#CFA96E',
                paddingVertical: 12,
                borderRadius: 10,
                alignItems: 'center',
              }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                Fechar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default ProdutoModal
