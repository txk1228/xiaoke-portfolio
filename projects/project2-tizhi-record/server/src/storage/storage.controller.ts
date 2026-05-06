import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StorageService } from './storage.service';
import { BodyMetricsService } from './body-metrics.service';
import {
  CreateUserProfileRequest,
  UpdateUserProfileRequest,
  CreateBodyMetricsRequest,
} from '@/types';

@Controller()
export class StorageController {
  constructor(
    private storageService: StorageService,
    private bodyMetricsService: BodyMetricsService,
  ) {}

  // ============ 用户相关接口 ============

  @Post('users')
  @HttpCode(HttpStatus.OK)
  async createUser(@Body() body: CreateUserProfileRequest) {
    console.log('创建用户:', body);
    const user = await this.storageService.createUser(body);
    return { code: 200, msg: 'success', data: user };
  }

  @Get('users')
  @HttpCode(HttpStatus.OK)
  async getAllUsers() {
    const users = await this.storageService.getAllUsers();
    return { code: 200, msg: 'success', data: users };
  }

  @Get('users/:id')
  @HttpCode(HttpStatus.OK)
  async getUserById(@Param('id') id: string) {
    const user = await this.storageService.getUserById(id);
    if (!user) {
      return { code: 404, msg: '用户不存在', data: null };
    }
    return { code: 200, msg: 'success', data: user };
  }

  @Get('users/nickname/:nickname')
  @HttpCode(HttpStatus.OK)
  async getUserByNickname(@Param('nickname') nickname: string) {
    const user = await this.storageService.getUserByNickname(nickname);
    if (!user) {
      return { code: 404, msg: '用户不存在', data: null };
    }
    return { code: 200, msg: 'success', data: user };
  }

  @Put('users/:id')
  @HttpCode(HttpStatus.OK)
  async updateUser(
    @Param('id') id: string,
    @Body() body: UpdateUserProfileRequest,
  ) {
    console.log('更新用户:', id, body);
    const user = await this.storageService.updateUser(id, body);
    if (!user) {
      return { code: 404, msg: '用户不存在', data: null };
    }
    return { code: 200, msg: 'success', data: user };
  }

  // ============ 体脂记录相关接口 ============

  @Post('records')
  @HttpCode(HttpStatus.OK)
  async createRecord(@Body() body: CreateBodyMetricsRequest) {
    console.log('创建体脂记录:', body);
    const record = await this.storageService.createRecord(body);
    return { code: 200, msg: 'success', data: record };
  }

  @Post('records/batch')
  @HttpCode(HttpStatus.OK)
  async createRecordsBatch(@Body() body: { records: CreateBodyMetricsRequest[] }) {
    console.log('批量创建体脂记录:', body.records.length, '条');
    const records = await this.storageService.createRecordsBatch(body.records);
    return { code: 200, msg: 'success', data: records };
  }

  @Get('records/user/:userId')
  @HttpCode(HttpStatus.OK)
  async getRecordsByUserId(@Param('userId') userId: string) {
    const records = await this.storageService.getRecordsByUserId(userId);
    return { code: 200, msg: 'success', data: records };
  }

  @Get('records/user/:userId/latest')
  @HttpCode(HttpStatus.OK)
  async getLatestRecord(@Param('userId') userId: string) {
    const record = await this.storageService.getLatestRecord(userId);
    if (!record) {
      return { code: 404, msg: '暂无记录', data: null };
    }
    return { code: 200, msg: 'success', data: record };
  }

  @Get('records/:id')
  @HttpCode(HttpStatus.OK)
  async getRecordById(@Param('id') id: string) {
    const record = await this.storageService.getRecordById(id);
    if (!record) {
      return { code: 404, msg: '记录不存在', data: null };
    }
    return { code: 200, msg: 'success', data: record };
  }

  @Delete('records/:id')
  @HttpCode(HttpStatus.OK)
  async deleteRecord(@Param('id') id: string) {
    console.log('删除记录:', id);
    const success = await this.storageService.deleteRecord(id);
    if (!success) {
      return { code: 404, msg: '记录不存在', data: null };
    }
    return { code: 200, msg: 'success', data: { deleted: true } };
  }

  // ============ 趋势分析接口 ============

  @Get('trend/:userId')
  @HttpCode(HttpStatus.OK)
  async getTrendAnalysis(
    @Param('userId') userId: string,
    @Query('days') days?: string,
  ) {
    // days为空或0表示全部数据
    const daysNum = days ? parseInt(days, 10) : 0;
    console.log(`获取趋势分析: userId=${userId}, days=${daysNum === 0 ? '全部数据' : daysNum + '天'}`);
    const trend = await this.bodyMetricsService.getTrendAnalysis(userId, daysNum);
    return { code: 200, msg: 'success', data: trend };
  }

  // ============ OCR 识别接口 ============

  @Post('ocr/recognize')
  @HttpCode(HttpStatus.OK)
  async recognizeScreenshots(@Body() body: { imageUrls: string[] }) {
    console.log('识别截图:', body.imageUrls.length, '张');
    const results = await this.bodyMetricsService.processScreenshots(body.imageUrls);
    return { code: 200, msg: 'success', data: results };
  }

  @Post('ocr/save')
  @HttpCode(HttpStatus.OK)
  async saveRecognitionResults(
    @Body() body: { userId: string; results: any[]; imageUrls: string[] },
  ) {
    console.log('保存识别结果:', body.results.length, '条');
    const records = await this.bodyMetricsService.saveRecognitionResults(
      body.userId,
      body.results,
      body.imageUrls,
    );
    return { code: 200, msg: 'success', data: records };
  }

  // ============ 智能分析接口 ============

  @Get('analysis/:userId')
  @HttpCode(HttpStatus.OK)
  async getSmartAnalysis(@Param('userId') userId: string) {
    console.log('生成智能分析: userId=', userId);
    try {
      const result = await this.bodyMetricsService.generateSmartAnalysis(userId);
      return { code: 200, msg: 'success', data: result };
    } catch (error) {
      console.error('智能分析失败:', error);
      return { code: 500, msg: error.message, data: null };
    }
  }

  // ============ 文件上传接口 ============

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  async uploadFile(@Body() body: { imageData: string; filename: string }) {
    console.log('接收文件上传请求:', body.filename);
    try {
      // 导入存储服务
      const { S3Storage } = await import('coze-coding-dev-sdk');

      const storage = new S3Storage({
        endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
        accessKey: '',
        secretKey: '',
        bucketName: process.env.COZE_BUCKET_NAME,
        region: 'cn-beijing',
      });

      // 解析 base64 数据
      const base64Data = body.imageData.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      // 生成文件名
      const ext = body.filename.split('.').pop() || 'jpg';
      const fileName = `body-metrics/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

      // 上传到对象存储
      const fileKey = await storage.uploadFile({
        fileContent: buffer,
        fileName: fileName,
        contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
      });

      // 生成访问 URL
      const imageUrl = await storage.generatePresignedUrl({
        key: fileKey,
        expireTime: 86400 * 7, // 7天有效期
      });

      console.log('文件上传成功:', fileKey);

      return {
        code: 200,
        msg: 'success',
        data: {
          fileKey,
          imageUrl,
        },
      };
    } catch (error) {
      console.error('文件上传失败:', error);
      // 如果对象存储不可用，使用本地存储作为降级方案
      try {
        const fs = await import('fs');
        const path = await import('path');
        const crypto = await import('crypto');

        const uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const base64Data = body.imageData.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const filename = `${Date.now()}_${crypto.randomBytes(8).toString('hex')}.jpg`;
        const filepath = path.join(uploadDir, filename);

        fs.writeFileSync(filepath, buffer);

        const imageUrl = `/uploads/${filename}`;
        console.log('文件保存到本地:', filepath);

        return {
          code: 200,
          msg: 'success',
          data: {
            fileKey: filename,
            imageUrl,
          },
        };
      } catch (localError) {
        console.error('本地存储也失败:', localError);
        return {
          code: 500,
          msg: '文件上传失败',
          data: null,
        };
      }
    }
  }
}
