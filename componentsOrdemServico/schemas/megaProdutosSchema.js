import { tableSchema } from '@nozbe/watermelondb'

const megaProdutosSchema = tableSchema({
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
})

export default megaProdutosSchema
