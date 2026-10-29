import request from '@/utils/request'

export const queryPageApi = (page, pageSize) =>
  request.get('/log/page', { params: { page, pageSize } })
