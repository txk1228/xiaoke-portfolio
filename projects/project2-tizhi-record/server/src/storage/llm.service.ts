import { Injectable } from '@nestjs/common';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { OcrResult } from '@/types';

@Injectable()
export class LlmService {
  private client: LLMClient;

  constructor() {
    const config = new Config();
    this.client = new LLMClient(config);
  }

  /**
   * 识别体脂秤截图中的数据
   * 使用视觉大模型分析图片中的文字和数据
   */
  async recognizeBodyMetricsFromImage(imageUrl: string): Promise<OcrResult> {
    console.log('OCR识别图片:', imageUrl);

    const prompt = `你是一个专业的体脂秤数据识别助手。请仔细分析这张体脂秤的测量截图，提取以下数据字段：

需要识别的字段（注意：可能只有部分字段在图片中可见）：
- 日期（record_date）：从图片中识别测量日期，格式为 YYYY-MM-DD
- 体重（weight）：单位 kg
- BMI（bmi）：体质指数，无单位
- 脂肪率（body_fat）：单位 %
- 骨骼肌量（skeletal_muscle）：单位 kg
- 内脏脂肪等级（visceral_fat）：无单位，数值1-14
- 腰臀比（waist_hip_ratio）：无单位，如 0.85
- 基础代谢率（bmr）：单位 kcal
- 水分率（water_rate）：单位 %
- 骨盐量（bone_salt）：单位 g
- 蛋白质（protein）：单位 %
- 去脂体重（lean_mass）：单位 kg
- 身体年龄（body_age）：单位 岁

请以JSON格式返回识别结果，格式如下：
{
  "record_date": "2024-05-04",
  "weight": 65.5,
  "bmi": 22.3,
  "body_fat": 18.5,
  "skeletal_muscle": 32.5,
  "visceral_fat": 8,
  "waist_hip_ratio": 0.85,
  "bmr": 1500,
  "water_rate": 55.5,
  "bone_salt": 3.2,
  "protein": 18.0,
  "lean_mass": 52.5,
  "body_age": 28,
  "confidence": 95
}

confidence 表示你对识别结果的置信度（0-100）。

如果某个字段无法识别或图片中不存在，请将其设为 null。请只返回JSON，不要添加任何解释。`;

    try {
      const messages = [
        {
          role: 'user' as const,
          content: [
            { type: 'text' as const, text: prompt },
            {
              type: 'image_url' as const,
              image_url: { url: imageUrl, detail: 'high' as const },
            },
          ],
        },
      ];

      const response = await this.client.invoke(messages, {
        model: 'doubao-seed-1-6-vision-250815',
        temperature: 0.3,
      });

      console.log('LLM 原始响应:', response.content);

      // 解析 JSON 响应
      const result = this.parseOcrResult(response.content);
      return result;
    } catch (error) {
      console.error('OCR识别失败:', error);
      throw new Error(`OCR识别失败: ${error.message}`);
    }
  }

  /**
   * 批量识别多张体脂秤截图
   */
  async recognizeBatchBodyMetrics(imageUrls: string[]): Promise<OcrResult[]> {
    const results: OcrResult[] = [];
    for (const url of imageUrls) {
      try {
        const result = await this.recognizeBodyMetricsFromImage(url);
        results.push(result);
      } catch (error) {
        console.error(`识别失败 ${url}:`, error);
        // 记录失败但不中断其他图片
        results.push({
          record_date: '',
          confidence: 0,
        });
      }
    }
    return results;
  }

  /**
   * 生成智能健康分析
   */
  async generateHealthAnalysis(
    currentRecord: Record<string, number | undefined>,
    previousRecord: Record<string, number | undefined> | null,
    userProfile: { age: number; gender: string; nickname: string },
  ): Promise<{
    overall_score: number;
    bmi_assessment: any;
    body_fat_assessment: any;
    muscle_assessment: any;
    recommendations: any;
    summary: string;
  }> {
    const prompt = `你是一个专业的健康管理顾问。请根据用户的身体数据提供详细的健康分析和建议。

用户信息：
- 昵称：${userProfile.nickname}
- 年龄：${userProfile.age}岁
- 性别：${userProfile.gender === 'male' ? '男' : '女'}

当前数据：
${this.formatRecordData(currentRecord)}

${previousRecord ? `上次数据（用于对比变化）：
${this.formatRecordData(previousRecord)}` : '(这是首次记录，无历史数据对比)'}

请分析以下内容并返回JSON格式的建议：

1. **综合得分**（0-100分）：基于整体健康指标的打分
2. **BMI评估**：
   - 状态：偏低/正常/偏高/肥胖
   - 趋势：相比上次的变化趋势
   - 变化值
3. **体脂评估**：
   - 状态：偏低/正常/偏高
   - 趋势：相比上次的变化趋势
   - 变化值
4. **肌肉评估**：
   - 状态：增长/稳定/下降
   - 变化值
5. **训练建议**：3-5条具体的训练建议
6. **饮食建议**：3-5条具体的饮食建议
7. **生活习惯建议**：2-3条生活习惯建议
8. **综合摘要**：一段简洁的分析总结

请返回以下JSON格式（只需要返回JSON，不要有任何其他文字）：
{
  "overall_score": 85,
  "bmi_assessment": {
    "status": "正常",
    "trend": "下降",
    "change_value": -0.5
  },
  "body_fat_assessment": {
    "status": "正常",
    "trend": "下降",
    "change_value": -2.1
  },
  "muscle_assessment": {
    "status": "稳定",
    "change_value": 0.2
  },
  "recommendations": {
    "training": ["建议每周进行3次力量训练", "增加有氧运动至每周150分钟", "注意训练后充分休息"],
    "diet": ["保证每天蛋白质摄入量", "控制碳水化合物摄入", "增加蔬菜水果比例"],
    "lifestyle": ["保证7-8小时睡眠", "减少熬夜", "保持规律作息"]
  },
  "summary": "您的体脂率有所下降，显示出良好的减脂趋势。BMI维持在正常范围内，肌肉量保持稳定。建议继续保持当前的运动和饮食习惯。"
}`;

    try {
      const messages = [
        {
          role: 'user' as const,
          content: prompt,
        },
      ];

      const response = await this.client.invoke(messages, {
        model: 'doubao-seed-2-0-lite-260215',
        temperature: 0.7,
      });

      console.log('健康分析原始响应:', response.content);

      const result = this.parseHealthAnalysis(response.content);
      return result;
    } catch (error) {
      console.error('健康分析生成失败:', error);
      throw new Error(`健康分析生成失败: ${error.message}`);
    }
  }

  private formatRecordData(record: Record<string, number | undefined>): string {
    const fields = [
      { key: 'weight', label: '体重', unit: 'kg' },
      { key: 'bmi', label: 'BMI', unit: '' },
      { key: 'body_fat', label: '脂肪率', unit: '%' },
      { key: 'skeletal_muscle', label: '骨骼肌量', unit: 'kg' },
      { key: 'visceral_fat', label: '内脏脂肪等级', unit: '' },
      { key: 'waist_hip_ratio', label: '腰臀比', unit: '' },
      { key: 'bmr', label: '基础代谢率', unit: 'kcal' },
      { key: 'water_rate', label: '水分率', unit: '%' },
      { key: 'bone_salt', label: '骨盐量', unit: 'g' },
      { key: 'protein', label: '蛋白质', unit: '%' },
      { key: 'lean_mass', label: '去脂体重', unit: 'kg' },
      { key: 'body_age', label: '身体年龄', unit: '岁' },
    ];

    return fields
      .filter((f) => record[f.key] !== undefined)
      .map((f) => `- ${f.label}: ${record[f.key]}${f.unit}`)
      .join('\n');
  }

  private parseOcrResult(content: string): OcrResult {
    try {
      // 尝试提取 JSON
      let jsonStr = content.trim();
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
      const result = JSON.parse(jsonStr);

      return {
        record_date: result.record_date || '',
        weight: result.weight ?? undefined,
        bmi: result.bmi ?? undefined,
        body_fat: result.body_fat ?? undefined,
        skeletal_muscle: result.skeletal_muscle ?? undefined,
        visceral_fat: result.visceral_fat ?? undefined,
        waist_hip_ratio: result.waist_hip_ratio ?? undefined,
        bmr: result.bmr ?? undefined,
        water_rate: result.water_rate ?? undefined,
        bone_salt: result.bone_salt ?? undefined,
        protein: result.protein ?? undefined,
        lean_mass: result.lean_mass ?? undefined,
        body_age: result.body_age ?? undefined,
        confidence: result.confidence || 0,
      };
    } catch (error) {
      console.error('解析OCR结果失败:', error);
      return {
        record_date: '',
        confidence: 0,
      };
    }
  }

  private parseHealthAnalysis(content: string): any {
    try {
      let jsonStr = content.trim();
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('解析健康分析结果失败:', error);
      return {
        overall_score: 0,
        bmi_assessment: { status: '未知', trend: '稳定', change_value: 0 },
        body_fat_assessment: { status: '未知', trend: '稳定', change_value: 0 },
        muscle_assessment: { status: '稳定', change_value: 0 },
        recommendations: {
          training: ['暂无建议'],
          diet: ['暂无建议'],
          lifestyle: ['暂无建议'],
        },
        summary: '分析生成失败，请稍后重试。',
      };
    }
  }
}
