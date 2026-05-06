import { View, Text, ScrollView } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { Network } from '@/network';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog } from '@/components/ui/dialog';
import {
  Activity,
  Brain,
  Target,
  CircleAlert,
  CircleCheck,
  Dumbbell,
  Utensils,
  Heart,
  RefreshCw,
  ChevronRight,
} from 'lucide-react-taro';

interface HealthAnalysis {
  score: number;
  level: 'excellent' | 'good' | 'fair' | 'poor';
  levelText: string;
  summary: string;
  metrics: {
    name: string;
    value: number;
    unit: string;
    status: 'normal' | 'warning' | 'danger';
    statusText: string;
    trend?: 'up' | 'down' | 'stable';
    trendText?: string;
  }[];
  suggestions: {
    category: 'exercise' | 'diet' | 'lifestyle' | 'health';
    title: string;
    content: string;
    priority: number;
  }[];
  fatLossAnalysis: {
    isEffective: boolean;
    muscleLoss: boolean;
    conclusion: string;
  };
}

const AnalysisPage = () => {
  const [userId, setUserId] = useState<string>('');
  const [analysis, setAnalysis] = useState<HealthAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [showSuggestionDetail, setShowSuggestionDetail] = useState<{
    title: string;
    content: string;
    category: string;
  } | null>(null);

  useEffect(() => {
    const user = Taro.getStorageSync('userInfo');
    if (user?.id) {
      setUserId(user.id);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      loadAnalysis();
    }
  }, [userId]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      const res = await Network.request({
        url: `/api/analysis/${userId}`,
      });

      console.log('分析结果:', res.data);

      if (res.data?.code === 200) {
        setAnalysis(res.data.data);
      }
    } catch (error) {
      console.error('加载分析失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshAnalysis = async () => {
    if (!userId) return;

    try {
      setAnalyzing(true);
      Taro.showLoading({ title: '分析中...' });

      const res = await Network.request({
        url: `/api/analysis/${userId}/refresh`,
        method: 'POST',
      });

      Taro.hideLoading();

      if (res.data?.code === 200) {
        setAnalysis(res.data.data);
        Taro.showToast({ title: '分析已更新', icon: 'success' });
      } else {
        Taro.showToast({ title: '分析失败', icon: 'none' });
      }
    } catch (error) {
      console.error('刷新分析失败:', error);
      Taro.hideLoading();
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return { bg: 'bg-green-500', text: 'text-green-500' };
    if (score >= 70) return { bg: 'bg-blue-500', text: 'text-blue-500' };
    if (score >= 60) return { bg: 'bg-yellow-500', text: 'text-yellow-500' };
    return { bg: 'bg-red-500', text: 'text-red-500' };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CircleCheck size={16} color="#10B981" />;
      case 'warning':
        return <CircleAlert size={16} color="#F59E0B" />;
      case 'danger':
        return <CircleAlert size={16} color="#EF4444" />;
      default:
        return <CircleCheck size={16} color="#10B981" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'exercise':
        return <Dumbbell size={20} color="#3B82F6" />;
      case 'diet':
        return <Utensils size={20} color="#10B981" />;
      case 'lifestyle':
        return <Heart size={20} color="#EC4899" />;
      case 'health':
        return <Activity size={20} color="#8B5CF6" />;
      default:
        return <Target size={20} color="#64748B" />;
    }
  };

  const getCategoryBg = (category: string) => {
    switch (category) {
      case 'exercise':
        return 'bg-blue-50';
      case 'diet':
        return 'bg-green-50';
      case 'lifestyle':
        return 'bg-pink-50';
      case 'health':
        return 'bg-purple-50';
      default:
        return 'bg-gray-50';
    }
  };

  if (!userId) {
    return (
      <View className="min-h-screen bg-gray-50 flex items-center justify-center">
        <View className="text-center px-8">
          <Text className="block text-gray-400 mb-2">请先设置用户信息</Text>
          <Text className="block text-sm text-gray-400">
            在我的页面完成设置后即可使用分析功能
          </Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View className="min-h-screen bg-gray-50 p-4">
        <Skeleton className="h-48 mb-4 rounded-2xl" />
        <Skeleton className="h-64 mb-4 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </View>
    );
  }

  const scoreColor = analysis ? getScoreColor(analysis.score) : { bg: 'bg-gray-300', text: 'text-gray-300' };

  return (
    <View className="min-h-screen bg-gray-50 pb-20">
      <ScrollView scrollY className="h-screen">
        {/* 头部 */}
        <View className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 pt-8 pb-16">
          <View className="flex items-center justify-between mb-4">
            <Text className="block text-white text-xl font-bold">智能分析</Text>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshAnalysis}
              disabled={analyzing}
            >
              <RefreshCw size={16} color="white" className={analyzing ? 'animate-spin' : ''} />
            </Button>
          </View>
          <Text className="block text-blue-100 text-sm">
            基于您的身体数据，为您提供个性化分析
          </Text>
        </View>

        {/* 综合得分 */}
        <View className="px-4 -mt-8">
          <Card className="rounded-2xl shadow-lg">
            <CardContent className="p-6">
              <View className="flex items-center">
                {/* 环形得分 */}
                <View className="relative">
                  <View className={`w-24 h-24 rounded-full ${scoreColor.bg} flex items-center justify-center`}>
                    <Text className="block text-white text-3xl font-bold">
                      {analysis?.score ?? '--'}
                    </Text>
                  </View>
                  <View className="absolute -bottom-1 -right-1">
                    {analysis?.level === 'excellent' && (
                      <Badge className="bg-green-500 text-white text-xs">优秀</Badge>
                    )}
                    {analysis?.level === 'good' && (
                      <Badge className="bg-blue-500 text-white text-xs">良好</Badge>
                    )}
                    {analysis?.level === 'fair' && (
                      <Badge className="bg-yellow-500 text-white text-xs">一般</Badge>
                    )}
                    {analysis?.level === 'poor' && (
                      <Badge className="bg-red-500 text-white text-xs">较差</Badge>
                    )}
                  </View>
                </View>

                <View className="ml-4 flex-1">
                  <Text className="block text-lg font-semibold text-gray-900">
                    {analysis?.levelText ?? '综合得分'}
                  </Text>
                  <Text className="block text-sm text-gray-500 mt-1">
                    {analysis?.summary ?? '记录更多数据以获得更准确的分析'}
                  </Text>
                </View>
              </View>
            </CardContent>
          </Card>
        </View>

        {/* 减脂效果分析 */}
        {analysis?.fatLossAnalysis && (
          <View className="px-4 mt-4">
            <Card className="rounded-2xl">
              <CardContent className="p-4">
                <View className="flex items-center mb-3">
                  <Target size={20} color="#3B82F6" className="mr-2" />
                  <Text className="block text-base font-semibold text-gray-900">
                    减脂效果分析
                  </Text>
                </View>
                <View className="space-y-2">
                  <View className="flex items-center">
                    <Badge variant={analysis.fatLossAnalysis.isEffective ? 'default' : 'secondary'}>
                      {analysis.fatLossAnalysis.isEffective ? '有效减脂' : '减脂效果待提升'}
                    </Badge>
                    {analysis.fatLossAnalysis.muscleLoss && (
                      <Badge variant="outline" className="ml-2 text-red-500 border-red-200">
                        注意肌肉流失
                      </Badge>
                    )}
                  </View>
                  <Text className="block text-sm text-gray-600 mt-2">
                    {analysis.fatLossAnalysis.conclusion}
                  </Text>
                </View>
              </CardContent>
            </Card>
          </View>
        )}

        {/* 指标状态 */}
        {analysis?.metrics && analysis.metrics.length > 0 && (
          <View className="px-4 mt-4">
            <Text className="block text-lg font-semibold text-gray-900 mb-3">
              指标状态
            </Text>
            <View className="grid grid-cols-2 gap-3">
              {analysis.metrics.map((metric, index) => (
                <Card key={index} className="rounded-xl">
                  <CardContent className="p-3">
                    <View className="flex items-start justify-between mb-1">
                      <Text className="block text-xs text-gray-500">{metric.name}</Text>
                      {getStatusIcon(metric.status)}
                    </View>
                    <Text className={`block text-lg font-semibold ${scoreColor.text}`}>
                      {metric.value}
                      <Text className="text-xs font-normal text-gray-400 ml-1">
                        {metric.unit}
                      </Text>
                    </Text>
                    <Text className={`block text-xs mt-1 ${
                      metric.status === 'normal' ? 'text-green-500' :
                      metric.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
                    }`}
                    >
                      {metric.statusText}
                    </Text>
                  </CardContent>
                </Card>
              ))}
            </View>
          </View>
        )}

        {/* 智能建议 */}
        {analysis?.suggestions && analysis.suggestions.length > 0 && (
          <View className="px-4 mt-4 pb-4">
            <Text className="block text-lg font-semibold text-gray-900 mb-3">
              个性化建议
            </Text>
            <View className="space-y-3">
              {analysis.suggestions
                .sort((a, b) => a.priority - b.priority)
                .map((suggestion, index) => (
                  <Card
                    key={index}
                    className="rounded-xl"
                    onClick={() => setShowSuggestionDetail(suggestion)}
                  >
                    <CardContent className="p-4">
                      <View className="flex items-start">
                        <View className={`w-10 h-10 rounded-full ${getCategoryBg(suggestion.category)} flex items-center justify-center mr-3`}>
                          {getCategoryIcon(suggestion.category)}
                        </View>
                        <View className="flex-1">
                          <View className="flex items-center justify-between">
                            <Text className="block text-sm font-semibold text-gray-900">
                              {suggestion.title}
                            </Text>
                            <ChevronRight size={16} color="#9CA3AF" />
                          </View>
                          <Text className="block text-xs text-gray-500 mt-1 line-clamp-2">
                            {suggestion.content}
                          </Text>
                        </View>
                      </View>
                    </CardContent>
                  </Card>
                ))}
            </View>
          </View>
        )}

        {/* 无数据 */}
        {!analysis && (
          <View className="px-4 mt-8 text-center">
            <Brain size={48} color="#D1D5DB" className="mx-auto mb-4" />
            <Text className="block text-gray-400 mb-2">暂无分析数据</Text>
            <Text className="block text-sm text-gray-400 mb-4">
              记录至少1条体脂数据后{'\n'}即可获得个性化分析
            </Text>
            <Button onClick={handleRefreshAnalysis} disabled={analyzing}>
              <Text className="block text-white">
                {analyzing ? '分析中...' : '立即分析'}
              </Text>
            </Button>
          </View>
        )}

        {/* 建议详情弹窗 */}
        <Dialog
          open={!!showSuggestionDetail}
          onOpenChange={() => setShowSuggestionDetail(null)}
        >
          {showSuggestionDetail && (
            <View className="p-4">
              <View className="flex items-center mb-4">
                <View className={`w-12 h-12 rounded-full ${getCategoryBg(showSuggestionDetail.category)} flex items-center justify-center mr-3`}>
                  {getCategoryIcon(showSuggestionDetail.category)}
                </View>
                <Text className="block text-lg font-semibold">
                  {showSuggestionDetail.title}
                </Text>
              </View>
              <Text className="block text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {showSuggestionDetail.content}
              </Text>
              <View className="mt-6">
                <Button
                  className="w-full"
                  onClick={() => setShowSuggestionDetail(null)}
                >
                  <Text className="block text-white">知道了</Text>
                </Button>
              </View>
            </View>
          )}
        </Dialog>
      </ScrollView>
    </View>
  );
};

export default AnalysisPage;
