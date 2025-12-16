// Exportações dos componentes de Ordem de Produção
export { default as ListagemOrdensProducao } from './ListagemOrdensProducao';
export { default as DetalhesOrdemProducao } from './DetalhesOrdemProducao';
export { default as FormOrdemProducao } from './FormOrdemProducao';

// Exportação como objeto para facilitar importações
export default {
  ListagemOrdensProducao: require('./ListagemOrdensProducao').default,
  DetalhesOrdemProducao: require('./DetalhesOrdemProducao').default,
  FormOrdemProducao: require('./FormOrdemProducao').default,
};