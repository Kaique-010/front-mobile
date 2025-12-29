import { Model } from '@nozbe/watermelondb'

export default class MegaEntidade extends Model {
  static table = 'mega_entidades'

  get entiClie() {
    return this._getRaw('enti_clie')
  }
  set entiClie(value) {
    this._setRaw('enti_clie', value)
  }

  get entiEmpr() {
    return this._getRaw('enti_empr')
  }
  set entiEmpr(value) {
    this._setRaw('enti_empr', value)
  }

  get entiNome() {
    return this._getRaw('enti_nome')
  }
  set entiNome(value) {
    this._setRaw('enti_nome', value)
  }

  get entiTipoEnti() {
    return this._getRaw('enti_tipo_enti')
  }
  set entiTipoEnti(value) {
    this._setRaw('enti_tipo_enti', value)
  }

  get entiCpf() {
    return this._getRaw('enti_cpf')
  }
  set entiCpf(value) {
    this._setRaw('enti_cpf', value)
  }

  get entiCnpj() {
    return this._getRaw('enti_cnpj')
  }
  set entiCnpj(value) {
    this._setRaw('enti_cnpj', value)
  }

  get entiCida() {
    return this._getRaw('enti_cida')
  }
  set entiCida(value) {
    this._setRaw('enti_cida', value)
  }
}
