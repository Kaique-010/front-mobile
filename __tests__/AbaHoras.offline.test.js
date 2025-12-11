jest.mock('componentsOrdemServico/services/syncService', () => ({
  enqueueOperation: jest.fn(async () => { global.__enqueue_called++ }),
}))

jest.mock('../utils/api', () => ({
  apiGetComContexto: jest.fn(async () => ({ results: [] })),
  apiPostComContexto: jest.fn(async () => {
    throw new Error('Network Error')
  }),
  apiPatchComContexto: jest.fn(async () => {
    throw new Error('Network Error')
  }),
}))
jest.mock('../hooks/useContextoApp', () => () => ({
  empresaId: 1,
  filialId: 1,
  usuarioId: 1,
}))

import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import AbaHoras from '../componentsOrdemServico/AbaHoras'

describe('AbaHoras offline', () => {
  beforeEach(() => {
    global.__enqueue_called = 0
  })
  it('enfileira ao falhar salvar dia', async () => {
    const { findByText } = render(<AbaHoras os_os={123} />)
    const btn = await findByText('Salvar Dia')
    fireEvent.press(btn)
    await waitFor(() => {
      const Toast = require('react-native-toast-message')
      expect(Toast.show).toHaveBeenCalled()
    })
  })
})
