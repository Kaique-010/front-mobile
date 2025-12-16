import { tableSchema } from '@nozbe/watermelondb'

const produtosDetalhadosSchema = tableSchema({
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
})

export default produtosDetalhadosSchema
