import { schemaMigrations, createTable, addColumns } from '@nozbe/watermelondb/Schema/migrations'
import produtosDetalhadosSchema from './produtosDetalhadosSchema'

const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        createTable(productsTableName(), produtosDetalhadosSchema),
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
        createTable('mega_entidades', require('./megaEntidadesSchema').default),
        createTable('mega_produtos', require('./megaProdutosSchema').default),
      ],
    },
  ],
})

function productsTableName() {
  return 'produtos_detalhados'
}

export default migrations
