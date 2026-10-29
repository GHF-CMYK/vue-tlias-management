<script setup>
import { ref, onMounted } from 'vue';
import { queryAllApi, addApi, queryByIdApi, updateApi, deleteByIdApi } from '@/api/dept';
import { ElMessage, ElMessageBox } from 'element-plus';

const deptList = ref([])
const loading = ref(false)
const search = async () => {
  loading.value = true
  try {
    const result = await queryAllApi()
    if (result.code && Array.isArray(result.data)) {
      deptList.value = result.data
    } else {
      ElMessage.error(result.msg || '部门列表加载失败')
    }
  } finally {
    loading.value = false
  }
}

onMounted(search)

const dialogFormVisible = ref(false);
const formTitle = ref('');
const dept = ref({name: ''});
const saving = ref(false)

const addDept = () => {
  resetForm()
  formTitle.value = '新增部门'
  dept.value = { name: '' }
  dialogFormVisible.value = true
}

const resetForm = () => {
  deptFormRef.value?.resetFields()
}

const deptFormRef = ref()

const rules = {
  name: [
    { required: true, message: '部门名称是必填项', trigger: 'blur' },
    { min: 2, max: 10, message: '部门名称的长度应该在2-10位', trigger: 'blur' }
  ]
}

const save = async () => {
  if (!deptFormRef.value || saving.value) return

  const valid = await deptFormRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    const result = dept.value.id
      ? await updateApi(dept.value)
      : await addApi(dept.value)

    if (result.code) {
      ElMessage.success('操作成功')
      dialogFormVisible.value = false
      await search()
    } else {
      ElMessage.error(result.msg || '操作失败')
    }
  } finally {
    saving.value = false
  }
}

const editingId = ref(null)
const edit = async (id) => {
  if (editingId.value !== null) return

  editingId.value = id
  try {
    const result = await queryByIdApi(id)
    if (result.code) {
      resetForm()
      dept.value = result.data
      formTitle.value = '修改部门'
      dialogFormVisible.value = true
    } else {
      ElMessage.error(result.msg || '部门信息加载失败')
    }
  } finally {
    editingId.value = null
  }
}

const deletingId = ref(null)
const delById = async (id) => {
  try {
    await ElMessageBox.confirm('您确认删除该部门吗?', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })

    deletingId.value = id
    const result = await deleteByIdApi(id)
    if (result.code) {
      ElMessage.success('删除成功')
      await search()
    } else {
      ElMessage.error(result.msg || '删除失败')
    }
  } catch (error) {
    if (error === 'cancel' || error === 'close') {
      if (error === 'cancel') ElMessage.info('您已取消删除')
      return
    }
    throw error
  } finally {
    deletingId.value = null
  }
}

</script>

<template>
  <h1>部门管理</h1>
  <div class="container">
    <el-button type="primary" @click="addDept"> + 新增部门</el-button>
  </div>

  <!-- 表格 -->
  <div class="container">
    <el-table v-loading="loading" :data="deptList" border style="width: 100%">
      <el-table-column type="index" label="序号" width="100" align="center"/>
      <el-table-column prop="name" label="部门名称" width="180" align="center"/>
      <el-table-column prop="updateTime" label="最后操作时间" width="300" align="center"/>
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button type="primary" size="small" :loading="editingId === scope.row.id" :disabled="editingId !== null" @click="edit(scope.row.id)"><el-icon><EditPen /></el-icon> 编辑</el-button>
          <el-button type="danger" size="small" :loading="deletingId === scope.row.id" :disabled="deletingId !== null" @click="delById(scope.row.id)"><el-icon><Delete /></el-icon> 删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <!-- Dialog对话框 -->
  <el-dialog v-model="dialogFormVisible" :title="formTitle" width="500" @closed="resetForm">
    <el-form :model="dept" :rules="rules" ref="deptFormRef">
      <el-form-item label="部门名称" label-width="80px" prop="name">
        <el-input v-model="dept.name" maxlength="10" show-word-limit />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button :disabled="saving" @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">确定</el-button>
      </div>
    </template>
  </el-dialog>

</template>

<style scoped>
.container {
  margin: 15px 0px;
}
</style>
