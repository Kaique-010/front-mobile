// URLs base para as notificações
const API_BASE = 'http://localhost:8000/api/notificacoes/'

const endpoints = {
  listar: `${API_BASE}listar/`,
  marcarLida: (id) => `${API_BASE}marcar-lida/${id}/`,
  // Endpoints para gerar notificações (normalmente automáticos)
  gerarEstoque: `${API_BASE}estoque/`,
  gerarFinanceiro: `${API_BASE}financeiro/`,
  gerarVendas: `${API_BASE}vendas/`,
  gerarResumo: `${API_BASE}resumo/`
}

// Make sure the base URL is correct and accessible
const BASE_URL = 'http://192.168.0.39:8000'; // Verify this IP is correct

// Or try with your actual server IP/domain
// const BASE_URL = 'https://your-domain.com';