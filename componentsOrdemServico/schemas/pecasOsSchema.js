import { tableSchema } from '@nozbe/watermelondb'

const pecasOsSchema = tableSchema({
  name: 'pecas_os',
  columns: [
    { name: 'peca_empr', type: 'string' },
    { name: 'peca_fili', type: 'string' },
    { name: 'peca_os', type: 'string', isIndexed: true }, // Chave estrangeira para 'os_servico'
    { name: 'peca_item', type: 'string' }, // Item (chave local, pode ser gerada no front)

    { name: 'peca_prod', type: 'string', isIndexed: true }, // Código do Produto
    { name: 'peca_quan', type: 'number' }, // Quantidade
    { name: 'peca_unit', type: 'number' }, // Valor Unitário
    { name: 'peca_tota', type: 'number' }, // Valor Total (Calculado)

    { name: 'created_at', type: 'number' },
    { name: 'updated_at', type: 'number' },
  ],
})
export default pecasOsSchema
