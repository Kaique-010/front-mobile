// NotificacaoComponent.jsx
import React, { useState, useEffect } from 'react'
import Service from '../notificacoes/Service'

const NotificacaoComponent = () => {
  const [notificacoes, setNotificacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [contadorNaoLidas, setContadorNaoLidas] = useState(0)

  useEffect(() => {
    carregarNotificacoes()

    const interval = setInterval(carregarNotificacoes, 30000)

    return () => clearInterval(interval)
  }, [])

  const carregarNotificacoes = async () => {
    try {
      setLoading(true)
      const dados = await Service.listarNotificacoes()
      setNotificacoes(dados)

      // Contar não lidas
      const naoLidas = dados.filter((n) => !n.lida).length
      setContadorNaoLidas(naoLidas)
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    } finally {
      setLoading(false)
    }
  }

  const marcarComoLida = async (id) => {
    try {
      await Service.marcarComoLida(id)

      // Atualizar estado local
      setNotificacoes((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, lida: true } : notif
        )
      )

      setContadorNaoLidas((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Erro ao marcar como lida:', error)
    }
  }

  const getPrioridadeClass = (prioridade) => {
    const classes = {
      alta: 'border-red-500 bg-red-50',
      media: 'border-yellow-500 bg-yellow-50',
      baixa: 'border-blue-500 bg-blue-50',
    }
    return classes[prioridade] || classes.media
  }

  const getTipoIcon = (tipo) => {
    const icons = {
      estoque: '📦',
      financeiro: '💰',
      vendas: '🛒',
      resumo: '📊',
    }
    return icons[tipo] || '📢'
  }

  if (loading) {
    return <div className="p-4">Carregando notificações...</div>
  }

  return (
    <div className="notificacoes-container">
      {/* Header com contador */}
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-bold">Notificações</h2>
        {contadorNaoLidas > 0 && (
          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm">
            {contadorNaoLidas} nova(s)
          </span>
        )}
      </div>

      {/* Lista de notificações */}
      <div className="max-h-96 overflow-y-auto">
        {notificacoes.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Nenhuma notificação encontrada
          </div>
        ) : (
          notificacoes.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 border-l-4 mb-2 cursor-pointer transition-all ${getPrioridadeClass(
                notif.prioridade
              )} ${notif.lida ? 'opacity-60' : ''}`}
              onClick={() => !notif.lida && marcarComoLida(notif.id)}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{getTipoIcon(notif.tipo)}</span>
                  <div>
                    <h3
                      className={`font-semibold ${
                        notif.lida ? 'text-gray-600' : 'text-gray-900'
                      }`}>
                      {notif.titulo}
                    </h3>
                    <p
                      className={`text-sm mt-1 ${
                        notif.lida ? 'text-gray-500' : 'text-gray-700'
                      }`}>
                      {notif.mensagem}
                    </p>
                    <span className="text-xs text-gray-400 mt-2 block">
                      {new Date(notif.data_criacao).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>

                {!notif.lida && (
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default NotificacaoComponent
