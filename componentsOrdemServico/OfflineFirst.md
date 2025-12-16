# Offline-First: Ordens de Serviço

## Arquitetura

- Fila local de operações em WatermelonDB (`fila_sincronizacao`) via `componentsOrdemServico/services/syncService.js`.
- Processamento em loop com retentativas e ordem FIFO.
- Detecção de conectividade via `HEAD` no `BASE_URL`.
- Integração transparente nas telas de criação, peças, serviços e horas.

## Serviços

- `enqueueOperation(endpoint, method, payload)` adiciona operação à fila.
- `processSyncQueue()` executa operações quando online.
- `startSyncLoop(intervalMs)` inicia processamento periódico.

## Componentes

- Aba de Horas: `componentsOrdemServico/AbaHoras.js:102` grava horas; em falha, enfileira no mesmo endpoint em `componentsOrdemServico/AbaHoras.js:139`.
- Aba de Peças: `componentsOrdemServico/AbaPecas.js:195` monta payload; em falha, enfileira em `componentsOrdemServico/AbaPecas.js:241`.
- Aba de Serviços: `componentsOrdemServico/AbaServicos.js:156` monta payload; em falha, enfileira em `componentsOrdemServico/AbaServicos.js:202`.
- Criação de Ordem: `componentsOrdemServico/OrdemCriacao.js:66` cria O.S; em falha, enfileira em `componentsOrdemServico/OrdemCriacao.js:105` e inicia o loop em `componentsOrdemServico/OrdemCriacao.js:44`.
- Aba de Totais: `componentsOrdemServico/AbaTotais.js:109` atualiza total; geração de títulos em `componentsOrdemServico/AbaTotais.js:188`.
- Itens Modal: `componentsOrdemServico/ItensModalOs.js:103` envia itens para a aba pai.
- Visualização PDF: `componentsOrdemServico/OsPdfView.js:7` baixa e compartilha PDF pelo servidor.
- Modal de Serviços: `componentsOrdemServico/ServModalOs.js:170` envia serviço para a aba pai.
- Campo de Assinatura: `componentsOrdemServico/SignatureField.js:24` converte para base64 e `componentsOrdemServico/SignatureField.js:41` salva.

## Pastas de Backend (Django)

- `componentsOrdemServico/O_S/REST/views.py` expõe endpoints; `OsViewSet` em `componentsOrdemServico/O_S/REST/views.py:70`.
- `componentsOrdemServico/O_S/REST/serializers.py` define serialização.
- `componentsOrdemServico/O_S/services/os_service.py` utilitários de O.S.

## Schemas e Models (offline)

- Schemas WatermelonDB em `componentsOrdemServico/schemas/schemas.js` e arquivos de tabela.
- Modelos: `OsServico.js`, `PecaOs.js`, `ServicosOs.js`, `OsHora.js`, `FilaSync.js`, `Entidade.js`.

## Fluxo Offline-First

- Usuário aciona ação de salvar.
- Se falhar por rede, operação é salva na fila e feedback é exibido.
- O loop verifica conectividade e processa a fila; ao sucesso, a fila é atualizada.

## Integração com Django

- Operações usam os mesmos endpoints do online (`api.js`).
- Em caso de 4xx/5xx, erro permanece visível e operação não é enfileirada.
- Mapeamentos de IDs podem ser tratados no backend retornando JSON de referência.

## Testes e Qualidade
- Ambiente de testes: `jest` com preset `jest-expo` e `@testing-library/react-native`.
- Cobertura: specs para sincronização (fila, processamento, mapeamento, limpeza) e UI em falha de rede.
- Métricas: tempo médio de sincronização, tamanho da fila, taxa de sucesso por tentativa.

## Cenários de Falha
- Rede indisponível: operações enfileiradas; feedback via `Toast` e badge “Offline”.
- Timeout/Network Error: retentativas automáticas e manutenção na fila com limite de tentativas.
- HTTP 4xx/5xx: não enfileira; exibe erro para correção pelo usuário.

## Conflito de IDs
- Backend retorna mapeamento `{ local_os_id, remote_os_id, pecas_ids[], servicos_ids[], horas_ids[] }`.
- Cliente atualiza IDs locais nos Models correspondentes e limpa a fila.
- Caso falhe atualização local, mantém log de aviso e segue processamento.

## Eventos de Conectividade
- Listener `NetInfo` dispara `processSyncQueue()` ao ficar online.
- Polling periódico via `startSyncLoop(intervalMs)` complementa o listener.
