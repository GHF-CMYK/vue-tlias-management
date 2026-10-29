import request from '@/utils/request'

export const queryEmpGenderApi = () => request.get('/report/empGenderData')
export const queryEmpJobApi = () => request.get('/report/empJobData')
export const queryStudentDegreeApi = () => request.get('/report/studentDegreeData')
export const queryStudentCountApi = () => request.get('/report/studentCountData')
