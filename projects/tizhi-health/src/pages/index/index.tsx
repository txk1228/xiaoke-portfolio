import { View, Text } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { Network } from '@/network';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';
import {
  Activity,
  TrendingDown,
  TrendingUp,
  Scale,
  Target,
  Flame,
  Zap,
  Plus,
  Lightbulb,
  Check,
  Smile,
} from 'lucide-react-taro';

interface UserProfile {
  id: string;
  nickname: string;
  age: number;
  gender: 'male' | 'female';
}

interface BodyRecord {
  id: string;
  record_date: string;
  weight?: number;
  bmi?: number;
  body_fat?: number;
  skeletal_muscle?: number;
  visceral_fat?: number;
  bmr?: number;
  water_rate?: number;
  body_age?: number;
  waist_hip_ratio?: number;
}

interface QuickStats {
  totalRecords: number;
  latestRecord: BodyRecord | null;
  fatLossEffective: boolean;
  muscleLoss: boolean;
  score: number;
  suggestions: string[];
}

const IndexPage = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [latestRecord, setLatestRecord] = useState<BodyRecord | null>(null);
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const userInfo = Taro.getStorageSync('userInfo');
      if (userInfo) {
        setUser(userInfo);

        // 获取全部数据用于智能分析
        const res = await Network.request({
          url: `/api/trend/${userInfo.id}`,
          data: { days: 0 },
        });

        console.log('首页数据:', res.data);

        if (res.data?.code === 200 && res.data.data) {
          const data = res.data.data.data || [];
          const changes = res.data.data.changes || {};
          
          // 按日期升序排序，获取最后一条记录（日期最大的）
          const sortedData = [...data].sort((a, b) => 
            new Date(a.record_date).getTime() - new Date(b.record_date).getTime()
          );
          const latest = sortedData.length > 0 ? sortedData[sortedData.length - 1] : null;
          
          setLatestRecord(latest);
          
          // 计算综合得分和建议
          const { score, suggestions } = calculateSmartAnalysis(latest, changes, userInfo);
          
          setQuickStats({
            totalRecords: data.length,
            latestRecord: latest,
            fatLossEffective: (changes.body_fat?.value ?? 0) < 0,
            muscleLoss: (changes.skeletal_muscle?.value ?? 0) < 0,
            score,
            suggestions,
          });
        }
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 计算智能分析
  const calculateSmartAnalysis = (
    latest: BodyRecord | null,
    changes: Record<string, { value: number }>,
    userInfo: UserProfile
  ) => {
    const suggestions: string[] = [];
    let score = 100;

    if (!latest) {
      return { score: 0, suggestions: ['开始记录您的第一条数据，开启健康之旅！'] };
    }

    // BMI评估
    const bmi = latest.bmi || 22;
    if (bmi < 18.5) {
      score -= 15;
      suggestions.push('您的BMI偏低，建议适当增重并加强力量训练');
    } else if (bmi >= 28) {
      score -= 20;
      suggestions.push('您的BMI偏高，建议控制饮食并增加运动');
    } else if (bmi >= 24) {
      score -= 10;
      suggestions.push('您的BMI处于偏胖范围，建议适当运动');
    }

    // 体脂评估
    const bodyFat = latest.body_fat || 20;
    const gender = userInfo.gender || 'male';
    const idealFatMin = gender === 'male' ? 10 : 18;
    const idealFatMax = gender === 'male' ? 20 : 28;
    
    if (bodyFat > idealFatMax) {
      score -= 15;
      suggestions.push(`您的体脂率偏高，建议减少高热量食物摄入`);
    } else if (bodyFat < idealFatMin) {
      score -= 10;
      suggestions.push('您的体脂率偏低，适当的体脂有助于维持身体机能');
    }

    // 水分率评估
    const waterRate = latest.water_rate || 50;
    if (waterRate < 50) {
      score -= 10;
      suggestions.push('您的水分率偏低，建议每天饮水不少于2000ml');
    }

    // 骨骼肌评估
    const skeletalMuscle = latest.skeletal_muscle || 0;
    if (skeletalMuscle < 30) {
      score -= 10;
      suggestions.push('建议加强力量训练，增加肌肉量');
    }

    // 趋势分析
    const fatChange = changes.body_fat?.value ?? 0;
    const muscleChange = changes.skeletal_muscle?.value ?? 0;
    
    if (fatChange < 0 && muscleChange >= 0) {
      suggestions.push('减脂效果良好，肌肉保持稳定，继续保持！');
    } else if (fatChange < 0 && muscleChange < 0) {
      suggestions.push('减脂有效但肌肉有所流失，建议增加蛋白质摄入和力量训练');
    } else if (fatChange > 0) {
      score -= 10;
      suggestions.push('体脂有所上升，建议调整饮食结构并增加运动');
    }

    // 基础代谢
    const bmr = latest.bmr || 1500;
    if (bmr < 1200) {
      suggestions.push('基础代谢偏低，建议通过运动提升代谢');
    }

    // 身体年龄
    const bodyAge = latest.body_age;
    const realAge = userInfo.age || 30;
    if (bodyAge && bodyAge > realAge + 5) {
      suggestions.push(`您的身体年龄(${bodyAge}岁)高于实际年龄，建议加强锻炼`);
    } else if (bodyAge && bodyAge < realAge) {
      suggestions.push(`您的身体年龄(${bodyAge}岁)优于实际年龄，健康状况良好！`);
    }

    // 确保分数在0-100之间
    score = Math.max(0, Math.min(100, score));

    // 如果没有建议，添加通用建议
    if (suggestions.length === 0) {
      suggestions.push('数据整体健康，继续保持良好的生活习惯！');
    }

    return { score, suggestions };
  };

  const goToRecord = () => {
    Taro.switchTab({ url: '/pages/record/index' });
  };

  const goToTrend = () => {
    Taro.switchTab({ url: '/pages/trend/index' });
  };

  const handleShowAnalysis = () => {
    setShowAnalysisDialog(true);
  };

  const getBmiStatus = (bmi: number) => {
    if (bmi < 18.5) return { text: '偏瘦', color: 'text-yellow-500' };
    if (bmi < 24) return { text: '正常', color: 'text-green-500' };
    if (bmi < 28) return { text: '偏胖', color: 'text-orange-500' };
    return { text: '肥胖', color: 'text-red-500' };
  };

  const getBodyFatStatus = (bodyFat: number, gender: 'male' | 'female') => {
    if (gender === 'male') {
      if (bodyFat < 10) return { text: '偏低', color: 'text-yellow-500' };
      if (bodyFat < 20) return { text: '标准', color: 'text-green-500' };
      if (bodyFat < 25) return { text: '偏高', color: 'text-orange-500' };
      return { text: '过高', color: 'text-red-500' };
    } else {
      if (bodyFat < 18) return { text: '偏低', color: 'text-yellow-500' };
      if (bodyFat < 28) return { text: '标准', color: 'text-green-500' };
      if (bodyFat < 33) return { text: '偏高', color: 'text-orange-500' };
      return { text: '过高', color: 'text-red-500' };
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return '优秀';
    if (score >= 60) return '良好';
    if (score >= 40) return '一般';
    return '需改善';
  };

  return (
    <View className="min-h-screen bg-gray-50 pb-20">
      {/* 头部 */}
      <View className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 pt-8 pb-20">
        <View className="flex items-center justify-between">
          <View>
            <Text className="block text-white text-xl font-bold">
              {user?.nickname || '体脂管理'}
            </Text>
            <Text className="block text-blue-100 text-sm mt-1">
              {user ? `${user.age}岁 · ${user.gender === 'male' ? '男' : '女'}` : '开始记录您的身体数据'}
            </Text>
          </View>
          <View className="w-12 h-12 bg-gradient-to-br from-pink-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
            <Smile size={26} color="white" />
          </View>
        </View>
      </View>

      {loading ? (
        <View className="px-4 -mt-12">
          <Skeleton className="h-48 mb-4 rounded-2xl" />
          <Skeleton className="h-32 mb-4 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </View>
      ) : (
        <>
          {/* 最新数据卡片 */}
          <View className="px-4 -mt-12">
            <Card className="rounded-2xl shadow-lg">
              <CardContent className="p-5">
                <View className="flex items-center justify-between mb-4">
                  <Text className="block text-base font-semibold text-gray-900">
                    最新记录
                  </Text>
                  {latestRecord && (
                    <Badge variant="outline" className="text-xs">
                      {latestRecord.record_date}
                    </Badge>
                  )}
                </View>

                {latestRecord ? (
                  <View className="grid grid-cols-2 gap-4">
                    <View className="flex items-center">
                      <View className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mr-3">
                        <Scale size={20} color="#3B82F6" />
                      </View>
                      <View>
                        <Text className="block text-xs text-gray-500">体重</Text>
                        <Text className="block text-lg font-semibold text-gray-900">
                          {latestRecord.weight ?? '--'}
                          <Text className="text-xs font-normal text-gray-400"> kg</Text>
                        </Text>
                      </View>
                    </View>

                    <View className="flex items-center">
                      <View className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center mr-3">
                        <Activity size={20} color="#8B5CF6" />
                      </View>
                      <View>
                        <Text className="block text-xs text-gray-500">BMI</Text>
                        <Text className={`block text-lg font-semibold ${getBmiStatus(latestRecord.bmi || 22).color}`}>
                          {latestRecord.bmi ?? '--'}
                        </Text>
                      </View>
                    </View>

                    <View className="flex items-center">
                      <View className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center mr-3">
                        <Flame size={20} color="#F97316" />
                      </View>
                      <View>
                        <Text className="block text-xs text-gray-500">体脂率</Text>
                        <Text className={`block text-lg font-semibold ${getBodyFatStatus(latestRecord.body_fat || 20, user?.gender || 'male').color}`}>
                          {latestRecord.body_fat ?? '--'}
                          <Text className="text-xs font-normal text-gray-400"> %</Text>
                        </Text>
                      </View>
                    </View>

                    <View className="flex items-center">
                      <View className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mr-3">
                        <Zap size={20} color="#10B981" />
                      </View>
                      <View>
                        <Text className="block text-xs text-gray-500">骨骼肌</Text>
                        <Text className="block text-lg font-semibold text-gray-900">
                          {latestRecord.skeletal_muscle ?? '--'}
                          <Text className="text-xs font-normal text-gray-400"> kg</Text>
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View className="text-center py-6">
                    <Text className="block text-gray-400 mb-3">暂无记录</Text>
                    <Button onClick={goToRecord} size="sm">
                      <Plus size={16} className="mr-1" color="#fff" />
                      <Text className="block text-white">添加记录</Text>
                    </Button>
                  </View>
                )}
              </CardContent>
            </Card>
          </View>

          {/* 快捷操作 */}
          <View className="px-4 mt-4">
            <Text className="block text-lg font-semibold text-gray-900 mb-3">
              快捷操作
            </Text>
            <View className="grid grid-cols-3 gap-3">
              <Card className="rounded-xl" onClick={goToRecord}>
                <CardContent className="p-4 text-center">
                  <View className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Plus size={24} color="#3B82F6" />
                  </View>
                  <Text className="block text-sm font-medium text-gray-900">
                    记录数据
                  </Text>
                </CardContent>
              </Card>

              <Card className="rounded-xl" onClick={goToTrend}>
                <CardContent className="p-4 text-center">
                  <View className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-2">
                    <TrendingUp size={24} color="#8B5CF6" />
                  </View>
                  <Text className="block text-sm font-medium text-gray-900">
                    趋势分析
                  </Text>
                </CardContent>
              </Card>

              <Card className="rounded-xl" onClick={handleShowAnalysis}>
                <CardContent className="p-4 text-center">
                  <View className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Target size={24} color="#10B981" />
                  </View>
                  <Text className="block text-sm font-medium text-gray-900">
                    智能分析
                  </Text>
                </CardContent>
              </Card>
            </View>
          </View>

          {/* 减脂状态提示 */}
          {quickStats && quickStats.totalRecords >= 2 && (
            <View className="px-4 mt-4">
              <Card className="rounded-xl">
                <CardContent className="p-4">
                  <View className="flex items-center mb-2">
                    {quickStats.fatLossEffective ? (
                      <View className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                        <TrendingDown size={16} color="#10B981" />
                      </View>
                    ) : (
                      <View className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-2">
                        <TrendingUp size={16} color="#F97316" />
                      </View>
                    )}
                    <Text className="block text-sm font-semibold text-gray-900">
                      近期趋势
                    </Text>
                  </View>
                  <Text className="block text-sm text-gray-600">
                    {quickStats.fatLossEffective
                      ? quickStats.muscleLoss
                        ? '减脂有效，但肌肉有所流失，建议加强力量训练'
                        : '减脂有效，肌肉保持良好，继续保持！'
                      : '体脂变化不明显，建议调整饮食和运动计划'}
                  </Text>
                </CardContent>
              </Card>
            </View>
          )}
        </>
      )}

      {/* 智能分析弹窗 */}
      <AlertDialog open={showAnalysisDialog} onOpenChange={(open) => {
        if (!open) {
          setShowAnalysisDialog(false);
        }
      }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <View className="flex items-center justify-between w-full">
              <AlertDialogTitle>智能分析</AlertDialogTitle>
              <View
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                onClick={() => setShowAnalysisDialog(false)}
              >
                <Text className="block text-gray-500 text-lg leading-none">✕</Text>
              </View>
            </View>
          </AlertDialogHeader>
          
          <View className="py-2">
            {quickStats && (
              <>
                {/* 综合得分 */}
                <View className="flex items-center mb-4 p-4 bg-gray-50 rounded-xl">
                  <View className="w-16 h-16 bg-white rounded-full flex items-center justify-center mr-4 shadow-sm">
                    <Text className={`block text-3xl font-bold ${getScoreColor(quickStats.score)}`}>
                      {quickStats.score}
                    </Text>
                  </View>
                  <View>
                    <Text className="block text-sm font-medium text-gray-500">综合健康得分</Text>
                    <Text className={`block text-lg font-semibold ${getScoreColor(quickStats.score)}`}>
                      {getScoreLabel(quickStats.score)}
                    </Text>
                  </View>
                </View>

                {/* 建议列表 */}
                <View className="space-y-3 mb-4">
                  {quickStats.suggestions.map((suggestion, index) => (
                    <View key={index} className="flex items-start">
                      <View className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-1 ${
                        index === 0 ? 'bg-blue-100' : 'bg-green-100'
                      }`}
                      >
                        {index === 0 ? (
                          <Lightbulb size={14} color="#3B82F6" />
                        ) : (
                          <Check size={14} color="#10B981" />
                        )}
                      </View>
                      <Text className="block text-sm text-gray-700 flex-1 leading-relaxed">
                        {suggestion}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>

          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowAnalysisDialog(false)}>
              <Text className="block text-white">关闭</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </View>
  );
};

export default IndexPage;
