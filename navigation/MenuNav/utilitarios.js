export const getUtilitariosMenu = (hasModulo) => ({
  name: 'Utilitários',
  icon: 'settings',
  items: [
    {
      name: 'Inspetor de DB',
      route: 'DatabaseInspector',
      icon: 'database',
      condition: true,
    },
    {
      name: 'Alterar Senha',
      route: 'AlterarSenha',
      icon: 'lock',
      condition: true,
    },
    {
      name: 'Usuários do Sistema',
      route: 'UsuariosList',
      icon: 'users',
      condition: hasModulo('parametros_admin'),
    },
    {
      name: 'Coletor de Estoque',
      route: 'ColetorEstoque',
      icon: 'barcode-scan',
      iconType: 'MaterialCommunityIcons',
      condition: hasModulo('Produtos'),
    },

    {
      name: 'Parâmetros do Sistema',
      route: 'ParametrosMenu',
      icon: 'settings',
      condition: hasModulo('parametros_admin'),
    },
    {
      name: 'Implantações',
      route: 'ImplantacaoForm',
      icon: 'settings',
      condition: hasModulo('parametros_admin'),
    },
    {
      name: 'Logs do Sistema',
      route: 'Auditoria',
      icon: 'clock',
      condition: true,
    },
  ].sort((a, b) => a.name.localeCompare(b.name)),
})
