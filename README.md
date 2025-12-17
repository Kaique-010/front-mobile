# SpsMobile - Front Mobile

Aplicativo móvel desenvolvido com React Native e Expo.

## 🚀 Pré-requisitos

Antes de começar, certifique-se de ter as seguintes ferramentas instaladas:

- **Node.js**: Versão 22 (Recomendado o uso do NVM para gerenciar versões).
  - [Baixar Node.js](https://nodejs.org/)
  - [NVM para Windows](https://github.com/coreybutler/nvm-windows)
- **Git**: Para versionamento de código.

### Configurando o Node.js com NVM

```bash
nvm install 22
nvm use 22
```

## 🛠️ Instalação e Execução

1. **Clone o repositório** (se ainda não o fez) e entre na pasta do projeto.

2. **Instale as dependências**:

   ```bash
   npm install
   ```

3. **Inicie o projeto**:
   ```bash
   npx expo start --clear
   ```
   > Utilize o aplicativo **Expo Go** no seu smartphone para escanear o QR Code gerado, ou pressione `a` para abrir no emulador Android / `i` para simulador iOS.

## 📱 Desenvolvimento

### Extensões Recomendadas (VS Code)

- **ESLint** & **Prettier**: Para padronização e formatação de código.
- **Expo Tools**: Ferramentas auxiliares para Expo.
- **React Native Tools**: Depuração e comandos.

### Criando uma Nova Tela

1. **Crie o componente** na pasta `screens` ou `components`.
2. **Exporte a tela** em `navigation/screenImports.js`:
   ```javascript
   export { default as MinhaNovaTela } from '../screens/MinhaNovaTela'
   ```
3. **Registre a rota** em `navigation/screenConfig.js`:
   ```javascript
   {
     name: 'MinhaNovaTela',
     component: Screens.MinhaNovaTela,
     options: createHeaderOptions('Título da Tela'),
   },
   ```
4. **Adicione ao Menu** (se necessário) em `navigation/menuConfig.js`:
   ```javascript
   {
     name: 'Nome no Menu',
     route: 'MinhaNovaTela',
     icon: 'nome-do-icone', // Feather ou MaterialIcons
     condition: hasModulo('NomeDoModulo'), // Opcional
   }
   ```

### Padrão de Componente

```javascript
import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { apiGetComContexto } from '../utils/api'

export default function MinhaNovaTela() {
  return (
    <View style={styles.container}>
      <Text>Conteúdo da Tela</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
})
```

## 📦 Build e Deploy (EAS)

Certifique-se de estar logado no EAS:

```bash
eas login
```

### Android

- **Gerar APK (Preview)** - Para testes internos:

  ```bash
  eas build -p android --profile preview
  ```

- **Gerar AAB (Produção)** - Para loja:
  ```bash
  eas build -p android --profile production
  ```

### iOS

- **Gerar Build de Produção**:

  ```bash
  eas build -p ios --profile production
  ```

- **Enviar para TestFlight/App Store**:
  ```bash
  eas submit -p ios --profile production
  ```

### Atualizações OTA (Over-the-Air)

Para atualizar apenas o código JavaScript sem gerar nova build nativa:

```bash
eas update
```

## 🔧 Solução de Problemas

- **Limpar cache do Expo**: `npx expo start --clear`
- **Verificar integridade do ambiente**: `npx expo doctor`
- **Verificar dependências**: `npm ls --depth=0`
- **Erro de permissões/instalação**: Tente `npx expo install --fix`
