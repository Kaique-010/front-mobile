import React from 'react'
import { Box, Text, Spinner } from 'native-base'

const LoadingScreen = () => (
  <Box flex={1} justifyContent="center" alignItems="center" bg="gray.50">
    <Spinner size="lg" color="blue.500" />
    <Text mt={4} color="gray.500" fontSize="md">
      Carregando produtos...
    </Text>
  </Box>
)

export default LoadingScreen