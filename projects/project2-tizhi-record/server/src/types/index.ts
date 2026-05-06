// 用户信息类型定义
export interface UserProfile {
  id: string;
  nickname: string;
  age: number;
  gender: 'male' | 'female';
  created_at: string;
  updated_at: string;
}

// 体脂记录类型定义
export interface BodyMetricsRecord {
  id: string;
  user_id: string;
  record_date: string; // 记录日期（从截图识别或手动输入）
  // 各指标数据
  weight?: number; // 体重 kg
  bmi?: number; // BMI
  body_fat?: number; // 脂肪率 %
  skeletal_muscle?: number; // 骨骼肌量 kg
  visceral_fat?: number; // 内脏脂肪等级
  waist_hip_ratio?: number; // 腰臀比
  bmr?: number; // 基础代谢率 kcal
  water_rate?: number; // 水分率 %
  bone_salt?: number; // 骨盐量 g
  protein?: number; // 蛋白质 %
  lean_mass?: number; // 去脂体重 kg
  body_age?: number; // 身体年龄
  // 元数据
  source?: 'screenshot' | 'manual'; // 数据来源
  image_url?: string; // 截图URL
  created_at: string;
}

// 创建用户信息请求
export interface CreateUserProfileRequest {
  nickname: string;
  age: number;
  gender: 'male' | 'female';
}

// 更新用户信息请求
export interface UpdateUserProfileRequest {
  nickname?: string;
  age?: number;
  gender?: 'male' | 'female';
}

// 创建体脂记录请求
export interface CreateBodyMetricsRequest {
  user_id: string;
  record_date: string;
  weight?: number;
  bmi?: number;
  body_fat?: number;
  skeletal_muscle?: number;
  visceral_fat?: number;
  waist_hip_ratio?: number;
  bmr?: number;
  water_rate?: number;
  bone_salt?: number;
  protein?: number;
  lean_mass?: number;
  body_age?: number;
  source?: 'screenshot' | 'manual';
  image_url?: string;
}

// OCR 识别结果
export interface OcrResult {
  record_date: string;
  weight?: number;
  bmi?: number;
  body_fat?: number;
  skeletal_muscle?: number;
  visceral_fat?: number;
  waist_hip_ratio?: number;
  bmr?: number;
  water_rate?: number;
  bone_salt?: number;
  protein?: number;
  lean_mass?: number;
  body_age?: number;
  confidence: number; // 识别置信度 0-100
}

// 智能分析结果
export interface AnalysisResult {
  overall_score: number; // 综合得分 0-100
  bmi_assessment: {
    status: '偏低' | '正常' | '偏高' | '肥胖';
    trend: '上升' | '下降' | '稳定';
    change_value?: number;
  };
  body_fat_assessment: {
    status: '偏低' | '正常' | '偏高';
    trend: '上升' | '下降' | '稳定';
    change_value?: number;
  };
  muscle_assessment: {
    status: '增长' | '稳定' | '下降';
    change_value?: number;
  };
  recommendations: {
    training: string[]; // 训练建议
    diet: string[]; // 饮食建议
    lifestyle: string[]; // 生活习惯建议
  };
  summary: string; // 综合分析摘要
}

// 趋势数据点
export interface TrendDataPoint {
  date: string;
  weight?: number;
  bmi?: number;
  body_fat?: number;
  skeletal_muscle?: number;
  waist_hip_ratio?: number;
}

// 趋势分析结果
export interface TrendAnalysis {
  period: '7days' | '30days' | 'all';
  data: TrendDataPoint[];
  changes: {
    weight?: { value: number; percent: number };
    bmi?: { value: number; percent: number };
    body_fat?: { value: number; percent: number };
    skeletal_muscle?: { value: number; percent: number };
  };
}
