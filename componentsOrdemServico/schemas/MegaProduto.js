import { Model } from '@nozbe/watermelondb'
import { field, text } from '@nozbe/watermelondb/decorators'

export default class MegaProduto extends Model {
  static table = 'mega_produtos'

  @field('prod_codi') prodCodi
  @field('prod_empr') prodEmpr
  @field('prod_nome') prodNome
  @field('preco_vista') precoVista
  @field('saldo') saldo
  @field('marca_nome') marcaNome
  @text('imagem_base64') imagemBase64
}

