import request from '@/utils/request'

export const queryPageApi = (params) => request.get('/clazzs', { params })
export const queryAllApi = () => request.get('/clazzs/list')
export const addApi = (clazz) => request.post('/clazzs', clazz)
export const queryByIdApi = (id) => request.get(`/clazzs/${id}`)
export const updateApi = (clazz) => request.put('/clazzs', clazz)
export const deleteByIdApi = (id) => request.delete(`/clazzs/${id}`)
