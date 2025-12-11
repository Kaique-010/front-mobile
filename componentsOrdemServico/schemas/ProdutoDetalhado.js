import { Model } from '@nozbe/watermelondb'
import { field, text } from '@nozbe/watermelondb/decorators'

class ProdutoDetalhado extends Model {
  static table = 'produtos_detalhados'

  @field('codigo') codigo
  @field('nome') nome
  @field('marca_nome') marcaNome
  @field('saldo') saldo
  @field('preco_vista') precoVista
  @text('imagem_base64') imagemBase64
}

export default ProdutoDetalhado

