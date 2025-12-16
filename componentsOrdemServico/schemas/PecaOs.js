// PecaOs.js
import { Model } from '@nozbe/watermelondb'
import { field, relation } from '@nozbe/watermelondb/decorators'

class PecaOs extends Model {
  static table = 'pecas_os'

  static associations = {

    os_servico: { type: 'belongs_to', key: 'peca_os' },
  }

  @field('peca_empr') pecaEmpr
  @field('peca_fili') pecaFili
  @field('peca_os') pecaOs // Foreign Key
  @field('peca_item') pecaItem // Local Key
  @field('peca_prod') pecaProd
  @field('peca_quan') pecaQuan
  @field('peca_unit') pecaUnit
  @field('peca_tota') pecaTota

  // Campo para acessar a OS pai
  @relation('os_servico', 'peca_os') os
}
export default PecaOs
