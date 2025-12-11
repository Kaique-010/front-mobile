import { tableSchema } from '@nozbe/watermelondb'

const megaEntidadesSchema = tableSchema({
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
})

export default megaEntidadesSchema

