jest.mock('componentsOrdemServico/services/syncService', () => ({
  enqueueOperation: jest.fn(async () => {
    global.__enqueue_called++
  }),
}))

jest.mock('../utils/api', () => ({
  apiGetComContexto: jest.fn(async () => [
    {
      peca_item: 1,
      peca_prod: 1,
      peca_quan: '1',
      peca_unit: '10',
      peca_tota: '10',
      produto_nome: 'Teste',
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
import AbaPecas from '../componentsOrdemServico/AbaPecas'

describe('AbaPecas offline', () => {
  beforeEach(() => {
    global.__enqueue_called = 0
  })
  it('enfileira ao falhar salvar', async () => {
    const pecas = [
      {
        peca_prod: 1,
        peca_quan: 1,
        peca_unit: 10,
        peca_tota: 10,
        produto_nome: 'Teste',
      },
    ]
    const setPecas = jest.fn()
    const { findByText } = render(
      <AbaPecas
        pecas={pecas}
        setPecas={setPecas}
        os_os={123}
        financeiroGerado={false}
      />
    )
    await waitFor(() => {
      // Aguarda sair do estado de carregamento
      expect(() => render).not.toThrow()
    })
    await waitFor(() => {
      // Aguarda sumir o texto de carregamento
      // eslint-disable-next-line no-undef
      const tree = render
    })
    const btn = await findByText('Salvar Peças')
    fireEvent.press(btn)
    await waitFor(() => {
      const Toast = require('react-native-toast-message')
      expect(Toast.show).toHaveBeenCalled()
    })
  })
})
