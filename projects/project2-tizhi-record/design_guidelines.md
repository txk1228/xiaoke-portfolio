# 体脂数据记录 & 趋势曲线系统 - 设计指南

## 1. 品牌定位

- **应用名称**: BodyMetrics - 智能体脂管理
- **设计风格**: 现代健康风格，简洁专业，强调数据可视化
- **目标用户**: 关注健康管理和体脂变化的用户
- **核心功能**: 截图识别记录、数据趋势分析、智能健康建议

## 2. 配色方案

### 主色调
- **Primary**: `#2563EB` (蓝色 - 专业、可信)
- **Primary Light**: `#3B82F6`
- **Primary Dark**: `#1D4ED8`

### 功能色
- **Success**: `#10B981` (绿色 - 健康、正向)
- **Warning**: `#F59E0B` (橙色 - 警示)
- **Danger**: `#EF4444` (红色 - 异常、下降)
- **Info**: `#06B6D4` (青色 - 信息)

### 中性色
- **Background**: `#F8FAFC`
- **Card**: `#FFFFFF`
- **Text Primary**: `#1E293B`
- **Text Secondary**: `#64748B`
- **Border**: `#E2E8F0`

## 3. 组件选型原则

**必须优先使用 `@/components/ui/*` 组件库中的组件**，禁止用 View/Text 手搓通用 UI：

| 功能场景 | 优先使用组件 |
|---------|------------|
| 页面容器/卡片 | Card, CardContent |
| 表单输入 | Input, Label, Field |
| 按钮操作 | Button |
| 数据展示 | Badge, Skeleton |
| 弹窗确认 | Dialog, AlertDialog |
| 标签切换 | Tabs |
| 列表展示 | Table, ScrollArea |
| 状态提示 | Toast, Sonner |
| 分页导航 | Pagination |
| 分割线 | Separator |

## 4. 页面结构

### TabBar 页面
1. **首页** (`pages/index/index`) - 数据概览、快捷操作
2. **数据录入** (`pages/record/index`) - 截图上传、手动录入
3. **趋势分析** (`pages/trend/index`) - 7天/30天曲线、变化分析
4. **我的** (`pages/profile/index`) - 用户信息设置

### 子页面
- **截图识别结果** (`pages/record/result`) - 展示识别结果供确认
- **智能分析详情** (`pages/analysis/index`) - 综合得分与建议

## 5. 页面组件选型

### 首页
- 今日数据卡片（Card）
- 快捷操作入口（Button）
- 近期趋势预览（简易折线图）
- 综合得分展示（Badge + 数字）

### 数据录入页
- Tab切换：截图识别 / 手动录入（Tabs）
- 图片上传区域（自定义 + Button）
- 批量上传列表（Table）
- 识别结果确认（Dialog）

### 趋势分析页
- 时间范围切换：7天/30天（ToggleGroup）
- 指标选择（ToggleGroup）
- 趋势图表（自定义Canvas/ECharts）
- 变化分析卡片（Card）

### 个人设置页
- 用户信息表单（Input + Select）
- 历史记录列表（Table）

## 6. 间距系统

- 页面边距: `px-4` (16px)
- 卡片间距: `gap-4` (16px)
- 组件间距: `gap-2` (8px)
- 卡片内边距: `p-4` (16px)
- 列表项间距: `gap-3` (12px)

## 7. 圆角与阴影

- 卡片圆角: `rounded-2xl`
- 按钮圆角: `rounded-lg`
- 输入框圆角: `rounded-xl`
- 卡片阴影: `shadow-sm`

## 8. 体脂数据字段与单位

| 字段名 | 中文名 | 单位 | 正常范围参考 |
|-------|--------|------|-------------|
| weight | 体重 | kg | - |
| bmi | BMI | - | 18.5-24 |
| bodyFat | 脂肪率 | % | 男15-20, 女20-28 |
| skeletalMuscle | 骨骼肌量 | kg | - |
| visceralFat | 内脏脂肪等级 | - | 1-14 |
| waistHipRatio | 腰臀比 | - | 男<0.9, 女<0.85 |
| bmr | 基础代谢率 | kcal | - |
| waterRate | 水分率 | % | 55-65 |
| boneSalt | 骨盐量 | g | - |
| protein | 蛋白质 | % | 16-20 |
| leanMass | 去脂体重 | kg | - |
| bodyAge | 身体年龄 | 岁 | - |

## 9. 健康判断标准

### BMI
- 偏低: < 18.5
- 正常: 18.5 - 24
- 偏高: 24 - 28
- 肥胖: > 28

### 体脂率
- 男性: 正常15-20%, 偏高>25%, 偏低<10%
- 女性: 正常20-28%, 偏高>32%, 偏低<18%

### 肌肉变化
- 增长: +0.5kg以上
- 稳定: ±0.5kg
- 下降: -0.5kg以上

## 10. 小程序约束

- 包体积限制: 控制在2MB以内
- 图片策略: 大图上传到对象存储，代码中用URL引用
- 性能优化: 列表虚拟化、懒加载
- TabBar图标: 81x81 PNG格式
