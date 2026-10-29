import request from '@/utils/request'

export const queryPageApi = (params) => request.get('/students', { params })
export const addApi = (student) => request.post('/students', student)
export const queryByIdApi = (id) => request.get(`/students/${id}`)
export const updateApi = (student) => request.put('/students', student)
export const deleteByIdsApi = (ids) => request.delete(`/students/${ids.join(',')}`)
export const violationApi = (id, score) =>
  request.put(`/students/violation/${id}/${score}`)
