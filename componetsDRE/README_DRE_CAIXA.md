# DRE Caixa - Demonstrativo de Fluxo de Caixa

## Visão Geral

O DRE Caixa é um módulo que apresenta o demonstrativo de fluxo de caixa baseado em recebimentos e pagamentos efetivos, diferente do DRE Gerencial que trabalha por competência.

## Componentes Criados

### 1. DashDRECaixa.js
- **Função**: Componente principal que gerencia o estado e faz a chamada para a API
- **Endpoint**: `dre/dre-caixa/`
- **Parâmetros**: 
  - `data_ini`: Data inicial do período
  - `data_fim`: Data final do período
  - `empr`: ID da empresa (automático)
  - `fili`: ID da filial (automático)

### 2. DRECaixaCards.js
- **Função**: Exibe cards com os principais indicadores
- **Indicadores**:
  - Total Recebido
  - Total Despesas
  - Resultado Caixa
  - Variação Percentual

### 3. DRECaixaDemonstrativo.js
- **Função**: Apresenta o demonstrativo detalhado do fluxo de caixa
- **Seções**:
  - Entradas (Total Recebido)
  - Saídas (Total Despesas)
  - Resultado do Caixa
  - Análise do Fluxo de Caixa

## Estrutura dos Dados da API

A API retorna os seguintes campos:

```json
{
  "empresa": "ID da empresa",
  "filial": "ID da filial",
  "total_recebido": "Valor total recebido no período",
  "total_despesas": "Valor total de despesas pagas no período",
  "resultado_caixa": "Diferença entre recebido e despesas"
}
```

## Navegação

### Menu
- **Localização**: Financeiro > DRE Caixa
- **Ícone**: dollar-sign
- **Condição**: Módulo 'financeiro' habilitado

### Configuração de Tela
- **Nome**: DashDRECaixa
- **Título**: DRE Caixa
- **Header**: Configurado com headerOptions padrão

## Funcionalidades

### Seleção de Período
- Calendários para data inicial e final
- Formatação automática das datas
- Validação de datas inválidas

### Atualização de Dados
- Botão de refresh manual
- Atualização automática ao mudar empresa/filial
- Loading indicator durante carregamento

### Indicadores Calculados
- **Eficiência do Caixa**: (Resultado / Total Recebido) * 100
- **Cobertura de Despesas**: (Total Recebido / Total Despesas) * 100
- **Status do Caixa**: POSITIVO ou NEGATIVO
- **Variação %**: Percentual de variação entre recebimentos e despesas

## Diferenças do DRE Gerencial

| Aspecto | DRE Gerencial | DRE Caixa |
|---------|---------------|----------|
| Base | Competência | Caixa (Efetivo) |
| Receitas | Faturamento | Recebimentos |
| Despesas | Provisões | Pagamentos |
| Período | Quando ocorreu | Quando foi pago/recebido |
| Finalidade | Resultado contábil | Fluxo de caixa real |

## Estilização

Utiliza o mesmo arquivo de estilos (`DREStyles.js`) do DRE Gerencial para manter consistência visual.

## Tratamento de Erros

- Validação de empresa e filial obrigatórias
- Tratamento de respostas vazias da API
- Alertas informativos para o usuário
- Logs detalhados para debugging

## Como Usar

1. Acesse o menu Financeiro
2. Clique em "DRE Caixa"
3. Selecione o período desejado
4. Visualize os cards com indicadores principais
5. Analise o demonstrativo detalhado
6. Use o botão refresh para atualizar os dados

## Próximas Melhorias Sugeridas

- Exportação para PDF/Excel
- Comparativo entre períodos
- Gráficos de evolução do fluxo de caixa
- Filtros por centro de custo
- Projeções de fluxo futuro