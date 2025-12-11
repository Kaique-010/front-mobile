import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import schemas from './schemas'
import migrations from './migrations'
import Entidade from './Entidade'
import OsServico from './OsServico'
import PecaOs from './PecaOs'
import FilaSync from './FilaSync'
import ServicosOs from './ServicosOs'
import OsHora from './OsHora'
import ProdutoDetalhado from './ProdutoDetalhado'
import MegaEntidade from './MegaEntidade'
import MegaProduto from './MegaProduto'

const adapter = new SQLiteAdapter({
  schema: schemas,
  migrations,
  dbName: 'front_mobile_db',
})

const database = new Database({
  adapter,
  modelClasses: [
    Entidade,
    OsServico,
    PecaOs,
    ServicosOs,
    OsHora,
    FilaSync,
    ProdutoDetalhado,
    MegaEntidade,
    MegaProduto,
  ],
  actionsEnabled: true,
})

export default database
