<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const shortcuts = [
  { title: '班级管理', description: '维护开班信息、班主任和教学安排', path: '/clazz', icon: 'HomeFilled', color: '#409eff' },
  { title: '学员管理', description: '查询学员资料、维护档案和违纪记录', path: '/stu', icon: 'UserFilled', color: '#67c23a' },
  { title: '员工管理', description: '维护员工信息、岗位和工作经历', path: '/emp', icon: 'Avatar', color: '#e6a23c' },
  { title: '部门管理', description: '维护系统组织架构和部门信息', path: '/dept', icon: 'HelpFilled', color: '#909399' }
]
</script>

<template>
  <main class="home">
    <section class="welcome">
      <div>
        <p class="eyebrow">TLIAS MANAGEMENT</p>
        <h1>欢迎使用 Tlias 智能学习辅助系统</h1>
        <p class="welcome-text">从这里开始管理班级、学员、员工和系统信息。</p>
      </div>
      <el-icon class="welcome-icon"><DataBoard /></el-icon>
    </section>

    <h2>快捷入口</h2>
    <el-row :gutter="18">
      <el-col v-for="item in shortcuts" :key="item.path" :xs="24" :sm="12" :lg="6">
        <el-card class="shortcut" shadow="hover" @click="router.push(item.path)">
          <div class="shortcut-heading">
            <el-icon :style="{ color: item.color }"><component :is="item.icon" /></el-icon>
            <strong>{{ item.title }}</strong>
          </div>
          <p>{{ item.description }}</p>
          <span class="action">进入管理 <el-icon><ArrowRight /></el-icon></span>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="tip" shadow="never">
      <template #header>
        <div class="tip-heading"><el-icon><InfoFilled /></el-icon> 使用提示</div>
      </template>
      <p>通过左侧导航栏访问各业务模块。列表页面支持查询和分页，新增或编辑完成后会自动刷新数据。</p>
    </el-card>
  </main>
</template>

<style scoped>
.home {
  max-width: 1440px;
  margin: 0 auto;
}

.welcome {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 190px;
  margin-bottom: 30px;
  padding: 32px 42px;
  border-radius: 12px;
  color: #fff;
  background: linear-gradient(120deg, #176b9b, #30b7a4);
}

.eyebrow {
  margin: 0 0 12px;
  letter-spacing: 2px;
  opacity: 0.8;
}

h1 {
  margin: 0;
  font-size: 28px;
}

.welcome-text {
  margin: 14px 0 0;
  opacity: 0.9;
}

.welcome-icon {
  font-size: 76px;
  opacity: 0.72;
}

h2 {
  margin: 0 0 16px;
  font-size: 20px;
}

.shortcut {
  height: 190px;
  margin-bottom: 18px;
  cursor: pointer;
}

.shortcut-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 17px;
}

.shortcut-heading .el-icon {
  font-size: 24px;
}

.shortcut p {
  min-height: 42px;
  margin: 16px 0;
  color: #606266;
  line-height: 1.6;
}

.action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #409eff;
}

.tip {
  margin-top: 10px;
}

.tip-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.tip p {
  margin: 0;
  color: #606266;
}

@media (max-width: 700px) {
  .welcome {
    padding: 26px 22px;
  }

  h1 {
    font-size: 22px;
  }

  .welcome-icon {
    display: none;
  }
}
</style>
