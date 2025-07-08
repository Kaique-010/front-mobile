import React, { memo } from 'react'
import {
  Box,
  Text,
  HStack,
  VStack,
  Avatar,
  Pressable,
  Badge,
} from 'native-base'

const ProdutoCard = memo(({ item, onPress }) => (
  <Pressable onPress={() => onPress(item)} _pressed={{ opacity: 0.7 }}>
    <Box
      bg="white"
      mx={4}
      my={2}
      p={4}
      borderRadius={12}
      shadow={2}
      borderWidth={1}
      borderColor="coolGray.100">
      <HStack space={4} alignItems="center">
        <Avatar
          size="60px"
          borderRadius={12}
          source={
            item.imagem_base64 && item.imagem_base64.trim() !== ''
              ? {
                  uri: item.imagem_base64.startsWith('data:')
                    ? item.imagem_base64
                    : `data:image/png;base64,${item.imagem_base64}`,
                }
              : require('../assets/logo.png')
          }
        />
        <VStack flex={1} space={1}>
          <Text
            fontSize="md"
            fontWeight="600"
            color="gray.800"
            numberOfLines={2}>
            {item.nome}
          </Text>
          <Text fontSize="sm" color="gray.500">
            {item.marca_nome || 'Sem marca'}
          </Text>
          <HStack justifyContent="space-between" alignItems="center" mt={1}>
            <Text fontSize="lg" fontWeight="bold" color="green.600">
              R$ {Number(item.preco_vista ?? 0).toFixed(2)}
            </Text>
            <Badge
              colorScheme={item.saldo > 0 ? 'success' : 'warning'}
              variant="subtle"
              borderRadius={6}>
              Saldo: {item.saldo}
            </Badge>
          </HStack>
        </VStack>
      </HStack>
    </Box>
  </Pressable>
))

export default ProdutoCard