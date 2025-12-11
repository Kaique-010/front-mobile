// OsServico.js
import { Model } from '@nozbe/watermelondb'
import { field, date, text, children } from '@nozbe/watermelondb/decorators'

class OsServico extends Model {
  static table = 'os_servico'

  // Relações (Crucial para carregar os itens)
  static associations = {
    pecas_os: { type: 'has_many', foreignKey: 'peca_os' },
    servicos_os: { type: 'has_many', foreignKey: 'serv_os' },
    os_hora: { type: 'has_many', foreignKey: 'os_hora_os' },
  }

  @field('os_empr') osEmpr
  @field('os_fili') osFili
  @field('os_os') osOs // Chave Primária Lógica
  @field('os_clie') osClie
  @field('os_vend') osVend
  @date('os_data_abert') osDataAbert
  @date('os_data_fech') osDataFech
  @field('os_tipo') osTipo
  @field('os_situa') osSitua

  @text('os_defeito') osDefeito
  @text('os_serv_exec') osServExec
  @text('os_obs') osObs

  @text('os_assi_clie') osAssiClie // Base64
  @text('os_assi_oper') osAssiOper // Base64

  @field('os_valor_tota') osValorTota
  @field('os_valor_pecas') osValorPecas
  @field('os_valor_serv') osValorServ
  @field('os_valor_desc') osValorDesc

  // Coleções para acessar itens
  @children('pecas_os') pecas
  @children('servicos_os') servicos
  @children('os_hora') horas
}
export default OsServico
