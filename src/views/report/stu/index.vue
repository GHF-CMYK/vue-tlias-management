<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { queryStudentCountApi, queryStudentDegreeApi } from '@/api/report'

const loading = ref(false)
const degreeData = ref([])
const classData = ref({ clazzList: [], dataList: [] })
const degreeColors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#9b59b6', '#13c2c2']
const classColors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399']

const degreeTotal = computed(() =>
  degreeData.value.reduce((sum, item) => sum + Number(item.value || 0), 0)
)
const degreeGradient = computed(() => {
  if (!degreeTotal.value) return '#ebeef5'
  let start = 0
  const sections = degreeData.value.map((item, index) => {
    const end = start + (Number(item.value || 0) / degreeTotal.value) * 100
    const section = `${degreeColors[index % degreeColors.length]} ${start}% ${end}%`
    start = end
    return section
  })
  return `conic-gradient(${sections.join(', ')})`
})
const classRows = computed(() =>
  classData.value.clazzList.map((name, index) => ({
    name,
    count: Number(classData.value.dataList[index] || 0),
    color: classColors[index % classColors.length]
  }))
)
const maxClassCount = computed(() => Math.max(1, ...classRows.value.map((item) => item.count)))

const loadReports = async () => {
  loading.value = true
  try {
    const [degreeResult, countResult] = await Promise.all([
      queryStudentDegreeApi(),
      queryStudentCountApi()
    ])
    if (degreeResult.code && Array.isArray(degreeResult.data)) {
      degreeData.value = degreeResult.data
    } else {
      ElMessage.error(degreeResult.msg || '学员学历统计加载失败')
    }

    if (
      countResult.code &&
      Array.isArray(countResult.data.clazzList) &&
      Array.isArray(countResult.data.dataList)
    ) {
      classData.value = countResult.data
    } else {
      ElMessage.error(countResult.msg || '班级人数统计加载失败')
    }
  } finally {
    loading.value = false
  }
}

onMounted(loadReports)
</script>

<template>
  <section v-loading="loading" class="report-page">
    <div class="page-heading">
      <div>
        <h1>学员信息统计</h1>
        <p>查看学员学历构成与班级人数分布</p>
      </div>
      <el-button :loading="loading" @click="loadReports">刷新数据</el-button>
    </div>

    <el-row :gutter="20">
      <el-col :xs="24" :lg="10">
        <el-card class="report-card" shadow="never">
          <template #header><strong>学员学历分布</strong></template>
          <div class="degree-chart">
            <div class="donut" :style="{ background: degreeGradient }">
              <div class="donut-center">
                <strong>{{ degreeTotal }}</strong>
                <span>学员总数</span>
              </div>
            </div>
            <div v-if="degreeData.length" class="legend">
              <div v-for="(item, index) in degreeData" :key="item.name" class="legend-row">
                <span class="legend-name">
                  <i :style="{ backgroundColor: degreeColors[index % degreeColors.length] }"></i>
                  {{ item.name }}
                </span>
                <strong>{{ item.value }}</strong>
                <span class="percentage">
                  {{ degreeTotal ? ((Number(item.value) / degreeTotal) * 100).toFixed(1) : 0 }}%
                </span>
              </div>
            </div>
            <el-empty v-else description="暂无统计数据" :image-size="70" />
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="14">
        <el-card class="report-card" shadow="never">
          <template #header><strong>各班级学员人数</strong></template>
          <div v-if="classRows.length" class="class-chart">
            <div v-for="row in classRows" :key="row.name" class="bar-row">
              <el-tooltip :content="row.name" placement="top">
                <span class="bar-label">{{ row.name }}</span>
              </el-tooltip>
              <div class="bar-track">
                <div
                  class="bar-fill"
                  :style="{ width: `${(row.count / maxClassCount) * 100}%`, backgroundColor: row.color }"
                ></div>
              </div>
              <strong class="bar-value">{{ row.count }}</strong>
            </div>
          </div>
          <el-empty v-else description="暂无统计数据" :image-size="70" />
        </el-card>
      </el-col>
    </el-row>
  </section>
</template>

<style scoped>
.page-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h1 {
  margin: 0;
  font-size: 24px;
}

.page-heading p {
  margin: 8px 0 0;
  color: #909399;
}

.report-card {
  min-height: 360px;
  margin-bottom: 20px;
  border-radius: 10px;
}

.degree-chart {
  display: flex;
  min-height: 270px;
  align-items: center;
  justify-content: space-evenly;
  gap: 20px;
}

.donut {
  display: grid;
  width: 190px;
  height: 190px;
  flex: 0 0 190px;
  place-items: center;
  border-radius: 50%;
}

.donut-center {
  display: flex;
  width: 118px;
  height: 118px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #fff;
}

.donut-center strong {
  font-size: 28px;
}

.donut-center span,
.percentage {
  color: #909399;
  font-size: 13px;
}

.legend {
  width: min(230px, 100%);
}

.legend-row {
  display: grid;
  grid-template-columns: 1fr 45px 55px;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px solid #f0f2f5;
}

.legend-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-name i {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.class-chart {
  display: flex;
  min-height: 270px;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
  padding: 10px 4px;
}

.bar-row {
  display: grid;
  grid-template-columns: minmax(90px, 180px) minmax(50px, 1fr) 35px;
  align-items: center;
  gap: 12px;
}

.bar-label {
  overflow: hidden;
  color: #606266;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bar-track {
  height: 16px;
  overflow: hidden;
  border-radius: 8px;
  background: #f2f3f5;
}

.bar-fill {
  height: 100%;
  min-width: 2px;
  border-radius: inherit;
  transition: width 0.3s ease;
}

.bar-value {
  color: #606266;
}

@media (max-width: 700px) {
  .degree-chart {
    flex-direction: column;
    padding: 16px 0;
  }

  .legend {
    width: 100%;
  }
}
</style>
