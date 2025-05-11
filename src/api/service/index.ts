import { request } from "@/utils/service"
import type * as Service from "./types/service"

import "../../mock/index.js"
/** 增 */
export function createServiceApi(data: Service.CreateOrUpdateServiceData) {
  return request({
    url: "service",
    method: "post",
    data
  })
}

/** 删 */
export function deleteServiceApi(id: string) {
  return request({
    url: `service/${id}`,
    method: "delete"
  })
}

/** 改 */
export function updateServiceApi(data: Service.CreateOrUpdateServiceData) {
  return request({
    url: "service",
    method: "put",
    data
  })
}

/** 查 */
export function getServiceApi(params: Service.ServiceRequestData) {
  return request<Service.ServiceResponseData>({
    url: "service",
    method: "get",
    params
  })
}
