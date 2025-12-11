import { Model } from '@nozbe/watermelondb'
import { field, relation } from '@nozbe/watermelondb/decorators'

class OsHora extends Model {
  static table = 'os_hora'

  static associations = {
    os_servico: { type: 'belongs_to', key: 'os_hora_os' },
  }

  @field('os_hora_empr') osHoraEmpr
  @field('os_hora_fili') osHoraFili
  @field('os_hora_os') osHoraOs
  @field('os_hora_item') osHoraItem
  @field('os_hora_oper') osHoraOper
  @field('os_hora_data') osHoraData
  @field('os_hora_manh_ini') osHoraManhIni
  @field('os_hora_manh_fim') osHoraManhFim
  @field('os_hora_tard_ini') osHoraTardIni
  @field('os_hora_tard_fim') osHoraTardFim
  @field('os_hora_km_sai') osHoraKmSai
  @field('os_hora_km_che') osHoraKmChe

  @relation('os_servico', 'os_hora_os') os
}

export default OsHora
