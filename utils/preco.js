// utils/preco.js

export function getPrecoExibicao(item) {
  const precoVista = Number(item.prod_preco_vista || 0)
  const precoNormal = Number(item.prod_preco_normal || 0)

  if (precoVista > 0) return precoVista
  if (precoNormal > 0) return precoNormal

  return 0
}

export function podeMostrarPreco(usuarioTemSetor) {
  // Regra unificada
  return !usuarioTemSetor
}
