# Instruções de Instalação - Módulo Gerencial

## Frontend (React Native)

Todas as dependências necessárias já estão instaladas no projeto:
- ✅ react-native-chart-kit
- ✅ react-native-paper
- ✅ react-native-svg
- ✅ axios

## Backend (Django)

Para o backend funcionar corretamente, instale as seguintes dependências Python:

```bash
pip install pandas scikit-learn numpy djangorestframework
```

Ou adicione ao seu `requirements.txt`:

```
pandas>=1.5.0
scikit-learn>=1.2.0
numpy>=1.24.0
djangorestframework>=3.14.0
```

## Configuração do Django

### 1. Adicionar ao INSTALLED_APPS

No arquivo `settings.py` do seu projeto Django principal:

```python
INSTALLED_APPS = [
    # ... outras apps
    'rest_framework',
    'Gerencial',
]
```

### 2. Incluir URLs

No arquivo `urls.py` principal do projeto Django:

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # ... outras URLs
    path('gerencial/', include('Gerencial.urls')),
]
```

### 3. Configurar CORS (se necessário)

Se você estiver usando CORS, adicione as rotas do módulo gerencial:

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # ... outros domínios
]

CORS_ALLOW_ALL_ORIGINS = True  # Apenas para desenvolvimento
```

## Estrutura de Banco de Dados

O módulo gerencial utiliza os modelos existentes do sistema para:
- Contas a pagar/receber
- Movimentações financeiras
- Dados de vendas

Não são necessárias migrações adicionais.

## Testando a Instalação

### 1. Verificar URLs do Backend

Acesse no navegador ou Postman:
- `http://localhost:8000/gerencial/financeiro/despesas-previstas/?empr=1&fili=1&data_ini=2024-01-01&data_fim=2024-06-30`
- `http://localhost:8000/gerencial/financeiro/lucro-previsto/?empr=1&fili=1&data_ini=2024-01-01&data_fim=2024-06-30`
- `http://localhost:8000/gerencial/financeiro/fluxo-previsto/?empr=1&fili=1&data_ini=2024-01-01&data_fim=2024-06-30`

### 2. Verificar Menu no App

1. Inicie o app React Native: `npm start`
2. Faça login no sistema
3. Verifique se o menu "Gerencial" aparece na navegação
4. Teste cada tela:
   - Análise de Despesas
   - Previsão de Lucro
   - Fluxo de Caixa Previsto

## Solução de Problemas

### Erro: "Module not found: pandas"
```bash
pip install pandas
```

### Erro: "No module named 'sklearn'"
```bash
pip install scikit-learn
```

### Erro: "CORS policy"
Verifique as configurações de CORS no Django e certifique-se de que o domínio do app está permitido.

### Menu não aparece
Verifique se o usuário tem o módulo 'financeiro' habilitado no sistema.

### Gráficos não carregam
Verifique se:
1. O backend está retornando dados no formato correto
2. As datas estão no formato YYYY-MM-DD
3. Os valores são numéricos

## Logs e Debug

Para debug do backend, adicione logs nas views:

```python
import logging
logger = logging.getLogger(__name__)

class DespesasPrevistasView(APIView):
    def get(self, request):
        logger.info(f"Parâmetros recebidos: {request.GET}")
        # ... resto do código
```

Para debug do frontend, use:

```javascript
console.log('Dados recebidos:', response.data);
```