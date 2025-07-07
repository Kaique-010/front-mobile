# Módulo Ordem de Produção - Interface Moderna para Joalherias

Este módulo contém as telas modernas para gestão de ordens de produção específicas para joalherias.

## Componentes Criados

### 1. ListagemOrdensProducao.js

- Listagem moderna com cards visuais
- Filtros por tipo de ordem e status
- Busca por número, cliente, etc.
- Indicadores visuais para fotos, materiais e etapas
- Pull-to-refresh
- FAB para criar nova ordem

### 2. DetalhesOrdemProducao.js

- Visualização completa da ordem
- Tabs para organizar informações (Detalhes, Fotos, Materiais, Etapas)
- Layout específico para joalherias
- Ações contextuais

### 3. FormOrdemProducao.js

- Formulário completo para criar/editar ordens
- Validação de campos obrigatórios
- Seleção de data com DatePicker
- Switches para opções booleanas
- Suporte a todos os campos do modelo

## Funcionalidades Específicas para Joalherias

- **Tipos de Ordem**: Confecção, Conserto, Orçamento, Conserto Relógio
- **Gestão de Materiais**: Controle de gramatura, medidas específicas
- **Fotos**: Antes e depois dos trabalhos
- **Etapas**: Controle do processo produtivo
- **Garantia**: Controle específico para joias

## Endpoints Utilizados

- `GET /ordem-producao/ordens/` - Listagem
- `GET /ordem-producao/ordens/{id}/` - Detalhes
- `POST /ordem-producao/ordens/` - Criar
- `PUT /ordem-producao/ordens/{id}/` - Atualizar
- `DELETE /ordem-producao/ordens/{id}/` - Excluir
- `GET /ordem-producao/ordens/dashboard/` - Dashboard
- `POST /ordem-producao/ordens/{id}/iniciar_producao/` - Iniciar produção
- `POST /ordem-producao/ordens/{id}/finalizar_ordem/` - Finalizar ordem

## Integração

Para integrar no projeto principal, adicione as rotas no sistema de navegação e importe os componentes conforme necessário.