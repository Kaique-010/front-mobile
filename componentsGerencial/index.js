// Exportações dos componentes gerenciais
export { default as DespesasPrevistas } from './DespesasPrevistas';
export { default as LucroPrevisto } from './LucroPrevisto';
export { default as FluxoCaixaPrevisto } from './FluxoCaixaPrevisto';

// Exportação como objeto para facilitar importações
export default {
  DespesasPrevistas: require('./DespesasPrevistas').default,
  LucroPrevisto: require('./LucroPrevisto').default,
  FluxoCaixaPrevisto: require('./FluxoCaixaPrevisto').default,
};