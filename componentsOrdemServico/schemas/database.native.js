import { Database } from '@nozbe/watermelondb'
import { NativeModules, Platform } from 'react-native'
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

const hasWMNative = !!NativeModules?.WMDatabaseBridge
let adapter
if (hasWMNative) {
  console.log('[DB Adapter] SQLiteAdapter ativo (WMDatabaseBridge disponível)')
  const SQLiteAdapter = require('@nozbe/watermelondb/adapters/sqlite').default
  adapter = new SQLiteAdapter({
    schema: schemas,
    migrations,
    dbName: 'front_mobile_db',
  })
} else {
  console.log('[DB Adapter] LokiJSAdapter ativo (WMDatabaseBridge ausente)')
  const LokiJSAdapter = require('@nozbe/watermelondb/adapters/lokijs').default
  adapter = new LokiJSAdapter({
    schema: schemas,
    dbName: 'front_mobile_db',
    useWebWorker: false,
    useIncrementalIndexedDB: Platform.OS === 'web',
  })
}

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
