import React from 'react'
import { Text, VStack, Divider } from 'native-base'
import {
  Modal,
  TouchableOpacity,
  ScrollView,
  View,
  Image,
} from 'react-native'
import InfoRow from './InfoRow'

const ProdutoModal = ({ produto, visible, onClose }) => {
  if (!produto) return null

  return (
    <Modal
      visible={visible}
      animationType="slide"
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
            backgroundColor: 'white',
            borderRadius: 16,
            maxHeight: '90%',
            width: '100%',
            maxWidth: 400,
            overflow: 'hidden',
          }}>
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#eee',
              backgroundColor: '#fff',
            }}>
            <Text
              numberOfLines={2}
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: '#333',
                flex: 1,
              }}>
              {produto?.nome}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text
                style={{ fontSize: 24, fontWeight: 'bold', color: '#999' }}>
                ×
              </Text>
            </TouchableOpacity>
          </View>

          {/* Scrollable Body */}
          <ScrollView
            style={{ paddingHorizontal: 20 }}
            contentContainerStyle={{ paddingVertical: 20 }}
            showsVerticalScrollIndicator={false}>
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
                  width: 120,
                  height: 120,
                  borderRadius: 12,
                  backgroundColor: '#f0f0f0',
                }}
                resizeMode="cover"
              />
            </View>

            {/* Informações básicas */}
            <VStack space={1}>
              <Text fontSize="md" fontWeight="bold" color="gray.800" mb={2}>
                Informações Básicas
              </Text>
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
            <VStack space={1}>
              <Text fontSize="md" fontWeight="bold" color="gray.800" mb={2}>
                Valores e Preços
              </Text>
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
            <VStack space={1}>
              <Text fontSize="md" fontWeight="bold" color="gray.800" mb={2}>
                Localização e Origem
              </Text>
              <InfoRow label="Empresa" value={produto?.empresa || '-'} />
              <InfoRow label="Filial" value={produto?.filial || '-'} />
            </VStack>
          </ScrollView>

          {/* Footer Fixo */}
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
                backgroundColor: '#007bff',
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center',
              }}>
              <Text
                style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
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