export interface CreateOrUpdateServiceData {
  id?: string
  name: string
  price: number
}

export interface ServiceRequestData {
  /** 当前页码 */
  currentPage: number
  /** 查询条数 */
  size: number
  /** 查询参数：服务名 */
  name?: string
  /** 查询参数：描述 */
  desc?: string
}

export interface Service {
  id: string
  name: string
  desc: string
  price: number
  status: boolean
  createTime: string
  updateTime: string
}

export type ServiceResponseData = ApiResponseData<{
  list: Service[]
  total: number
}>
