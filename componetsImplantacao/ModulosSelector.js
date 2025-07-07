const MODULOS_CHOICES = [
  { label: 'Cadastros', value: 'cadastro' },
  { label: 'Estoque', value: 'estoque' },
  { label: 'Compras', value: 'compras' },
  { label: 'Vendas', value: 'vendas' },
  { label: 'Financeiro', value: 'financeiro' },
  { label: 'Agrícola', value: 'agricola' },
  { label: 'Ordem de Serviço', value: 'os' },
  { label: 'Transportes', value: 'transportes' },
  { label: 'Confecção', value: 'confeccao' },
  { label: 'Ordem de Produção', value: 'ordemproducao' }, // ✅ Adicionar novo módulo
  { label: 'Controle de Materiais', value: 'materiais' },
]

export default function ModulosSelector({
  modulosSelecionados,
  setModulosSelecionados,
  setModalModuloAtual,
  setTelasSelecionadasPorModulo,
}) {
  return (
    <>
      <Text style={styles.label}>Módulos *</Text>
      {MODULOS_CHOICES.map(({ label, value }) => {
        const selecionado = modulosSelecionados.includes(value)

        return (
          <TouchableOpacity
            key={value}
            style={[
              styles.choiceButton,
              selecionado && styles.choiceButtonSelected,
            ]}
            onPress={() => {
              if (selecionado) {
                setModulosSelecionados((prev) =>
                  prev.filter((m) => m !== value)
                )
                setTelasSelecionadasPorModulo((prev) => {
                  const novo = { ...prev }
                  delete novo[value]
                  return novo
                })
              } else {
                setModulosSelecionados((prev) => [...prev, value])
                setModalModuloAtual(value)
              }
            }}>
            <Text style={styles.choiceButtonText}>{label}</Text>
          </TouchableOpacity>
        )
      })}
    </>
  )
}
