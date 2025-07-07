# Módulo Gerencial - Análises Preditivas

Este módulo contém as telas para análises preditivas financeiras.

## Componentes Criados

### 1. DespesasPrevistas.js

- Análise preditiva de despesas usando regressão linear
- Gráfico de evolução das despesas
- Previsões para os próximos 6 meses
- Endpoint: `/gerencial/financeiro/despesas-previstas/`

### 2. LucroPrevisto.js

- Previsão de lucro baseada em dados históricos
- Análise de tendência (crescimento/queda)
- Visualização gráfica da evolução
- Endpoint: `/gerencial/financeiro/lucro-previsto/`

### 3. FluxoCaixaPrevisto.js

- Análise completa do fluxo de caixa
- Combina receitas e despesas previstas
- Detalhamento mensal com resumo
- Gráfico com múltiplas linhas (receita, despesa, fluxo líquido)
- Endpoint: `/gerencial/financeiro/fluxo-previsto/`

### Views (financeiro.py)

- `DespesasPrevistasView`
- `LucroPrevistoView`
- `FluxoCaixaPrevistoView`

### Serviços (preditivo.py)

- `gerar_previsao_linear()` - Função de regressão linear

### URLs (urls.py)

- Rotas já configuradas para as 3 APIs

## Integração no Projeto Principal

Para integrar este módulo no projeto Django principal, adicione no arquivo `urls.py` principal:

```python
from django.urls import path, include

urlpatterns = [
    # ... outras URLs
    path('gerencial/', include('Gerencial.urls')),
]
```

E no `settings.py`, adicione na `INSTALLED_APPS`:

```python
INSTALLED_APPS = [
    # ... outras apps
    'Gerencial',
]
```

## Dependências

### Backend

- pandas
- scikit-learn
- numpy
- Django REST Framework

### Frontend

- react-native-chart-kit
- react-native-paper
- react-native-svg (dependência do chart-kit)

## Menu

O menu "Gerencial" foi adicionado ao `menuConfig.js` com:

- Análise de Despesas
- Previsão de Lucro
- Fluxo de Caixa Previsto

Todas as telas foram registradas no sistema de navegação.

## Funcionalidades

- **Análise Preditiva**: Usa regressão linear para prever valores futuros
- **Visualização Gráfica**: Gráficos interativos com react-native-chart-kit
- **Filtros por Período**: Data inicial e final configuráveis
- **Múltiplas Empresas/Filiais**: Suporte ao sistema multi-tenant
- **Tratamento de Erros**: Validações e mensagens de erro apropriadas
- **Loading States**: Indicadores de carregamento durante as requisições

## Parâmetros das APIs

Todas as APIs esperam os seguintes parâmetros via GET:

- `empr`: Código da empresa
- `fili`: Código da filial
- `data_ini`: Data inicial (YYYY-MM-DD)
- `data_fim`: Data final (YYYY-MM-DD)

## Estrutura de Resposta

```json
{
  "historico": [{ "mes": "2024-01", "valor": 15000.0 }],
  "previsao": [{ "mes": "2024-07", "valor": 16500.0 }],
  "modelo": "regressao_linear",
  "erro_medio": 1250.5
}
```

Para FluxoCaixaPrevisto, a resposta inclui também:

```json
{
  "fluxo_caixa_previsto": [
    {
      "mes": "2024-07",
      "receita": 25000.0,
      "despesa": 18000.0,
      "fluxo_liquido": 7000.0
    }
  ],
  "erro_medio_receita": 1200.0,
  "erro_medio_despesa": 800.0
}
```
