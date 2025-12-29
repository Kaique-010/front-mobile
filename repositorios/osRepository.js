// repositories/osRepository.ts
import { isOnline } from '../services/connectivityService'
import { apiPostComContexto } from '../utils/api'
import database from '../componentsOrdemServico/schemas/database'
import { enqueueOperation } from '../componentsOrdemServico/services/syncService'
import uuid from 'react-native-uuid'

export async function criarOS(payload) {
  if (isOnline()) {
    return apiPostComContexto('Os/ordens/', payload)
  }

  const localId = `OFFLINE-${uuid.v4()}`

  await database.write(async () => {
    await database.collections.get('os_servico').create((os) => {
      os._raw.id = localId
      os.osOs = localId
      os.osEmpr = String(payload.os_empr)
      os.osFili = String(payload.os_fili)
      os.osClie = String(payload.os_clie)
      os.osDataAber = payload.os_data_aber
    })
  })

  await enqueueOperation('Os/ordens/', 'post', payload, localId)

  return { os_os: localId, offline: true }
}
