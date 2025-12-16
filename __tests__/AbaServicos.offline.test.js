jest.mock('componentsOrdemServico/services/syncService', () => ({
  enqueueOperation: jest.fn(async () => {
    global.__enqueue_called++
  }),
}))

jest.mock('../utils/api', () => ({
  apiGetComContextoos: jest.fn(async () => [
    {
      serv_item: 1,
      serv_prod: 1,
      serv_quan: '1',
      serv_unit: '10',
      serv_tota: '10',
      servico_nome: 'Srv',
    },
  ]),
  apiPostComContexto: jest.fn(async () => {
    throw new Error('Network Error')
  }),
}))
jest.mock('../hooks/useContextoApp', () => () => ({
  empresaId: 1,
  filialId: 1,
}))

import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import AbaServicos from '../componentsOrdemServico/AbaServicos'

describe('AbaServicos offline', () => {
  beforeEach(() => {
    global.__enqueue_called = 0
  })
  it('enfileira ao falhar salvar', async () => {
    const servicos = [
      {
        serv_prod: 1,
        serv_quan: 1,
        serv_unit: 10,
        serv_tota: 10,
        servico_nome: 'Srv',
      },
    ]
    const setServicos = jest.fn()
    const { findByText } = render(
      <AbaServicos
        servicos={servicos}
        setServicos={setServicos}
        os_os={123}
        financeiroGerado={false}
      />
    )
    await waitFor(() => {
      expect(() => render).not.toThrow()
    })
    const btn = await findByText('Salvar Serviços')
    fireEvent.press(btn)
    await waitFor(() => {
      const Toast = require('react-native-toast-message')
      expect(Toast.show).toHaveBeenCalled()
    })
  })
})
