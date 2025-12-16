import React from 'react'
import { Box, Text } from 'native-base'

const ProductCounter = ({ count }) => (
  <Box
    bg="white"
    px={4}
    py={2}
    borderTopWidth={1}
    borderTopColor="gray.100">
    <Text textAlign="center" color="gray.500" fontSize="sm">
      {count} produto{count !== 1 ? 's' : ''} encontrado
      {count !== 1 ? 's' : ''}
    </Text>
  </Box>
)

export default ProductCounter