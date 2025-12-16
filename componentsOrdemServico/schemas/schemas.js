// schemas.js (FINAL)
import { appSchema } from '@nozbe/watermelondb'

// Imports de todos os seus schemas
import entidadesSchema from './entidadesSchema'
import produtosDetalhadosSchema from './produtosDetalhadosSchema'
import megaEntidadesSchema from './megaEntidadesSchema'
import megaProdutosSchema from './megaProdutosSchema'
import osServicoSchema from './osServicoSchema'
import pecasOsSchema from './pecasOsSchema'
import servicosOsSchema from './servicosOsSchema'
import osHoraSchema from './osHoraSchema'
import filaSyncSchema from './filaSyncSchema'

const schemas = appSchema({
  version: 3,
  tables: [
    entidadesSchema,
    osServicoSchema,
    pecasOsSchema,
    servicosOsSchema,
    osHoraSchema,
    filaSyncSchema, // <-- A fila de sincronização
    produtosDetalhadosSchema,
    megaEntidadesSchema,
    megaProdutosSchema,
  ],
})

export default schemas
