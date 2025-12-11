import { Model } from '@nozbe/watermelondb'
import { field, relation } from '@nozbe/watermelondb/decorators'

class ServicosOs extends Model {
  static table = 'servicos_os'

  static associations = {
    os_servico: { type: 'belongs_to', key: 'serv_os' },
  }

  @field('serv_empr') servEmpr
  @field('serv_fili') servFili
  @field('serv_os') servOs
  @field('serv_item') servItem
  @field('serv_prod') servProd
  @field('serv_quan') servQuan
  @field('serv_unit') servUnit
  @field('serv_tota') servTota

  @relation('os_servico', 'serv_os') os
}

export default ServicosOs
