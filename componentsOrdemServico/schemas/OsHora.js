import { Model } from '@nozbe/watermelondb'

class OsHora extends Model {
  static table = 'os_hora'

  static associations = {
    os_servico: { type: 'belongs_to', key: 'os_hora_os' },
  }

  get osHoraEmpr() {
    return this._getRaw('os_hora_empr')
  }
  set osHoraEmpr(value) {
    this._setRaw('os_hora_empr', value)
  }

  get osHoraFili() {
    return this._getRaw('os_hora_fili')
  }
  set osHoraFili(value) {
    this._setRaw('os_hora_fili', value)
  }

  get osHoraOs() {
    return this._getRaw('os_hora_os')
  }
  set osHoraOs(value) {
    this._setRaw('os_hora_os', value)
  }

  get osHoraItem() {
    return this._getRaw('os_hora_item')
  }
  set osHoraItem(value) {
    this._setRaw('os_hora_item', value)
  }

  get osHoraOper() {
    return this._getRaw('os_hora_oper')
  }
  set osHoraOper(value) {
    this._setRaw('os_hora_oper', value)
  }

  get osHoraData() {
    return this._getRaw('os_hora_data')
  }
  set osHoraData(value) {
    this._setRaw('os_hora_data', value)
  }

  get osHoraManhIni() {
    return this._getRaw('os_hora_manh_ini')
  }
  set osHoraManhIni(value) {
    this._setRaw('os_hora_manh_ini', value)
  }

  get osHoraManhFim() {
    return this._getRaw('os_hora_manh_fim')
  }
  set osHoraManhFim(value) {
    this._setRaw('os_hora_manh_fim', value)
  }

  get osHoraTardIni() {
    return this._getRaw('os_hora_tard_ini')
  }
  set osHoraTardIni(value) {
    this._setRaw('os_hora_tard_ini', value)
  }

  get osHoraTardFim() {
    return this._getRaw('os_hora_tard_fim')
  }
  set osHoraTardFim(value) {
    this._setRaw('os_hora_tard_fim', value)
  }

  get osHoraKmSai() {
    return this._getRaw('os_hora_km_sai')
  }
  set osHoraKmSai(value) {
    this._setRaw('os_hora_km_sai', value)
  }

  get osHoraKmChe() {
    return this._getRaw('os_hora_km_che')
  }
  set osHoraKmChe(value) {
    this._setRaw('os_hora_km_che', value)
  }

  get os() {
    return this.relation('os_servico', 'os_hora_os')
  }
}

export default OsHora
