import { queryOptions } from '@tanstack/react-query'
import { getIncomeProfile } from './income-profile'

export function incomeProfileOptions() {
  return queryOptions({
    queryKey: ['income-profile'],
    queryFn: () => getIncomeProfile(),
  })
}
