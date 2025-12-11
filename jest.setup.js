jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)

jest.mock('@react-native-community/netinfo', () => {
  const listeners = new Set()
  return {
    addEventListener: (cb) => {
      listeners.add(cb)
      cb({ isConnected: true })
      return () => listeners.delete(cb)
    },
    fetch: async () => ({ isConnected: true }),
  }
})

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter')
global.oo_tx = (...args) => args
jest.setTimeout(15000)
global.__enqueue_called = 0
jest.mock('react-native-toast-message', () => ({ show: jest.fn() }))
