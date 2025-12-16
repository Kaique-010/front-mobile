### Pra rodar o app localmente com Expo:

Primeiro de tudo Instalar o node.js com o version manager, para facilitar a instalação e o gerenciamento de versões
Node.js: https://nodejs.org/en/download
Version Manager: https://github.com/coreybutler/nvm-windows

tem que ser a versão 22 do node.js
Instalar o version manager:
nvm install 18.16.0
nvm use 18.16.0
Node.js: 18.16.0

já na pasta do projeto:

1. Instalar o expo-cli: `npm install -g expo-cli`
2. Instalar as dependências: `npm install`
3. Rodar o projeto: npm start --clear
4. Scanear o QR code com o aplicativo da Expo Go no seu smartphone.
5. Extensões que podem ser uteis, prittier ajuda a formatar os códigos java script e typescript, e o eslint ajuda a identificar erros no código, e o prettier e o eslint podem ser configurados para rodar automaticamente quando salvar o arquivo.
6. Extensões que podem ser uteis, como o react native snippets, que ajuda a criar os componentes react native, e o react native debugger, que ajuda a debugar o código react native.
7. Extensões que podem ser uteis, como o react native tools, que ajuda a identificar erros no código, e o react native debugger, que ajuda a debugar o código react native.
8. Extensões que podem ser uteis, como o react native community, que ajuda a identificar erros no código, e o react native debugger, que ajuda a debugar o código react native.

## criando uma screen nova

1. Criar o arquivo na pasta screens ou componentizar como os outros
2. registrar em navigation -> screenImports.js

exemplo:

// Telas de Cliente
export { default as ClientePedidosList } from '../componentsClients/ClientePedidosList'

3. importar a screen no arquivo de navigation -> screenConfig

// ... Telas de Cliente
{
name: 'ClientePedidosList',
component: Screens.ClientePedidosList,
options: createHeaderOptions('Meus Pedidos'),
},

4. adicionar a screen no arquivo de navigation -> menuConfig

financeiro: {
name: 'Financeiro',
icon: 'dollar-sign',
items: [
{
name: 'Caixa',
route: 'CaixaGeral',
icon: 'credit-card',
condition: hasModulo('Financeiro'),
},
]},

o padrão das criações é importar as dependencias no react native
import React, { useState, useEffect, useCallback, onRefresh } from 'react'
import { useFocusEffect } from '@react-navigation/native'

import {
View,
Text,
FlatList,
TouchableOpacity,
Alert,
RefreshControl,
Modal,
StyleSheet,
TextInput,
Picker,
} from 'react-native'
import Toast from 'react-native-toast-message'
import { MaterialIcons, Feather } from '@expo/vector-icons'
import { apiGetComContexto, apiDeleteComContexto } from '../utils/api'

com esses imports já é possivel inserir as views que são necessarias para a tela, basicamente são conteiners que incluen os outros componentes
Text - é o componente react de Texto
TextInput - é o componente react de Input de Texto
Picker - é o componente react de Picker
FlatList - é o componente react de Lista
TouchableOpacity - é o componente react de Botão
Modal - é o componente react de Modal
StyleSheet - é o componente react de Estilo
Toast - é o componente react de Toast
MaterialIcons - é o componente react de Icones
Feather - é o componente react de Icones
apiGetComContexto - é a função que chama a api com o contexto do usuário, sempre usar o contexto do usuário, para passar Empresa, filial e usuario
e principalmente o slug das empresas, para saber qual empresa está logada
apiDeleteComContexto - é a função que chama a api com o contexto do usuário
useState - é o hook react de estado, que altera o estado da tela
useEffect - é o hook react de efeito, que é executado quando o componente é montado
useCallback - é o hook react de callback, que é executado quando o estado do hook é alterado
onRefresh - é o hook react de refresh, que é executado quando o usuário arrasta a tela para baixo

### Aplicação mobile para android

# Simular ambiente de produção

expo start --no-dev --minify

npm ls --depth=0
npx expo doctor

expo start --dev-client

# Gerar APK

eas build -p android --profile preview

Para rodar o apk da aplicação geramos o comando eas build -p android --profile preview

e para gerar o aab
eas build --platform android --profile production

## deploy na apple com o eas

e depois pra produção é

eas build -p ios --profile production

e enviar ele para o IPO em:
eas submit -p ios --profile production
eas build -p ios --profile production --auto-submit

## Em caso de erros

npx expo install --fix

para verificar o usuario logado no eas
eas login
eas whoami

## Sempre verificar se as versões estão batendo em

npx expo config | Select-String "version|buildNumber|versionCode"

E quando for só código js sem alterar as bibliotecas roda apenas o eas update assim atualiza o app
