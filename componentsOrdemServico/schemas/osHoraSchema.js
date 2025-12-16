import { tableSchema } from '@nozbe/watermelondb'

const osHoraSchema = tableSchema({
  name: 'os_hora',
  columns: [
    { name: 'os_hora_empr', type: 'string' },
    { name: 'os_hora_fili', type: 'string' },
    { name: 'os_hora_os', type: 'string', isIndexed: true }, // Chave estrangeira
    { name: 'os_hora_item', type: 'string' }, // Item (chave local)

    { name: 'os_hora_oper', type: 'string' }, // Operador (enti_func)
    { name: 'os_hora_data', type: 'number' }, // Data (Timestamp)
    { name: 'os_hora_manh_ini', type: 'string', isOptional: true },
    { name: 'os_hora_manh_fim', type: 'string', isOptional: true },
    { name: 'os_hora_tard_ini', type: 'string', isOptional: true },
    { name: 'os_hora_tard_fim', type: 'string', isOptional: true },

    // KM
    { name: 'os_hora_km_sai', type: 'number', isOptional: true },
    { name: 'os_hora_km_che', type: 'number', isOptional: true },

    { name: 'created_at', type: 'number' },
    { name: 'updated_at', type: 'number' },
  ],
})
// ...
export default osHoraSchema
