// PecaOs.js
import { Model } from '@nozbe/watermelondb'

class PecaOs extends Model {
  static table = 'pecas_os'

  static associations = {
    os_servico: { type: 'belongs_to', key: 'peca_os' },
  }

  get pecaEmpr() {
    return this._getRaw('peca_empr')
  }
  set pecaEmpr(value) {
    this._setRaw('peca_empr', value)
  }

  get pecaFili() {
    return this._getRaw('peca_fili')
  }
  set pecaFili(value) {
    this._setRaw('peca_fili', value)
  }

  get pecaOs() {
    return this._getRaw('peca_os')
  }
  set pecaOs(value) {
    this._setRaw('peca_os', value)
  }

  get pecaItem() {
    return this._getRaw('peca_item')
  }
  set pecaItem(value) {
    this._setRaw('peca_item', value)
  }

  get pecaProd() {
    return this._getRaw('peca_prod')
  }
  set pecaProd(value) {
    this._setRaw('peca_prod', value)
  }

  get pecaQuan() {
    return this._getRaw('peca_quan')
  }
  set pecaQuan(value) {
    this._setRaw('peca_quan', value)
  }

  get pecaUnit() {
    return this._getRaw('peca_unit')
  }
  set pecaUnit(value) {
    this._setRaw('peca_unit', value)
  }

  get pecaTota() {
    return this._getRaw('peca_tota')
  }
  set pecaTota(value) {
    this._setRaw('peca_tota', value)
  }

  get os() {
    return this.relation('os_servico', 'peca_os')
  }
}
export default PecaOs
