import { tableSchema } from '@nozbe/watermelondb'

const megaProdutosSchema = tableSchema({
  name: 'mega_produtos',
  columns: [
    { name: 'prod_codi', type: 'string', isIndexed: true },
    { name: 'prod_empr', type: 'string', isIndexed: true },
    { name: 'prod_nome', type: 'string', isIndexed: true },
    { name: 'prod_unme', type: 'string', isOptional: true }, // ✅ NOVO
    { name: 'prod_tipo', type: 'string', isIndexed: true }, // ✅ NOVO
    { name: 'prod_ncm', type: 'string', isOptional: true }, // ✅ NOVO (NCM)
    { name: 'preco_vista', type: 'number', isOptional: true },
    { name: 'preco_normal', type: 'number', isOptional: true }, // ✅ NOVO
    { name: 'saldo_estoque', type: 'number', isOptional: true }, // ✅ NOVO (renomeado)
    { name: 'marca_nome', type: 'string', isOptional: true },
    { name: 'imagem_base64', type: 'string', isOptional: true },
    { name: 'created_at', type: 'number' },
    { name: 'updated_at', type: 'number' },
  ],
})

export default megaProdutosSchema
