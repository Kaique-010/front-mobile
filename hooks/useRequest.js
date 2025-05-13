import { useState, useEffect } from 'react'
import { request } from '../utils/api'

export const useRequest = ({
  endpoint,
  method = 'get',
  params = {},
  data = {},
  enabled = true,
}) => {
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await request({ method, endpoint, params, data })
      setResponse(res)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (enabled) fetchData()
  }, [endpoint, JSON.stringify(params), JSON.stringify(data), enabled])

  return { data: response, loading, error, refetch: fetchData }
}
