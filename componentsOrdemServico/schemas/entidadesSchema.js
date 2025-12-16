import { tableSchema } from '@nozbe/watermelondb'

const entidadesSchema = tableSchema({
  name: 'entidades',
  columns: [
    { name: 'enti_clie', type: 'string', isIndexed: true },
    { name: 'enti_nome', type: 'string' },
    { name: 'enti_empr', type: 'string' },
    { name: 'enti_tipo_enti', type: 'string', isIndexed: true },
    { name: 'created_at', type: 'number' },
    { name: 'updated_at', type: 'number' },
  ],
})

export default entidadesSchema
