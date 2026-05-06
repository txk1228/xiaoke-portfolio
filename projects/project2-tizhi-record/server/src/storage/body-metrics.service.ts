import { Injectable } from '@nestjs/common';
import { StorageService } from './storage.service';
import { LlmService } from './llm.service';
import {
  BodyMetricsRecord,
  TrendAnalysis,
  TrendDataPoint,
  CreateBodyMetricsRequest,
  OcrResult,
} from '@/types';

@Injectable()
export class BodyMetricsService {
  constructor(
    private storageService: StorageService,
    private llmService: LlmService,
  ) {}

  /**
   * 获取趋势分析数据
   * @param userId 用户ID
   * @param days 天数（0表示全部数据）
   */
  async getTrendAnalysis(
    userId: string,
    days: number,
  ): Promise<TrendAnalysis> {
    let records: BodyMetricsRecord[];

    if (days === 0) {
      // 获取全部数据
      records = await this.storageService.getRecordsByUserId(userId);
    } else {
      // 获取指定天数的数据（从今天往前推days天：[今天-days, 今天]）
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - days);

      records = await this.storageService.getRecordsInRange(
        userId,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
      );
    }

    const data: TrendDataPoint[] = records.map((r) => ({
      date: r.record_date,
      weight: r.weight,
      bmi: r.bmi,
      body_fat: r.body_fat,
      skeletal_muscle: r.skeletal_muscle,
      waist_hip_ratio: r.waist_hip_ratio,
    }));

    // 计算变化
    const changes: TrendAnalysis['changes'] = {};
    if (records.length >= 2) {
      const first = records[0];
      const last = records[records.length - 1];

      if (first.weight && last.weight) {
        const change = last.weight - first.weight;
        changes.weight = {
          value: change,
          percent: first.weight > 0 ? (change / first.weight) * 100 : 0,
        };
      }
      if (first.bmi && last.bmi) {
        const change = last.bmi - first.bmi;
        changes.bmi = {
          value: change,
          percent: first.bmi > 0 ? (change / first.bmi) * 100 : 0,
        };
      }
      if (first.body_fat && last.body_fat) {
        const change = last.body_fat - first.body_fat;
        changes.body_fat = {
          value: change,
          percent: first.body_fat > 0 ? (change / first.body_fat) * 100 : 0,
        };
      }
      if (first.skeletal_muscle && last.skeletal_muscle) {
        const change = last.skeletal_muscle - first.skeletal_muscle;
        changes.skeletal_muscle = {
          value: change,
          percent: first.skeletal_muscle > 0 ? (change / first.skeletal_muscle) * 100 : 0,
        };
      }
    }

    return {
      period: days === 0 ? 'all' : days <= 7 ? '7days' : '30days',
      data,
      changes,
    };
  }

  /**
   * 处理截图识别
   */
  async processScreenshots(imageUrls: string[]): Promise<OcrResult[]> {
    return this.llmService.recognizeBatchBodyMetrics(imageUrls);
  }

  /**
   * 保存识别结果
   */
  async saveRecognitionResults(
    userId: string,
    results: OcrResult[],
    imageUrls: string[],
  ): Promise<BodyMetricsRecord[]> {
    const records: CreateBodyMetricsRequest[] = results
      .filter((r) => r.confidence > 0 && r.record_date)
      .map((r, index) => ({
        user_id: userId,
        record_date: r.record_date,
        weight: r.weight,
        bmi: r.bmi,
        body_fat: r.body_fat,
        skeletal_muscle: r.skeletal_muscle,
        visceral_fat: r.visceral_fat,
        waist_hip_ratio: r.waist_hip_ratio,
        bmr: r.bmr,
        water_rate: r.water_rate,
        bone_salt: r.bone_salt,
        protein: r.protein,
        lean_mass: r.lean_mass,
        body_age: r.body_age,
        source: 'screenshot' as const,
        image_url: imageUrls[index] || '',
      }));

    return this.storageService.createRecordsBatch(records);
  }

  /**
   * 生成智能分析
   */
  async generateSmartAnalysis(userId: string) {
    const latestRecord = await this.storageService.getLatestRecord(userId);
    const previousRecord = await this.storageService.getPreviousRecord(
      userId,
      latestRecord?.record_date || new Date().toISOString(),
    );
    const user = await this.storageService.getUserById(userId);

    if (!latestRecord || !user) {
      throw new Error('用户或记录不存在');
    }

    // 转换为通用格式
    const currentData = this.recordToNumbers(latestRecord);
    const previousData = previousRecord ? this.recordToNumbers(previousRecord) : null;

    const analysis = await this.llmService.generateHealthAnalysis(
      currentData,
      previousData,
      {
        age: user.age,
        gender: user.gender,
        nickname: user.nickname,
      },
    );

    return {
      record: latestRecord,
      previousRecord,
      analysis,
    };
  }

  private recordToNumbers(record: BodyMetricsRecord): Record<string, number | undefined> {
    return {
      weight: record.weight,
      bmi: record.bmi,
      body_fat: record.body_fat,
      skeletal_muscle: record.skeletal_muscle,
      visceral_fat: record.visceral_fat,
      waist_hip_ratio: record.waist_hip_ratio,
      bmr: record.bmr,
      water_rate: record.water_rate,
      bone_salt: record.bone_salt,
      protein: record.protein,
      lean_mass: record.lean_mass,
      body_age: record.body_age,
    };
  }
}
