export default function TotalizadorProdutos(produtos) {
  if (!produtos || !Array.isArray(produtos)) return 0

  return produtos.reduce((acc, item) => {
    // Usa prod_preco_vista (comum na API) ou fallback para prod_preco
    const preco = Number(
      item.prod_preco_vista || item.prod_preco || item.preco_vista || 0,
    )
    // Usa quantity (adicionado pelo scanner/manual) ou 0 se não estiver definido
    const quantidade = Number(item.quantity || 0)

    return acc + preco * quantidade
  }, 0)
}
