import netInfo from '@react-native-community/netinfo'

let online = true

export function verificarConexao() {
  netInfo.fetch().then((state) => {
    online = state.isConnected
  })
}

export function isOnline() {
  return online
}

export async function isOnlineAsync() {
  const state = await netInfo.fetch()
  online = state.isConnected
  return state.isConnected
}
