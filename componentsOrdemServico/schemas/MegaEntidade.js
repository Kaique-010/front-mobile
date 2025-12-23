import { Model } from '@nozbe/watermelondb'
import { field } from '@nozbe/watermelondb/decorators'

export default class MegaEntidade extends Model {
  static table = 'mega_entidades'

  @field('enti_clie') entiClie
  @field('enti_empr') entiEmpr
  @field('enti_nome') entiNome
  @field('enti_tipo_enti') entiTipoEnti
  @field('enti_cpf') entiCpf
  @field('enti_cnpj') entiCnpj
  @field('enti_cida') entiCida
}

