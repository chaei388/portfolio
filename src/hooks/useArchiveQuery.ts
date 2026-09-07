import { useEffect, useState } from 'react'
import { archiveError } from '../lib/archiveApi'

export function useArchiveQuery<T>(load: (signal: AbortSignal) => Promise<T>, scope = '') {
  const [revision, setRevision] = useState(0)
  const [result, setResult] = useState<{
    load: typeof load | null; scope: string; revision: number; data: T | null; error: string
  }>({ load: null, scope: '', revision: -1, data: null, error: '' })

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ load, scope, revision, data, error: '' })
      },
      (error: unknown) => {
        if (!controller.signal.aborted) setResult({ load, scope, revision, data: null, error: archiveError(error) })
      },
    )
    return () => controller.abort()
  }, [load, scope, revision])

  const loading = result.load !== load || result.scope !== scope || result.revision !== revision
  return {
    data: loading ? null : result.data,
    error: loading ? '' : result.error,
    loading,
    refresh: () => setRevision((current) => current + 1),
  }
}
