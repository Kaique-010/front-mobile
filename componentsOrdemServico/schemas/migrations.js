import {
  schemaMigrations,
  createTable,
  addColumns,
} from '@nozbe/watermelondb/Schema/migrations'

const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        createTable({
          name: 'produtos_detalhados',
          columns: [
            { name: 'codigo', type: 'string', isIndexed: true },
            { name: 'nome', type: 'string', isIndexed: true },
            { name: 'marca_nome', type: 'string', isOptional: true },
            { name: 'saldo', type: 'number', isOptional: true },
            { name: 'preco_vista', type: 'number', isOptional: true },
            { name: 'imagem_base64', type: 'string', isOptional: true },
            { name: 'created_at', type: 'number' },
            { name: 'updated_at', type: 'number' },
          ],
        }),
        addColumns({
          table: 'entidades',
          columns: [
            { name: 'enti_cpf', type: 'string', isOptional: true },
            { name: 'enti_cnpj', type: 'string', isOptional: true },
            { name: 'enti_cida', type: 'string', isOptional: true },
          ],
        }),
      ],
    },
    {
      toVersion: 3,
      steps: [
        createTable({
          name: 'mega_entidades',
          columns: [
            { name: 'enti_clie', type: 'string', isIndexed: true },
            { name: 'enti_empr', type: 'string', isIndexed: true },
            { name: 'enti_nome', type: 'string', isIndexed: true },
            { name: 'enti_tipo_enti', type: 'string', isIndexed: true },
            { name: 'enti_cpf', type: 'string', isOptional: true },
            { name: 'enti_cnpj', type: 'string', isOptional: true },
            { name: 'enti_cida', type: 'string', isOptional: true },
            { name: 'created_at', type: 'number' },
            { name: 'updated_at', type: 'number' },
          ],
        }),
        createTable({
          name: 'mega_produtos',
          columns: [
            { name: 'prod_codi', type: 'string', isIndexed: true },
            { name: 'prod_empr', type: 'string', isIndexed: true },
            { name: 'prod_nome', type: 'string', isIndexed: true },
            { name: 'preco_vista', type: 'number', isOptional: true },
            { name: 'saldo', type: 'number', isOptional: true },
            { name: 'marca_nome', type: 'string', isOptional: true },
            { name: 'imagem_base64', type: 'string', isOptional: true },
            { name: 'created_at', type: 'number' },
            { name: 'updated_at', type: 'number' },
          ],
        }),
      ],
    },
    {
      toVersion: 4,
      steps: [
        addColumns({
          table: 'mega_produtos',
          columns: [
            { name: 'prod_unme', type: 'string', isOptional: true },
            // ✅ CRÍTICO: prod_tipo DEVE ser opcional para não quebrar registros existentes
            { name: 'prod_tipo', type: 'string', isOptional: true },
            { name: 'preco_normal', type: 'number', isOptional: true },
            { name: 'saldo_estoque', type: 'number', isOptional: true },
          ],
        }),
      ],
    },
    {
      toVersion: 5,
      steps: [
        // Migração vazia para corrigir duplicidade anterior
      ],
    },
    {
      toVersion: 6,
      steps: [
        addColumns({
          table: 'os_servico',
          columns: [
            { name: 'os_servico_status', type: 'string', isOptional: true },
          ],
        }),
      ],
    },
    {
      toVersion: 7,
      steps: [
        addColumns({
          table: 'mega_produtos',
          columns: [{ name: 'prod_ncm', type: 'string', isOptional: true }],
        }),
      ],
    },
  ],
})

export default migrations
