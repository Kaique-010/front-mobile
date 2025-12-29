import { Model } from '@nozbe/watermelondb'

export default class MegaProduto extends Model {
  static table = 'mega_produtos'

  get prodCodi() { return this._getRaw('prod_codi') }
  set prodCodi(value) { this._setRaw('prod_codi', value) }

  get prodEmpr() { return this._getRaw('prod_empr') }
  set prodEmpr(value) { this._setRaw('prod_empr', value) }

  get prodNome() { return this._getRaw('prod_nome') }
  set prodNome(value) { this._setRaw('prod_nome', value) }

  get precoVista() { return this._getRaw('preco_vista') }
  set precoVista(value) { this._setRaw('preco_vista', value) }

  get saldo() { return this._getRaw('saldo') }
  set saldo(value) { this._setRaw('saldo', value) }

  get marcaNome() { return this._getRaw('marca_nome') }
  set marcaNome(value) { this._setRaw('marca_nome', value) }

  get imagemBase64() { return this._getRaw('imagem_base64') }
  set imagemBase64(value) { this._setRaw('imagem_base64', value) }
}

