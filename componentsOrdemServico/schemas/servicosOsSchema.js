import { tableSchema } from '@nozbe/watermelondb'

const servicosOsSchema = tableSchema({
  name: 'servicos_os',
  columns: [
    { name: 'serv_empr', type: 'string' },
    { name: 'serv_fili', type: 'string' },
    { name: 'serv_os', type: 'string', isIndexed: true }, // Chave estrangeira
    { name: 'serv_item', type: 'string' }, // Item (chave local)

    { name: 'serv_prod', type: 'string', isIndexed: true }, // Código do Serviço/Produto
    { name: 'serv_quan', type: 'number' },
    { name: 'serv_unit', type: 'number' },
    { name: 'serv_tota', type: 'number' },

    { name: 'created_at', type: 'number' },
    { name: 'updated_at', type: 'number' },
  ],
})
export default servicosOsSchema
