#### `config/toastConfig.js`

- Configuração centralizada do Toast
- Estilos padronizados para success, error e warning

#### `config/headerConfig.js`

- Configuração padrão de headers
- Função helper `createHeaderOptions()` para reutilização

### 2. Navegação Modular

#### `navigation/screenImports.js`

- Centraliza todos os imports das telas
- Organizado por categorias (autenticação, vendas, financeiro, etc.)
- Facilita adição/remoção de telas

#### `navigation/screenConfig.js`

- Array de configuração de todas as telas
- Mapeia nome, componente e opções
- Estrutura declarativa e fácil de manter

#### `navigation/MainStackNavigator.js`

- Stack Navigator isolado
- Renderização dinâmica baseada em `screenConfig`
- Componente reutilizável

### 3. Componentes Extraídos

#### `components/NotificationOverlay.js`

- Lógica de notificações isolada
- Estado próprio para controle de visibilidade
- Componente reutilizável

### 4. App.js Simplificado

Agora com apenas ~20 linhas:

- Imports mínimos
- Estrutura limpa
- Foco na composição de componentes

## Como Adicionar Nova Tela

1. Adicionar import em `navigation/screenImports.js`
2. Adicionar configuração em `navigation/screenConfig.js`
3. Pronto! A tela será automaticamente incluída no navigator
