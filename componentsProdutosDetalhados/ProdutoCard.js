import React, { memo } from 'react'
import {
  Box,
  Text,
  HStack,
  VStack,
  Avatar,
  Pressable,
  Badge,
  IconButton,
  Icon,
} from 'native-base'
import { Ionicons } from '@expo/vector-icons'

const ProdutoCard = memo(({ item, onPress, quantity, onQuantityChange }) => (
  <Pressable onPress={() => onPress(item)} _pressed={{ opacity: 0.7 }}>
    <Box
      bg="#fffdfb"
      mx={4}
      my={2}
      p={4}
      borderRadius={16}
      shadow={3}
      borderWidth={1}
      borderColor="#f1e9d7">
      <HStack space={4} alignItems="center">
        <Avatar
          size="64px"
          borderRadius={12}
          bg="#f9f4ee"
          source={
            item.imagem_base64 && item.imagem_base64.trim() !== ''
              ? {
                  uri: item.imagem_base64.startsWith('data:')
                    ? item.imagem_base64
                    : `data:image/png;base64,${item.imagem_base64}`,
                }
              : item.prod_url && item.prod_url.trim() !== ''
                ? { uri: item.prod_url.trim() }
                : require('../assets/logo.png')
          }
        />
        <VStack flex={1} space={1}>
          <Text
            fontSize="md"
            fontWeight="bold"
            color="gray.800"
            numberOfLines={2}>
            {item.nome}
          </Text>
          <Text fontSize="sm" color="gray.400" italic>
            {item.marca_nome || 'Sem marca'}
          </Text>
          <HStack justifyContent="space-between" alignItems="center" mt={1}>
            <Text fontSize="lg" fontWeight="bold" color="#CFA96E">
              R$ {Number(item.preco_vista ?? 0).toFixed(2)}
            </Text>
            <Badge
              bg={item.saldo > 0 ? '#d7f0ce' : '#fff1c2'}
              _text={{
                color: item.saldo > 0 ? '#276749' : '#8a6d3b',
                fontSize: 12,
              }}
              borderRadius={8}
              px={2}
              py={1}>
              Saldo: {item.saldo}
            </Badge>
          </HStack>

          {onQuantityChange && (
            <HStack
              justifyContent="flex-end"
              alignItems="center"
              mt={2}
              space={3}>
              <IconButton
                icon={<Icon as={Ionicons} name="remove" size="sm" />}
                borderRadius="full"
                bg="gray.200"
                _pressed={{ bg: 'gray.300' }}
                onPress={() => {
                  if (quantity > 1) onQuantityChange(quantity - 1)
                }}
                size="sm"
              />
              <Text fontSize="md" fontWeight="bold">
                {quantity}
              </Text>
              <IconButton
                icon={<Icon as={Ionicons} name="add" size="sm" />}
                borderRadius="full"
                bg="#10a2a7"
                _icon={{ color: 'white' }}
                _pressed={{ bg: '#0e8c91' }}
                onPress={() => onQuantityChange(quantity + 1)}
                size="sm"
              />
            </HStack>
          )}
        </VStack>
      </HStack>
    </Box>
  </Pressable>
))

export default ProdutoCard
