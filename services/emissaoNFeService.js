import { request } from '../utils/api'

const emissaoNFeService = {
  // Verificar status do serviço da SEFAZ
  verificarStatusServico: async () => {
    try {
      const response = await request({
        method: 'get',
        endpoint: 'notas-fiscais/emissao/status-servico/'
      })
      return response.data
    } catch (error) {
      console.error('Erro ao verificar status do serviço:', error)
      throw error
    }
  },

  // Obter próximo número de NFe
  obterProximoNumero: async () => {
    try {
      const response = await request({
        method: 'get',
        endpoint: 'notas-fiscais/emissao/proximo-numero/'
      })
      return response.data.proximo_numero
    } catch (error) {
      console.error('Erro ao obter próximo número:', error)
      throw error
    }
  },

  // Emitir NFe
  emitirNFe: async (dadosNFe) => {
    try {
      const response = await request({
        method: 'post',
        endpoint: 'notas-fiscais/emissao/emitir/',
        data: dadosNFe
      })
      return response.data
    } catch (error) {
      console.error('Erro ao emitir NFe:', error)
      throw error
    }
  },

  // Consultar NFe
  consultarNFe: async (chaveAcesso) => {
    try {
      const response = await request({
        method: 'post',
        endpoint: 'notas-fiscais/emissao/consultar/',
        data: { chave_acesso: chaveAcesso }
      })
      return response.data
    } catch (error) {
      console.error('Erro ao consultar NFe:', error)
      throw error
    }
  },

  // Cancelar NFe
  cancelarNFe: async (chaveAcesso, justificativa) => {
    try {
      const response = await request({
        method: 'post',
        endpoint: 'notas-fiscais/emissao/cancelar/',
        data: {
          chave_acesso: chaveAcesso,
          justificativa: justificativa
        }
      })
      return response.data
    } catch (error) {
      console.error('Erro ao cancelar NFe:', error)
      throw error
    }
  },

  // Validar dados da NFe antes da emissão
  validarDadosNFe: (dadosNFe) => {
    const erros = []

    // Validar emitente
    if (!dadosNFe.emitente) {
      erros.push('Dados do emitente são obrigatórios')
    } else {
      if (!dadosNFe.emitente.razao_social) {
        erros.push('Razão social do emitente é obrigatória')
      }
      if (!dadosNFe.emitente.cnpj) {
        erros.push('CNPJ do emitente é obrigatório')
      }
      if (!dadosNFe.emitente.inscricao_estadual) {
        erros.push('Inscrição estadual do emitente é obrigatória')
      }
      if (!dadosNFe.emitente.logradouro) {
        erros.push('Logradouro do emitente é obrigatório')
      }
      if (!dadosNFe.emitente.numero) {
        erros.push('Número do endereço do emitente é obrigatório')
      }
      if (!dadosNFe.emitente.bairro) {
        erros.push('Bairro do emitente é obrigatório')
      }
      if (!dadosNFe.emitente.municipio) {
        erros.push('Município do emitente é obrigatório')
      }
      if (!dadosNFe.emitente.uf) {
        erros.push('UF do emitente é obrigatória')
      }
      if (!dadosNFe.emitente.cep) {
        erros.push('CEP do emitente é obrigatório')
      }
    }

    // Validar destinatário
    if (!dadosNFe.destinatario) {
      erros.push('Dados do destinatário são obrigatórios')
    } else {
      if (dadosNFe.destinatario.tipo_pessoa === 'juridica') {
        if (!dadosNFe.destinatario.razao_social) {
          erros.push('Razão social do destinatário é obrigatória')
        }
        if (!dadosNFe.destinatario.cnpj) {
          erros.push('CNPJ do destinatário é obrigatório')
        }
      } else {
        if (!dadosNFe.destinatario.nome) {
          erros.push('Nome do destinatário é obrigatório')
        }
        if (!dadosNFe.destinatario.cpf) {
          erros.push('CPF do destinatário é obrigatório')
        }
      }
      if (!dadosNFe.destinatario.logradouro) {
        erros.push('Logradouro do destinatário é obrigatório')
      }
      if (!dadosNFe.destinatario.numero) {
        erros.push('Número do endereço do destinatário é obrigatório')
      }
      if (!dadosNFe.destinatario.bairro) {
        erros.push('Bairro do destinatário é obrigatório')
      }
      if (!dadosNFe.destinatario.municipio) {
        erros.push('Município do destinatário é obrigatório')
      }
      if (!dadosNFe.destinatario.uf) {
        erros.push('UF do destinatário é obrigatória')
      }
      if (!dadosNFe.destinatario.cep) {
        erros.push('CEP do destinatário é obrigatório')
      }
    }

    // Validar dados da NFe
    if (!dadosNFe.nfe) {
      erros.push('Dados da NFe são obrigatórios')
    } else {
      if (!dadosNFe.nfe.numero) {
        erros.push('Número da NFe é obrigatório')
      }
      if (!dadosNFe.nfe.serie) {
        erros.push('Série da NFe é obrigatória')
      }
      if (!dadosNFe.nfe.natureza_operacao) {
        erros.push('Natureza da operação é obrigatória')
      }
      if (!dadosNFe.nfe.data_emissao) {
        erros.push('Data de emissão é obrigatória')
      }
      if (!dadosNFe.nfe.hora_emissao) {
        erros.push('Hora de emissão é obrigatória')
      }
    }

    // Validar itens
    if (!dadosNFe.itens || dadosNFe.itens.length === 0) {
      erros.push('Pelo menos um item deve ser adicionado à NFe')
    } else {
      dadosNFe.itens.forEach((item, index) => {
        if (!item.codigo) {
          erros.push(`Item ${index + 1}: Código é obrigatório`)
        }
        if (!item.descricao) {
          erros.push(`Item ${index + 1}: Descrição é obrigatória`)
        }
        if (!item.ncm) {
          erros.push(`Item ${index + 1}: NCM é obrigatório`)
        }
        if (!item.cfop) {
          erros.push(`Item ${index + 1}: CFOP é obrigatório`)
        }
        if (!item.unidade) {
          erros.push(`Item ${index + 1}: Unidade é obrigatória`)
        }
        if (!item.quantidade || parseFloat(item.quantidade.replace(',', '.')) <= 0) {
          erros.push(`Item ${index + 1}: Quantidade deve ser maior que zero`)
        }
        if (!item.valor_unitario || parseFloat(item.valor_unitario.replace(',', '.')) <= 0) {
          erros.push(`Item ${index + 1}: Valor unitário deve ser maior que zero`)
        }
      })
    }

    return erros
  },

  // Formatar dados para envio à API
  formatarDadosParaAPI: (dadosNFe) => {
    return {
      emitente: {
        ...dadosNFe.emitente,
        cnpj: dadosNFe.emitente.cnpj?.replace(/\D/g, ''),
        cep: dadosNFe.emitente.cep?.replace(/\D/g, ''),
        telefone: dadosNFe.emitente.telefone?.replace(/\D/g, ''),
      },
      destinatario: {
        ...dadosNFe.destinatario,
        cnpj: dadosNFe.destinatario.cnpj?.replace(/\D/g, ''),
        cpf: dadosNFe.destinatario.cpf?.replace(/\D/g, ''),
        cep: dadosNFe.destinatario.cep?.replace(/\D/g, ''),
        telefone: dadosNFe.destinatario.telefone?.replace(/\D/g, ''),
      },
      nfe: {
        ...dadosNFe.nfe,
        data_emissao: dadosNFe.nfe.data_emissao?.replace(/\D/g, ''),
        hora_emissao: dadosNFe.nfe.hora_emissao?.replace(/\D/g, ''),
        data_saida: dadosNFe.nfe.data_saida?.replace(/\D/g, ''),
        hora_saida: dadosNFe.nfe.hora_saida?.replace(/\D/g, ''),
      },
      itens: dadosNFe.itens.map(item => ({
        ...item,
        quantidade: parseFloat(item.quantidade.replace(',', '.')),
        valor_unitario: parseFloat(item.valor_unitario.replace(',', '.')),
        valor_total: parseFloat(item.valor_total.replace(',', '.')),
        aliquota_icms: parseFloat(item.aliquota_icms.replace(',', '.')),
        valor_icms: parseFloat(item.valor_icms.replace(',', '.')),
        aliquota_pis: parseFloat(item.aliquota_pis.replace(',', '.')),
        valor_pis: parseFloat(item.valor_pis.replace(',', '.')),
        aliquota_cofins: parseFloat(item.aliquota_cofins.replace(',', '.')),
        valor_cofins: parseFloat(item.valor_cofins.replace(',', '.')),
      })),
    }
  },
}

export default emissaoNFeService