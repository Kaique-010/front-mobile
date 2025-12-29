import { Model } from '@nozbe/watermelondb'

class ProdutoDetalhado extends Model {
  static table = 'produtos_detalhados'

  get codigo() {
    return this._getRaw('codigo')
  }
  set codigo(value) {
    this._setRaw('codigo', value)
  }

  get nome() {
    return this._getRaw('nome')
  }
  set nome(value) {
    this._setRaw('nome', value)
  }

  get marcaNome() {
    return this._getRaw('marca_nome')
  }
  set marcaNome(value) {
    this._setRaw('marca_nome', value)
  }

  get saldo() {
    return this._getRaw('saldo')
  }
  set saldo(value) {
    this._setRaw('saldo', value)
  }

  get precoVista() {
    return this._getRaw('preco_vista')
  }
  set precoVista(value) {
    this._setRaw('preco_vista', value)
  }

  get imagemBase64() {
    return this._getRaw('imagem_base64')
  }
  set imagemBase64(value) {
    this._setRaw('imagem_base64', value)
  }
}

export default ProdutoDetalhado
