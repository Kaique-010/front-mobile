import { Model } from '@nozbe/watermelondb'

class ServicosOs extends Model {
  static table = 'servicos_os'

  static associations = {
    os_servico: { type: 'belongs_to', key: 'serv_os' },
  }

  get servEmpr() {
    return this._getRaw('serv_empr')
  }
  set servEmpr(value) {
    this._setRaw('serv_empr', value)
  }

  get servFili() {
    return this._getRaw('serv_fili')
  }
  set servFili(value) {
    this._setRaw('serv_fili', value)
  }

  get servOs() {
    return this._getRaw('serv_os')
  }
  set servOs(value) {
    this._setRaw('serv_os', value)
  }

  get servItem() {
    return this._getRaw('serv_item')
  }
  set servItem(value) {
    this._setRaw('serv_item', value)
  }

  get servProd() {
    return this._getRaw('serv_prod')
  }
  set servProd(value) {
    this._setRaw('serv_prod', value)
  }

  get servQuan() {
    return this._getRaw('serv_quan')
  }
  set servQuan(value) {
    this._setRaw('serv_quan', value)
  }

  get servUnit() {
    return this._getRaw('serv_unit')
  }
  set servUnit(value) {
    this._setRaw('serv_unit', value)
  }

  get servTota() {
    return this._getRaw('serv_tota')
  }
  set servTota(value) {
    this._setRaw('serv_tota', value)
  }

  get os() {
    return this.relation('os_servico', 'serv_os')
  }
}

export default ServicosOs
