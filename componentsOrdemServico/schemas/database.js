import { Platform } from 'react-native'

let db
if (Platform.OS === 'web') {
  db = require('./database.web').default
} else {
  db = require('./database.native').default
}

export default db
