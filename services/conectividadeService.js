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
