<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { queryPageApi } from '@/api/log'

const rows = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const loadRows = async () => {
  loading.value = true
  try {
    const result = await queryPageApi(page.value, pageSize.value)
    if (result.code) {
      rows.value = result.data.rows
      total.value = result.data.total
    } else {
      ElMessage.error(result.msg || '日志列表加载失败')
    }
  } finally {
    loading.value = false
  }
}

const pageChanged = () => loadRows()
const pageSizeChanged = () => {
  page.value = 1
  loadRows()
}

onMounted(loadRows)
</script>

<template>
  <section>
    <h1>系统操作日志</h1>
    <p class="description">记录系统操作信息，可通过分页查看历史操作。</p>

    <el-table v-loading="loading" :data="rows" border>
      <el-table-column prop="id" label="日志编号" width="100" align="center" />
      <el-table-column prop="operateEmpName" label="操作人" width="120" align="center" />
      <el-table-column prop="operateTime" label="操作时间" min-width="180" align="center" />
      <el-table-column prop="className" label="操作类" min-width="220" show-overflow-tooltip />
      <el-table-column prop="methodName" label="方法" width="120" align="center" />
      <el-table-column prop="methodParams" label="方法参数" min-width="240" show-overflow-tooltip />
      <el-table-column prop="returnValue" label="返回结果" min-width="240" show-overflow-tooltip />
      <el-table-column label="耗时" width="100" align="center">
        <template #default="{ row }">{{ row.costTime }} ms</template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="pageSizeChanged"
        @current-change="pageChanged"
      />
    </div>
  </section>
</template>

<style scoped>
.description {
  margin: 12px 0 20px;
  color: #606266;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}
</style>
