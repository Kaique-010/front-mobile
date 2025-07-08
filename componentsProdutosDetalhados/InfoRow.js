import React from 'react'
import { HStack, Text } from 'native-base'

const InfoRow = ({ label, value, color = 'gray.700' }) => (
  <HStack justifyContent="space-between" alignItems="center" py={2}>
    <Text fontSize="sm" color="gray.500" fontWeight="500">
      {label}
    </Text>
    <Text
      fontSize="sm"
      color={color}
      fontWeight="600"
      textAlign="right"
      flex={1}
      ml={2}>
      {value}
    </Text>
  </HStack>
)

export default InfoRow