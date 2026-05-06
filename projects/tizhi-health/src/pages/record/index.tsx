import { View, Text } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { Network } from '@/network';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog } from '@/components/ui/dialog';
import { Upload, Camera } from 'lucide-react-taro';

interface UserProfile {
  id: string;
  nickname: string;
  age: number;
  gender: 'male' | 'female';
}

interface OcrResult {
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
  confidence: number;
}

const RecordPage = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'screenshot' | 'manual'>('screenshot');
  const [uploading, setUploading] = useState(false);
  const [ocrResults, setOcrResults] = useState<OcrResult[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  // 手动录入表单
  const [formData, setFormData] = useState({
    record_date: new Date().toISOString().split('T')[0],
    weight: '',
    bmi: '',
    body_fat: '',
    skeletal_muscle: '',
    visceral_fat: '',
    waist_hip_ratio: '',
    bmr: '',
    water_rate: '',
    bone_salt: '',
    protein: '',
    lean_mass: '',
    body_age: '',
  });

  useEffect(() => {
    const userInfo = Taro.getStorageSync('userInfo');
    if (userInfo) {
      setUser(userInfo);
    }
  }, []);

  // 获取图片base64
  const getBase64 = (filePath: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileSystemManager = Taro.getFileSystemManager();
      fileSystemManager.readFile({
        filePath,
        encoding: 'base64',
        success: (res) => resolve(res.data as string),
        fail: (err) => reject(err),
      });
    });
  };

  // 处理图片选择
  const handleChooseImage = async () => {
    if (!user) {
      Taro.showToast({ title: '请先设置用户信息', icon: 'none' });
      return;
    }

    try {
      const res = await Taro.chooseImage({
        count: 9,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      });

      console.log('选择图片:', res.tempFilePaths);

      if (res.tempFilePaths.length > 0) {
        setUploading(true);

        // 先上传图片获取URL
        const imageUrls: string[] = [];
        for (const tempPath of res.tempFilePaths) {
          try {
            const base64Data = await getBase64(tempPath);
            const uploadRes = await Network.request({
              url: '/api/upload',
              method: 'POST',
              data: {
                imageData: `data:image/jpeg;base64,${base64Data}`,
                filename: `body_metrics_${Date.now()}.jpg`,
              },
            });

            if (uploadRes.data?.code === 200) {
              imageUrls.push(uploadRes.data.data.imageUrl);
            }
          } catch (error) {
            console.error('上传图片失败:', error);
          }
        }

        if (imageUrls.length > 0) {
          // 调用 OCR 识别
          Taro.showLoading({ title: '识别中...' });
          const ocrRes = await Network.request({
            url: '/api/ocr/recognize',
            method: 'POST',
            data: { imageUrls },
          });

          Taro.hideLoading();

          console.log('OCR识别结果:', ocrRes.data);

          if (ocrRes.data?.code === 200) {
            setOcrResults(ocrRes.data.data);
            setShowConfirmDialog(true);
          } else {
            Taro.showToast({ title: '识别失败', icon: 'none' });
          }
        }

        setUploading(false);
      }
    } catch (error) {
      console.error('选择图片失败:', error);
      setUploading(false);
    }
  };

  // 保存OCR识别结果
  const handleSaveOcrResults = async () => {
    if (!user || ocrResults.length === 0) return;

    try {
      setLoading(true);
      Taro.showLoading({ title: '保存中...' });

      const res = await Network.request({
        url: '/api/ocr/save',
        method: 'POST',
        data: {
          userId: user.id,
          results: ocrResults,
          imageUrls: [],
        },
      });

      Taro.hideLoading();

      if (res.data?.code === 200) {
        Taro.showToast({ title: '保存成功', icon: 'success' });
        setShowConfirmDialog(false);
        setOcrResults([]);
      } else {
        Taro.showToast({ title: '保存失败', icon: 'none' });
      }
    } catch (error) {
      console.error('保存失败:', error);
      Taro.hideLoading();
    } finally {
      setLoading(false);
    }
  };

  // 保存手动录入数据
  const handleSaveManual = async () => {
    if (!user) {
      Taro.showToast({ title: '请先设置用户信息', icon: 'none' });
      return;
    }

    try {
      setLoading(true);
      Taro.showLoading({ title: '保存中...' });

      const recordData: Record<string, any> = {
        user_id: user.id,
        record_date: formData.record_date,
        source: 'manual',
      };

      // 只添加有值的字段
      Object.keys(formData).forEach((key) => {
        if (key !== 'record_date' && formData[key as keyof typeof formData]) {
          const dbKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
          recordData[dbKey] = parseFloat(formData[key as keyof typeof formData]);
        }
      });

      const res = await Network.request({
        url: '/api/records',
        method: 'POST',
        data: recordData,
      });

      Taro.hideLoading();

      if (res.data?.code === 200) {
        Taro.showToast({ title: '保存成功', icon: 'success' });
        // 清空表单
        setFormData({
          record_date: new Date().toISOString().split('T')[0],
          weight: '',
          bmi: '',
          body_fat: '',
          skeletal_muscle: '',
          visceral_fat: '',
          waist_hip_ratio: '',
          bmr: '',
          water_rate: '',
          bone_salt: '',
          protein: '',
          lean_mass: '',
          body_age: '',
        });
      } else {
        Taro.showToast({ title: '保存失败', icon: 'none' });
      }
    } catch (error) {
      console.error('保存失败:', error);
      Taro.hideLoading();
    } finally {
      setLoading(false);
    }
  };

  // 更新表单字段
  const updateFormField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 字段配置
  const fields = [
    { key: 'weight', label: '体重', unit: 'kg', placeholder: '如: 65.5' },
    { key: 'bmi', label: 'BMI', unit: '', placeholder: '如: 22.3' },
    { key: 'body_fat', label: '脂肪率', unit: '%', placeholder: '如: 18.5' },
    { key: 'skeletal_muscle', label: '骨骼肌量', unit: 'kg', placeholder: '如: 32.5' },
    { key: 'visceral_fat', label: '内脏脂肪', unit: '', placeholder: '如: 8' },
    { key: 'waist_hip_ratio', label: '腰臀比', unit: '', placeholder: '如: 0.85' },
    { key: 'bmr', label: '基础代谢', unit: 'kcal', placeholder: '如: 1500' },
    { key: 'water_rate', label: '水分率', unit: '%', placeholder: '如: 55.5' },
    { key: 'bone_salt', label: '骨盐量', unit: 'g', placeholder: '如: 3.2' },
    { key: 'protein', label: '蛋白质', unit: '%', placeholder: '如: 18.0' },
    { key: 'lean_mass', label: '去脂体重', unit: 'kg', placeholder: '如: 52.5' },
    { key: 'body_age', label: '身体年龄', unit: '岁', placeholder: '如: 28' },
  ];

  return (
    <View className="min-h-screen bg-gray-50 pb-20">
      {/* Tab切换 */}
      <View className="bg-white px-4 pt-4">
        <View className="flex border-b border-gray-200">
          <View
            className={`flex-1 py-3 text-center ${activeTab === 'screenshot' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('screenshot')}
          >
            <Text className={`block text-sm font-medium ${activeTab === 'screenshot' ? 'text-blue-500' : 'text-gray-500'}`}>
              截图识别
            </Text>
          </View>
          <View
            className={`flex-1 py-3 text-center ${activeTab === 'manual' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('manual')}
          >
            <Text className={`block text-sm font-medium ${activeTab === 'manual' ? 'text-blue-500' : 'text-gray-500'}`}>
              手动录入
            </Text>
          </View>
        </View>
      </View>

      {/* 截图识别 */}
      {activeTab === 'screenshot' && (
        <View className="p-4">
          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <View className="flex flex-col items-center">
                <View className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <Camera size={32} color="#2563EB" />
                </View>
                <Text className="block text-lg font-semibold text-gray-900 mb-2">
                  上导体脂秤截图
                </Text>
                <Text className="block text-sm text-gray-500 text-center mb-4">
                  支持一次性上传多张截图{'\n'}自动识别体脂数据
                </Text>
                <Button onClick={handleChooseImage} disabled={uploading} className="px-6">
                  {uploading ? (
                    <Text className="block text-white">上传中...</Text>
                  ) : (
                    <>
                      <Upload size={16} className="mr-2" color="#fff" />
                      <Text className="block text-white">选择图片</Text>
                    </>
                  )}
                </Button>
              </View>
            </CardContent>
          </Card>

          <View className="mt-4">
            <Text className="block text-sm text-gray-500 mb-2">识别说明：</Text>
            <View className="space-y-1">
              <Text className="block text-xs text-gray-400">• 请上传清晰的体脂秤数据截图</Text>
              <Text className="block text-xs text-gray-400">• 确保截图中的日期和数值清晰可见</Text>
              <Text className="block text-xs text-gray-400">• 支持同时上传多张截图批量识别</Text>
            </View>
          </View>
        </View>
      )}

      {/* 手动录入 */}
      {activeTab === 'manual' && (
        <View className="p-4">
          <Card className="rounded-2xl mb-4">
            <CardContent className="p-4">
              <View className="space-y-4">
                <View>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    记录日期
                  </Label>
                  <View className="bg-gray-50 rounded-xl px-4 py-3">
                    <Input
                      value={formData.record_date}
                      onInput={(e) => updateFormField('record_date', e.detail.value)}
                      className="w-full"
                      placeholder="选择日期"
                    />
                  </View>
                </View>
              </View>
            </CardContent>
          </Card>

          <View className="space-y-3">
            {fields.slice(0, 4).map((field) => (
              <Card key={field.key} className="rounded-xl">
                <CardContent className="p-3">
                  <View className="flex items-center">
                    <Text className="block w-20 text-sm text-gray-600">{field.label}</Text>
                    <View className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                      <Input
                        type="number"
                        placeholder={field.placeholder}
                        value={formData[field.key as keyof typeof formData]}
                        onInput={(e) => updateFormField(field.key, e.detail.value)}
                        className="w-full"
                      />
                    </View>
                    {field.unit && (
                      <Text className="block w-12 text-sm text-gray-400 text-right">{field.unit}</Text>
                    )}
                  </View>
                </CardContent>
              </Card>
            ))}

            {/* 展开更多 */}
            <Card className="rounded-xl">
              <CardContent className="p-3">
                <View className="space-y-3">
                  {fields.slice(4).map((field) => (
                    <View key={field.key} className="flex items-center">
                      <Text className="block w-20 text-sm text-gray-600">{field.label}</Text>
                      <View className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                        <Input
                          type="number"
                          placeholder={field.placeholder}
                          value={formData[field.key as keyof typeof formData]}
                          onInput={(e) => updateFormField(field.key, e.detail.value)}
                          className="w-full"
                        />
                      </View>
                      {field.unit && (
                        <Text className="block w-12 text-sm text-gray-400 text-right">{field.unit}</Text>
                      )}
                    </View>
                  ))}
                </View>
              </CardContent>
            </Card>
          </View>

          <View className="mt-4">
            <Button
              onClick={handleSaveManual}
              disabled={loading || !formData.weight}
              className="w-full py-3"
            >
              <Text className="block text-white font-semibold">
                {loading ? '保存中...' : '保存记录'}
              </Text>
            </Button>
          </View>
        </View>
      )}

      {/* OCR结果确认弹窗 */}
      <Dialog open={showConfirmDialog} onOpenChange={(open) => !open && setShowConfirmDialog(false)}>
        <View className="p-4">
          <View className="flex items-center justify-between mb-4">
            <Text className="block text-lg font-semibold">识别结果确认</Text>
            <Badge>{ocrResults.length} 条</Badge>
          </View>

          <View className="space-y-3 max-h-96 overflow-y-auto">
            {ocrResults.map((result, index) => (
              <Card key={index} className="rounded-xl">
                <CardContent className="p-3">
                  <View className="flex items-center justify-between mb-2">
                    <Text className="block text-sm font-medium">{result.record_date || '日期未识别'}</Text>
                    <Badge variant={result.confidence > 80 ? 'default' : 'secondary'}>
                      置信度 {result.confidence}%
                    </Badge>
                  </View>
                  <View className="grid grid-cols-3 gap-2 text-xs">
                    {result.weight && (
                      <Text className="block text-gray-500">体重: {result.weight}kg</Text>
                    )}
                    {result.bmi && (
                      <Text className="block text-gray-500">BMI: {result.bmi}</Text>
                    )}
                    {result.body_fat && (
                      <Text className="block text-gray-500">体脂: {result.body_fat}%</Text>
                    )}
                    {result.skeletal_muscle && (
                      <Text className="block text-gray-500">骨骼肌: {result.skeletal_muscle}kg</Text>
                    )}
                    {result.visceral_fat && (
                      <Text className="block text-gray-500">内脏脂肪: {result.visceral_fat}</Text>
                    )}
                    {result.bmr && (
                      <Text className="block text-gray-500">代谢: {result.bmr}</Text>
                    )}
                    {result.water_rate && (
                      <Text className="block text-gray-500">水分: {result.water_rate}%</Text>
                    )}
                    {result.body_age && (
                      <Text className="block text-gray-500">身体年龄: {result.body_age}岁</Text>
                    )}
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>

          <View className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowConfirmDialog(false);
                setOcrResults([]);
              }}
            >
              <Text className="block text-gray-600">取消</Text>
            </Button>
            <Button className="flex-1" onClick={handleSaveOcrResults} disabled={loading}>
              <Text className="block text-white">确认保存</Text>
            </Button>
          </View>
        </View>
      </Dialog>
    </View>
  );
};

export default RecordPage;
