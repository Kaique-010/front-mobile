import React from 'react'
import { Box, HStack } from 'native-base'
import { TextInput, TouchableOpacity, Text } from 'react-native'

const SearchBar = ({
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  isSearching,
}) => (
  <Box bg="white" px={4} py={3} shadow={1}>
    <HStack space={2} alignItems="center">
      <Box flex={1}>
        <TextInput
          placeholder="Buscar por código ou nome"
          placeholderTextColor="#777"
          style={{
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 16,
            backgroundColor: '#f9f9f9',
          }}
          value={searchTerm}
          onChangeText={onSearchChange}
          onSubmitEditing={onSearchSubmit}
        />
      </Box>
      <TouchableOpacity
        onPress={onSearchSubmit}
        style={{
          backgroundColor: '#007bff',
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 8,
        }}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          {isSearching ? '🔍...' : 'Buscar'}
        </Text>
      </TouchableOpacity>
    </HStack>
  </Box>
)

export default SearchBar
