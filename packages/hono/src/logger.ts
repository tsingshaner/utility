import { getLogger as $getLogger } from '@logtape/logtape'

export const getLogger = (module: string) => $getLogger(['qingshaner', 'utils', module])
