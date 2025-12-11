// osServicoSchema.js
import { tableSchema } from '@nozbe/watermelondb'

const osServicoSchema = tableSchema({
  name: 'os_servico',
  columns: [
    { name: 'os_empr', type: 'string' }, // Chave: Empresa
    { name: 'os_fili', type: 'string' }, // Chave: Filial
    { name: 'os_os', type: 'string', isIndexed: true }, // Chave Principal: Número da OS
    
    { name: 'os_clie', type: 'string', isIndexed: true }, // Cliente (enti_clie)
    { name: 'os_vend', type: 'string' }, // Vendedor
    { name: 'os_data_abert', type: 'number' }, // Data de Abertura (Timestamp)
    { name: 'os_data_fech', type: 'number', isOptional: true }, // Data de Fechamento (Timestamp)
    
    { name: 'os_tipo', type: 'string' }, // Tipo de Serviço
    { name: 'os_situa', type: 'string' }, // Situação/Status
    
    // Descrições e Observações
    { name: 'os_defeito', type: 'string', isOptional: true },
    { name: 'os_serv_exec', type: 'string', isOptional: true },
    { name: 'os_obs', type: 'string', isOptional: true },
    
    // Assinaturas (Base64 Binary Field)
    { name: 'os_assi_clie', type: 'string', isOptional: true },
    { name: 'os_assi_oper', type: 'string', isOptional: true },
    
    // Valores (Calculados ou Digitados)
    { name: 'os_valor_tota', type: 'number' },
    { name: 'os_valor_pecas', type: 'number' },
    { name: 'os_valor_serv', type: 'number' },
    { name: 'os_valor_desc', type: 'number' },

    // Chaves de rastreamento para WatermelonDB (essenciais para Offline First)
    { name: 'created_at', type: 'number' }, 
    { name: 'updated_at', type: 'number' },
    // A coluna `_status` (sync status) é adicionada automaticamente
  ],
})

export default osServicoSchema