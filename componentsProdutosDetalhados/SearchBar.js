import React from 'react'
import { Box, HStack, VStack, Text } from 'native-base'
import { TextInput, TouchableOpacity } from 'react-native'
import { Select, CheckIcon } from 'native-base'

const SearchBar = ({
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  isSearching,
  marcaSelecionada,
  onMarcaChange,
  saldoFiltro,
  onSaldoChange,
  marcas = [],
}) => (
  <Box bg="#fefefe" px={4} py={4} shadow={3} borderRadius={12}>
    <VStack space={3}>
      {/* Campo de busca */}
      <HStack space={2} alignItems="center">
        <Box flex={1}>
          <TextInput
            placeholder="🔍 Buscar por nome ou código"
            placeholderTextColor="#999"
            style={{
              borderWidth: 1,
              borderColor: '#d9d9d9',
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 10,
              fontSize: 16,
              fontWeight: '500',
              backgroundColor: '#f8f8f8',
              color: '#333',
            }}
            value={searchTerm}
            onChangeText={onSearchChange}
            onSubmitEditing={onSearchSubmit}
          />
        </Box>
        <TouchableOpacity
          onPress={onSearchSubmit}
          style={{
            backgroundColor: '#CFA96E',
            paddingHorizontal: 18,
            paddingVertical: 10,
            borderRadius: 10,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          }}>
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
            {isSearching ? '...' : 'Buscar'}
          </Text>
        </TouchableOpacity>
      </HStack>

      {/* Filtros */}
      <HStack space={2} justifyContent="space-between">
        {/* Filtro de Marca */}
        <VStack flex={1} space={1}>
          <Text style={{ fontSize: 14, color: '#333', fontWeight: '600' }}>
            Filtrar por marca:
          </Text>
          <Select
            selectedValue={marcaSelecionada}
            onValueChange={onMarcaChange}
            placeholder="Filtrar por marca"
            fontSize="md"
            borderRadius={10}
            bg="#f9f9f9"
            _selectedItem={{
              bg: 'amber.100',
              endIcon: <CheckIcon size={4} />,
            }}>
            <Select.Item label="Todas" value="" />
            {marcas.map((marca) => (
              <Select.Item
                key={marca}
                label={marca}
                value={marca === 'Sem marca' ? '__sem_marca__' : marca}
              />
            ))}
          </Select>
        </VStack>

        {/* Filtro de Estoque */}
        <VStack flex={1} space={1}>
          <Text style={{ fontSize: 14, color: '#333', fontWeight: '600' }}>
            Filtrar por estoque:
          </Text>
          <Select
            selectedValue={saldoFiltro}
            onValueChange={onSaldoChange}
            placeholder="Filtrar estoque"
            fontSize="md"
            borderRadius={10}
            bg="#f9f9f9"
            _selectedItem={{
              bg: 'amber.100',
              endIcon: <CheckIcon size={4} />,
            }}>
            <Select.Item label="Todos" value="todos" />
            <Select.Item label="Com saldo" value="com" />
            <Select.Item label="Sem saldo" value="sem" />
          </Select>
        </VStack>
      </HStack>
    </VStack>
  </Box>
)

export default SearchBar
