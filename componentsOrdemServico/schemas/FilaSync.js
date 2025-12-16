// FilaSync.js
import { Model } from '@nozbe/watermelondb'
import { field, text } from '@nozbe/watermelondb/decorators'

class FilaSync extends Model {
  static table = 'fila_sincronizacao'

  @field('acao') acao
  @field('tabela_alvo') tabelaAlvo
  @field('registro_id_local') registroIdLocal
  @text('payload_json') payloadJson
  @field('tentativas') tentativas
  @field('criado_em') criadoEm

  // Método auxiliar para desserializar o JSON
  get payload() {
    try {
      return JSON.parse(this.payloadJson)
    } catch (e) {
      console.error('Erro ao desserializar payload:', e)
      return null
    }
  }
}
export default FilaSync
