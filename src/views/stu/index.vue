<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { queryAllApi as queryAllClazzesApi } from '@/api/clazz'
import {
  addApi,
  deleteByIdsApi,
  queryByIdApi,
  queryPageApi,
  updateApi,
  violationApi
} from '@/api/stu'

const degreeOptions = [
  { label: '初中', value: 1 },
  { label: '高中', value: 2 },
  { label: '大专', value: 3 },
  { label: '本科', value: 4 },
  { label: '硕士', value: 5 },
  { label: '博士', value: 6 }
]
const searchForm = ref({ name: '', degree: '', clazzId: '' })
const rows = ref([])
const clazzes = ref([])
const selectedIds = ref([])
const tableRef = ref()
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const loadRows = async () => {
  loading.value = true
  try {
    const result = await queryPageApi({
      name: searchForm.value.name.trim(),
      degree: searchForm.value.degree,
      clazzId: searchForm.value.clazzId,
      page: page.value,
      pageSize: pageSize.value
    })
    if (result.code) {
      rows.value = result.data.rows
      total.value = result.data.total
      selectedIds.value = []
      tableRef.value?.clearSelection()
    } else {
      ElMessage.error(result.msg || '学员列表加载失败')
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
  searchForm.value = { name: '', degree: '', clazzId: '' }
  search()
}

const pageChanged = () => loadRows()
const pageSizeChanged = () => {
  page.value = 1
  loadRows()
}

const onSelectionChange = (selection) => {
  selectedIds.value = selection.map((student) => student.id)
}

const defaultStudent = () => ({
  name: '',
  no: '',
  gender: '',
  phone: '',
  degree: '',
  idCard: '',
  isCollege: '',
  address: '',
  graduationDate: '',
  clazzId: ''
})
const student = ref(defaultStudent())
const dialogVisible = ref(false)
const dialogTitle = ref('')
const saving = ref(false)
const formRef = ref()
const rules = {
  name: [
    { required: true, message: '请输入学员姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '姓名长度应在2到10个字符之间', trigger: 'blur' }
  ],
  no: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号', trigger: 'blur' }
  ],
  degree: [{ required: true, message: '请选择学历', trigger: 'change' }],
  idCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /^\d{17}[\dXx]$/, message: '请输入有效的18位身份证号', trigger: 'blur' }
  ],
  isCollege: [{ required: true, message: '请选择是否为本校学员', trigger: 'change' }],
  clazzId: [{ required: true, message: '请选择班级', trigger: 'change' }]
}

const openAdd = () => {
  student.value = defaultStudent()
  formRef.value?.clearValidate()
  dialogTitle.value = '新增学员'
  dialogVisible.value = true
}

const openEdit = async (id) => {
  const result = await queryByIdApi(id)
  if (!result.code) {
    ElMessage.error(result.msg || '学员信息加载失败')
    return
  }
  student.value = { ...defaultStudent(), ...result.data }
  formRef.value?.clearValidate()
  dialogTitle.value = '编辑学员'
  dialogVisible.value = true
}

const save = async () => {
  if (!formRef.value || saving.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    const payload = {
      ...student.value,
      gender: Number(student.value.gender),
      degree: Number(student.value.degree),
      isCollege: Number(student.value.isCollege),
      clazzId: Number(student.value.clazzId)
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

const deleteSelected = async () => {
  if (!selectedIds.value.length) {
    ElMessage.info('请先选择要删除的学员')
    return
  }

  try {
    await ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 名学员吗？`, '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch (reason) {
    if (reason === 'cancel' || reason === 'close') return
    throw reason
  }

  const result = await deleteByIdsApi(selectedIds.value)
  if (result.code) {
    ElMessage.success('删除成功')
    if (rows.value.length <= selectedIds.value.length && page.value > 1) page.value -= 1
    await loadRows()
  } else {
    ElMessage.error(result.msg || '删除失败')
  }
}

const violationVisible = ref(false)
const violationTarget = ref(null)
const violationScore = ref(1)
const violationSaving = ref(false)

const openViolation = (row) => {
  violationTarget.value = row
  violationScore.value = 1
  violationVisible.value = true
}

const submitViolation = async () => {
  if (!violationTarget.value || violationSaving.value) return
  violationSaving.value = true
  try {
    const result = await violationApi(violationTarget.value.id, violationScore.value)
    if (result.code) {
      ElMessage.success('违纪处理成功')
      violationVisible.value = false
      await loadRows()
    } else {
      ElMessage.error(result.msg || '违纪处理失败')
    }
  } finally {
    violationSaving.value = false
  }
}

const degreeLabel = (value) =>
  degreeOptions.find((option) => option.value === Number(value))?.label || '-'
const genderLabel = (value) => (Number(value) === 1 ? '男' : '女')

const loadClazzes = async () => {
  const result = await queryAllClazzesApi()
  if (result.code) {
    clazzes.value = result.data
  } else {
    ElMessage.error(result.msg || '班级列表加载失败')
  }
}

onMounted(() => {
  loadRows()
  loadClazzes()
})
</script>

<template>
  <section>
    <h1>学员管理</h1>
    <el-form :inline="true" :model="searchForm" class="container">
      <el-form-item label="姓名">
        <el-input v-model="searchForm.name" clearable placeholder="请输入姓名" @keyup.enter="search" />
      </el-form-item>
      <el-form-item label="学历">
        <el-select v-model="searchForm.degree" clearable placeholder="请选择学历" style="width: 130px">
          <el-option v-for="degree in degreeOptions" :key="degree.value" :label="degree.label" :value="degree.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="班级">
        <el-select v-model="searchForm.clazzId" clearable filterable placeholder="请选择班级" style="width: 180px">
          <el-option v-for="item in clazzes" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="search">查询</el-button>
        <el-button @click="clearSearch">清空</el-button>
      </el-form-item>
    </el-form>

    <div class="container">
      <el-button type="primary" @click="openAdd">+ 新增学员</el-button>
      <el-button type="danger" :disabled="!selectedIds.length" @click="deleteSelected">批量删除</el-button>
    </div>

    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="rows"
      border
      @selection-change="onSelectionChange"
    >
      <el-table-column type="selection" width="48" align="center" />
      <el-table-column prop="no" label="学号" width="130" align="center" />
      <el-table-column prop="name" label="姓名" width="120" align="center" />
      <el-table-column label="性别" width="80" align="center">
        <template #default="{ row }">{{ genderLabel(row.gender) }}</template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号" width="130" align="center" />
      <el-table-column label="学历" width="90" align="center">
        <template #default="{ row }">{{ degreeLabel(row.degree) }}</template>
      </el-table-column>
      <el-table-column label="本校学员" width="100" align="center">
        <template #default="{ row }">{{ Number(row.isCollege) === 1 ? '是' : '否' }}</template>
      </el-table-column>
      <el-table-column prop="clazzName" label="班级" min-width="140" align="center" />
      <el-table-column prop="violationCount" label="违纪次数" width="90" align="center" />
      <el-table-column prop="violationScore" label="违纪扣分" width="90" align="center" />
      <el-table-column prop="updateTime" label="最后操作时间" min-width="175" align="center" />
      <el-table-column label="操作" width="190" fixed="right" align="center">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row.id)">编辑</el-button>
          <el-button link type="warning" @click="openViolation(row)">违纪</el-button>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="680px" @closed="formRef?.resetFields()">
      <el-form ref="formRef" :model="student" :rules="rules" label-width="105px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="student.name" maxlength="10" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学号" prop="no">
              <el-input v-model="student.no" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-select v-model="student.gender" placeholder="请选择" style="width: 100%">
                <el-option label="男" :value="1" />
                <el-option label="女" :value="2" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="student.phone" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学历" prop="degree">
              <el-select v-model="student.degree" placeholder="请选择" style="width: 100%">
                <el-option v-for="degree in degreeOptions" :key="degree.value" :label="degree.label" :value="degree.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="身份证号" prop="idCard">
              <el-input v-model="student.idCard" maxlength="18" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="本校学员" prop="isCollege">
              <el-select v-model="student.isCollege" placeholder="请选择" style="width: 100%">
                <el-option label="是" :value="1" />
                <el-option label="否" :value="0" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="班级" prop="clazzId">
              <el-select v-model="student.clazzId" filterable placeholder="请选择班级" style="width: 100%">
                <el-option v-for="item in clazzes" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="毕业日期">
              <el-date-picker v-model="student.graduationDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="联系地址">
              <el-input v-model="student.address" maxlength="100" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button :disabled="saving" @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="violationVisible" title="学员违纪处理" width="420px">
      <p>学员：{{ violationTarget?.name }}</p>
      <el-form label-width="90px" class="violation-form">
        <el-form-item label="扣分">
          <el-input-number v-model="violationScore" :min="1" :max="100" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button :disabled="violationSaving" @click="violationVisible = false">取消</el-button>
        <el-button type="primary" :loading="violationSaving" @click="submitViolation">确认处理</el-button>
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

.violation-form {
  margin-top: 20px;
}
</style>
