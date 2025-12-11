import { Database } from '@nozbe/watermelondb'
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs'
import schemas from './schemas'
import Entidade from './Entidade'
import OsServico from './OsServico'
import PecaOs from './PecaOs'
import FilaSync from './FilaSync'
import ServicosOs from './ServicosOs'
import OsHora from './OsHora'
import ProdutoDetalhado from './ProdutoDetalhado'
import MegaEntidade from './MegaEntidade'
import MegaProduto from './MegaProduto'

const adapter = new LokiJSAdapter({
  schema: schemas,
  dbName: 'front_mobile_db',
  useWebWorker: false,
  useIncrementalIndexedDB: true,
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
