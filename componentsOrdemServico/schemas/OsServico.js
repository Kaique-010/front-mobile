// OsServico.js
import { Model, Q } from '@nozbe/watermelondb'

class OsServico extends Model {
  static table = 'os_servico'

  // Relações (Crucial para carregar os itens)
  static associations = {
    pecas_os: { type: 'has_many', foreignKey: 'peca_os' },
    servicos_os: { type: 'has_many', foreignKey: 'serv_os' },
    os_hora: { type: 'has_many', foreignKey: 'os_hora_os' },
  }

  get osEmpr() { return this._getRaw('os_empr') }
  set osEmpr(value) { this._setRaw('os_empr', value) }

  get osFili() { return this._getRaw('os_fili') }
  set osFili(value) { this._setRaw('os_fili', value) }

  get osOs() { return this._getRaw('os_os') }
  set osOs(value) { this._setRaw('os_os', value) }

  get osClie() { return this._getRaw('os_clie') }
  set osClie(value) { this._setRaw('os_clie', value) }

  get osVend() { return this._getRaw('os_vend') }
  set osVend(value) { this._setRaw('os_vend', value) }

  get osDataAbert() { 
    const raw = this._getRaw('os_data_abert')
    return raw ? new Date(raw) : null
  }
  set osDataAbert(value) { 
    this._setRaw('os_data_abert', value ? value.getTime() : null) 
  }

  get osDataFech() { 
    const raw = this._getRaw('os_data_fech')
    return raw ? new Date(raw) : null
  }
  set osDataFech(value) { 
    this._setRaw('os_data_fech', value ? value.getTime() : null) 
  }

  get osTipo() { return this._getRaw('os_tipo') }
  set osTipo(value) { this._setRaw('os_tipo', value) }

  get osSitua() { return this._getRaw('os_situa') }
  set osSitua(value) { this._setRaw('os_situa', value) }

  get osDefeito() { return this._getRaw('os_defeito') }
  set osDefeito(value) { this._setRaw('os_defeito', value) }

  get osServExec() { return this._getRaw('os_serv_exec') }
  set osServExec(value) { this._setRaw('os_serv_exec', value) }

  get osObs() { return this._getRaw('os_obs') }
  set osObs(value) { this._setRaw('os_obs', value) }

  get osAssiClie() { return this._getRaw('os_assi_clie') }
  set osAssiClie(value) { this._setRaw('os_assi_clie', value) }

  get osAssiOper() { return this._getRaw('os_assi_oper') }
  set osAssiOper(value) { this._setRaw('os_assi_oper', value) }

  get osValorTota() { return this._getRaw('os_valor_tota') }
  set osValorTota(value) { this._setRaw('os_valor_tota', value) }

  get osValorPecas() { return this._getRaw('os_valor_pecas') }
  set osValorPecas(value) { this._setRaw('os_valor_pecas', value) }

  get osValorServ() { return this._getRaw('os_valor_serv') }
  set osValorServ(value) { this._setRaw('os_valor_serv', value) }

  get osValorDesc() { return this._getRaw('os_valor_desc') }
  set osValorDesc(value) { this._setRaw('os_valor_desc', value) }

  // Coleções para acessar itens
  get pecas() {
    return this.collections.get('pecas_os').query(Q.where('peca_os', this.osOs))
  }

  get servicos() {
    return this.collections.get('servicos_os').query(Q.where('serv_os', this.osOs))
  }

  get horas() {
    return this.collections.get('os_hora').query(Q.where('os_hora_os', this.osOs))
  }
}
export default OsServico
