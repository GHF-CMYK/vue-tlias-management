<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { queryEmpGenderApi, queryEmpJobApi } from '@/api/report'

const loading = ref(false)
const genderData = ref([])
const jobData = ref({ jobList: [], dataList: [] })
const genderColors = ['#409eff', '#f56c6c']
const jobColors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#9b59b6']

const genderTotal = computed(() =>
  genderData.value.reduce((sum, item) => sum + Number(item.value || 0), 0)
)
const genderGradient = computed(() => {
  if (!genderTotal.value) return '#ebeef5'
  let start = 0
  const sections = genderData.value.map((item, index) => {
    const end = start + (Number(item.value || 0) / genderTotal.value) * 100
    const section = `${genderColors[index % genderColors.length]} ${start}% ${end}%`
    start = end
    return section
  })
  return `conic-gradient(${sections.join(', ')})`
})
const jobRows = computed(() =>
  jobData.value.jobList.map((name, index) => ({
    name,
    count: Number(jobData.value.dataList[index] || 0),
    color: jobColors[index % jobColors.length]
  }))
)
const maxJobCount = computed(() => Math.max(1, ...jobRows.value.map((item) => item.count)))

const loadReports = async () => {
  loading.value = true
  try {
    const [genderResult, jobResult] = await Promise.all([
      queryEmpGenderApi(),
      queryEmpJobApi()
    ])
    if (genderResult.code && Array.isArray(genderResult.data)) {
      genderData.value = genderResult.data
    } else {
      ElMessage.error(genderResult.msg || '员工性别统计加载失败')
    }

    if (
      jobResult.code &&
      Array.isArray(jobResult.data.jobList) &&
      Array.isArray(jobResult.data.dataList)
    ) {
      jobData.value = jobResult.data
    } else {
      ElMessage.error(jobResult.msg || '员工职位统计加载失败')
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
        <h1>员工信息统计</h1>
        <p>查看员工性别分布与各职位人数</p>
      </div>
      <el-button :loading="loading" @click="loadReports">刷新数据</el-button>
    </div>

    <el-row :gutter="20">
      <el-col :xs="24" :lg="10">
        <el-card class="report-card" shadow="never">
          <template #header><strong>员工性别分布</strong></template>
          <div class="gender-chart">
            <div class="donut" :style="{ background: genderGradient }">
              <div class="donut-center">
                <strong>{{ genderTotal }}</strong>
                <span>员工总数</span>
              </div>
            </div>
            <div v-if="genderData.length" class="legend">
              <div v-for="(item, index) in genderData" :key="item.name" class="legend-row">
                <span class="legend-name">
                  <i :style="{ backgroundColor: genderColors[index % genderColors.length] }"></i>
                  {{ item.name }}
                </span>
                <strong>{{ item.value }}</strong>
                <span class="percentage">
                  {{ genderTotal ? ((Number(item.value) / genderTotal) * 100).toFixed(1) : 0 }}%
                </span>
              </div>
            </div>
            <el-empty v-else description="暂无统计数据" :image-size="70" />
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="14">
        <el-card class="report-card" shadow="never">
          <template #header><strong>各职位员工人数</strong></template>
          <div v-if="jobRows.length" class="job-chart">
            <div v-for="row in jobRows" :key="row.name" class="bar-row">
              <span class="bar-label">{{ row.name }}</span>
              <div class="bar-track">
                <div
                  class="bar-fill"
                  :style="{ width: `${(row.count / maxJobCount) * 100}%`, backgroundColor: row.color }"
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

.gender-chart {
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
  padding: 12px 0;
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

.job-chart {
  display: flex;
  min-height: 270px;
  flex-direction: column;
  justify-content: center;
  gap: 22px;
  padding: 10px 4px;
}

.bar-row {
  display: grid;
  grid-template-columns: 85px minmax(50px, 1fr) 35px;
  align-items: center;
  gap: 12px;
}

.bar-label {
  color: #606266;
  text-align: right;
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
  .gender-chart {
    flex-direction: column;
    padding: 16px 0;
  }

  .legend {
    width: 100%;
  }
}
</style>
