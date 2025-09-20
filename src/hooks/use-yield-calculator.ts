import { useState, useCallback, useMemo } from 'react'
import { calculateYield, YieldCalculation, YieldResult } from '~/utils/calculations'

export interface YieldCalculatorState {
  principal: number
  apy: number
  timeInDays: number
  compoundFrequency: 'daily' | 'weekly' | 'monthly' | 'annually'
}

export const useYieldCalculator = (initialState?: Partial<YieldCalculatorState>) => {
  const [state, setState] = useState<YieldCalculatorState>({
    principal: 1000,
    apy: 8.5,
    timeInDays: 365,
    compoundFrequency: 'daily',
    ...initialState,
  })

  const updatePrincipal = useCallback((principal: number) => {
    setState(prev => ({ ...prev, principal }))
  }, [])

  const updateAPY = useCallback((apy: number) => {
    setState(prev => ({ ...prev, apy }))
  }, [])

  const updateTimeInDays = useCallback((timeInDays: number) => {
    setState(prev => ({ ...prev, timeInDays }))
  }, [])

  const updateCompoundFrequency = useCallback((compoundFrequency: YieldCalculatorState['compoundFrequency']) => {
    setState(prev => ({ ...prev, compoundFrequency }))
  }, [])

  const updateState = useCallback((updates: Partial<YieldCalculatorState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  const result = useMemo((): YieldResult => {
    return calculateYield(state)
  }, [state])

  const reset = useCallback(() => {
    setState({
      principal: 1000,
      apy: 8.5,
      timeInDays: 365,
      compoundFrequency: 'daily',
    })
  }, [])

  return {
    state,
    result,
    updatePrincipal,
    updateAPY,
    updateTimeInDays,
    updateCompoundFrequency,
    updateState,
    reset,
  }
}