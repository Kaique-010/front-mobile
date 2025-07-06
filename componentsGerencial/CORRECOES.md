# Correções Aplicadas ao Módulo Gerencial

## Problemas Identificados e Soluções

### 1. Erro 400 - Parâmetros Obrigatórios Faltando

**Problema:** As views do backend estavam esperando os parâmetros `empr` e `fili` apenas na query string, mas o sistema frontend envia esses dados nos headers HTTP (`X-Empresa` e `X-Filial`).

**Solução:** Modificadas todas as views em `Gerencial/Views/financeiro.py` para aceitar os parâmetros tanto da query string quanto dos headers:

```python
# Antes
empresa = request.GET.get("empr")
filial = request.GET.get("fili")

# Depois
empresa = request.GET.get("empr") or request.META.get('HTTP_X_EMPRESA')
filial = request.GET.get("fili") or request.META.get('HTTP_X_FILIAL')
```

### 2. Erro 500 - Import Incorreto

**Problema:** Import incorreto do serviço preditivo na `FluxoCaixaPrevistoView`:

```python
# Antes (incorreto)
from gerencial.services.preditivo import gerar_previsao_linear

# Depois (correto)
from Gerencial.services.preditivo import gerar_previsao_linear
```

### 3. Dependências Frontend

**Problema:** Componentes estavam usando `react-native-elements` que não estava instalado.

**Solução:** Substituído por `react-native-paper` que já estava disponível no projeto.

## Como Testar

### 1. Verificar Backend Django

Certifique-se de que o backend Django está configurado corretamente:

1. **INSTALLED_APPS** no `settings.py`:
```python
INSTALLED_APPS = [
    # ... outras apps
    'rest_framework',
    'Gerencial',
]
```

2. **URLs** no arquivo principal `urls.py`:
```python
urlpatterns = [
    # ... outras URLs
    path('gerencial/', include('Gerencial.urls')),
]
```

3. **Dependências Python** instaladas:
```bash
pip install pandas scikit-learn numpy djangorestframework
```

### 2. Testar APIs Diretamente

Teste as APIs usando curl ou Postman:

```bash
# Teste com headers
curl -X GET "http://192.168.0.39:8000/gerencial/financeiro/despesas-previstas/?data_ini=2024-01-01&data_fim=2024-12-31" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "X-Empresa: 1" \
  -H "X-Filial: 1"

# Teste com parâmetros na URL
curl -X GET "http://192.168.0.39:8000/gerencial/financeiro/despesas-previstas/?empr=1&fili=1&data_ini=2024-01-01&data_fim=2024-12-31" \
  -H "Authorization: Bearer SEU_TOKEN"
```

### 3. Verificar Dados no Banco

Certifique-se de que existem dados nas tabelas necessárias:

- Tabelas de despesas/receitas com campos de data e valor
- Dados suficientes (pelo menos 3 registros) para gerar previsões
- Campos de empresa e filial preenchidos corretamente

### 4. Logs de Debug

Para debugar problemas:

1. **Frontend:** Verifique o console do React Native para logs de erro
2. **Backend:** Adicione logs nas views para verificar os parâmetros recebidos:

```python
print(f"Empresa: {empresa}, Filial: {filial}")
print(f"Headers: {request.META}")
print(f"Query params: {request.GET}")
```

## URLs das APIs

As seguintes URLs devem estar funcionando:

- `GET /gerencial/financeiro/despesas-previstas/`
- `GET /gerencial/financeiro/lucro-previsto/`
- `GET /gerencial/financeiro/fluxo-previsto/`

## Parâmetros Obrigatórios

- `data_ini`: Data inicial (formato: YYYY-MM-DD)
- `data_fim`: Data final (formato: YYYY-MM-DD)
- `empresa`: ID da empresa (via header X-Empresa ou parâmetro empr)
- `filial`: ID da filial (via header X-Filial ou parâmetro fili)

## Estrutura de Resposta Esperada

```json
{
  "historico": [
    {"mes": "2024-01", "valor": 1000.00},
    {"mes": "2024-02", "valor": 1100.00}
  ],
  "previsao": [
    {"mes": "2024-07", "valor": 1200.00},
    {"mes": "2024-08", "valor": 1250.00}
  ],
  "modelo": "regressao_linear",
  "erro_medio": 50.25
}
```