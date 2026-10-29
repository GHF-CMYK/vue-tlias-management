<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { queryAllApi as queryAllEmpsApi } from '@/api/emp'
import {
  addApi,
  deleteByIdApi,
  queryByIdApi,
  queryPageApi,
  updateApi
} from '@/api/clazz'

const subjectOptions = [
  { label: 'Java', value: 1 },
  { label: '前端', value: 2 },
  { label: '大数据', value: 3 },
  { label: 'Python', value: 4 },
  { label: 'Go', value: 5 },
  { label: '嵌入式', value: 6 }
]

const searchForm = ref({ name: '', dateRange: [] })
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const rows = ref([])
const loading = ref(false)

const loadRows = async () => {
  loading.value = true
  try {
    const [begin, end] = searchForm.value.dateRange || []
    const result = await queryPageApi({
      name: searchForm.value.name.trim(),
      begin: begin || '',
      end: end || '',
      page: page.value,
      pageSize: pageSize.value
    })
    if (result.code) {
      rows.value = result.data.rows
      total.value = result.data.total
    } else {
      ElMessage.error(result.msg || '班级列表加载失败')
    }
  } finally {
    loading.value = false
  }
}

const search = () => {
  page.value = 1
  loadRows()
}

const clearSearch = () => {
  searchForm.value = { name: '', dateRange: [] }
  search()
}

const pageChanged = () => loadRows()
const pageSizeChanged = () => {
  page.value = 1
  loadRows()
}

const dialogVisible = ref(false)
const dialogTitle = ref('')
const saving = ref(false)
const formRef = ref()
const teachers = ref([])
const defaultClazz = () => ({
  name: '',
  room: '',
  dateRange: [],
  masterId: '',
  subject: ''
})
const clazz = ref(defaultClazz())
const rules = {
  name: [{ required: true, message: '请输入班级名称', trigger: 'blur' }],
  room: [{ required: true, message: '请输入教室', trigger: 'blur' }],
  dateRange: [{ required: true, message: '请选择开班和结课日期', trigger: 'change' }],
  masterId: [{ required: true, message: '请选择班主任', trigger: 'change' }],
  subject: [{ required: true, message: '请选择学科', trigger: 'change' }]
}

const openAdd = () => {
  clazz.value = defaultClazz()
  formRef.value?.clearValidate()
  dialogTitle.value = '新增班级'
  dialogVisible.value = true
}

const openEdit = async (id) => {
  const result = await queryByIdApi(id)
  if (!result.code) {
    ElMessage.error(result.msg || '班级信息加载失败')
    return
  }
  clazz.value = {
    ...result.data,
    dateRange: [result.data.beginDate, result.data.endDate],
    subject: Number(result.data.subject),
    masterId: Number(result.data.masterId)
  }
  formRef.value?.clearValidate()
  dialogTitle.value = '编辑班级'
  dialogVisible.value = true
}

const save = async () => {
  if (!formRef.value || saving.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  const [beginDate, endDate] = clazz.value.dateRange || []
  if (!beginDate || !endDate || beginDate > endDate) {
    ElMessage.error('请选择有效的开班和结课日期')
    return
  }

  saving.value = true
  try {
    const payload = {
      ...clazz.value,
      beginDate,
      endDate,
      masterId: Number(clazz.value.masterId),
      subject: Number(clazz.value.subject)
    }
    const result = payload.id ? await updateApi(payload) : await addApi(payload)
    if (result.code) {
      ElMessage.success('保存成功')
      dialogVisible.value = false
      await loadRows()
    } else {
      ElMessage.error(result.msg || '保存失败')
    }
  } finally {
    saving.value = false
  }
}

const deleteClazz = async (id) => {
  try {
    await ElMessageBox.confirm('确认删除该班级吗？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch (reason) {
    if (reason === 'cancel' || reason === 'close') return
    throw reason
  }

  const result = await deleteByIdApi(id)
  if (result.code) {
    ElMessage.success('删除成功')
    if (rows.value.length === 1 && page.value > 1) page.value -= 1
    await loadRows()
  } else {
    ElMessage.error(result.msg || '删除失败')
  }
}

const loadTeachers = async () => {
  const result = await queryAllEmpsApi()
  if (result.code) {
    teachers.value = result.data
  } else {
    ElMessage.error(result.msg || '班主任列表加载失败')
  }
}

const subjectLabel = (value) =>
  subjectOptions.find((option) => option.value === Number(value))?.label || '未知'

onMounted(() => {
  loadRows()
  loadTeachers()
})
</script>

<template>
  <section>
    <h1>班级管理</h1>
    <el-form :inline="true" :model="searchForm" class="container">
      <el-form-item label="班级名称">
        <el-input v-model="searchForm.name" clearable placeholder="请输入班级名称" @keyup.enter="search" />
      </el-form-item>
      <el-form-item label="开班时间">
        <el-date-picker
          v-model="searchForm.dateRange"
          type="daterange"
          value-format="YYYY-MM-DD"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="search">查询</el-button>
        <el-button @click="clearSearch">清空</el-button>
      </el-form-item>
    </el-form>

    <div class="container">
      <el-button type="primary" @click="openAdd">+ 新增班级</el-button>
    </div>

    <el-table v-loading="loading" :data="rows" border>
      <el-table-column prop="name" label="班级名称" min-width="160" />
      <el-table-column prop="room" label="教室" width="100" align="center" />
      <el-table-column prop="beginDate" label="开班时间" width="130" align="center" />
      <el-table-column prop="endDate" label="结课时间" width="130" align="center" />
      <el-table-column prop="masterName" label="班主任" width="120" align="center" />
      <el-table-column label="学科" width="110" align="center">
        <template #default="{ row }">{{ subjectLabel(row.subject) }}</template>
      </el-table-column>
      <el-table-column prop="status" label="班级状态" width="110" align="center" />
      <el-table-column prop="updateTime" label="最后操作时间" min-width="180" align="center" />
      <el-table-column label="操作" width="160" fixed="right" align="center">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row.id)">编辑</el-button>
          <el-button link type="danger" @click="deleteClazz(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[5, 10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="pageSizeChanged"
        @current-change="pageChanged"
      />
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" @closed="formRef?.resetFields()">
      <el-form ref="formRef" :model="clazz" :rules="rules" label-width="100px">
        <el-form-item label="班级名称" prop="name">
          <el-input v-model="clazz.name" maxlength="30" />
        </el-form-item>
        <el-form-item label="教室" prop="room">
          <el-input v-model="clazz.room" maxlength="20" />
        </el-form-item>
        <el-form-item label="开班时间" prop="dateRange">
          <el-date-picker
            v-model="clazz.dateRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            range-separator="至"
            start-placeholder="开班日期"
            end-placeholder="结课日期"
          />
        </el-form-item>
        <el-form-item label="班主任" prop="masterId">
          <el-select v-model="clazz.masterId" filterable placeholder="请选择班主任" style="width: 100%">
            <el-option v-for="teacher in teachers" :key="teacher.id" :label="teacher.name" :value="teacher.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="学科" prop="subject">
          <el-select v-model="clazz.subject" placeholder="请选择学科" style="width: 100%">
            <el-option v-for="subject in subjectOptions" :key="subject.value" :label="subject.label" :value="subject.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button :disabled="saving" @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<style scoped>
.container {
  margin: 16px 0;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}
</style>
