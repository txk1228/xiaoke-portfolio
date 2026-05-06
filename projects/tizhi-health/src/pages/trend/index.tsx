import { View, Text, Canvas } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { Network } from '@/network';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react-taro';

interface TrendDataPoint {
  date: string;
  weight?: number;
  bmi?: number;
  body_fat?: number;
  skeletal_muscle?: number;
  waist_hip_ratio?: number;
}

interface Changes {
  weight?: { value: number; percent: number };
  bmi?: { value: number; percent: number };
  body_fat?: { value: number; percent: number };
  skeletal_muscle?: { value: number; percent: number };
}

interface TrendAnalysis {
  period: '7days' | '30days' | 'all';
  data: TrendDataPoint[];
  changes: Changes;
}

const metricOptions = [
  { value: 'weight', label: '体重', unit: 'kg' },
  { value: 'bmi', label: 'BMI', unit: '' },
  { value: 'body_fat', label: '体脂率', unit: '%' },
  { value: 'skeletal_muscle', label: '骨骼肌', unit: 'kg' },
];

const TrendPage = () => {
  const [userId, setUserId] = useState<string>('');
  // 修改时间范围选项：近30天 vs 全部数据
  const [period, setPeriod] = useState<'30days' | 'all'>('30days');
  const [metric, setMetric] = useState('weight');
  const [trendData, setTrendData] = useState<TrendAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; value?: number; date?: string }>({
    visible: false,
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const userInfo = Taro.getStorageSync('userInfo');
    if (userInfo?.id) {
      setUserId(userInfo.id);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      loadTrendData();
    }
  }, [userId, period]);

  const loadTrendData = async () => {
    try {
      setLoading(true);
      // days: 30 表示近30天，0 表示全部数据
      const days = period === 'all' ? 0 : 30;
      const res = await Network.request({
        url: `/api/trend/${userId}`,
        data: { days },
      });

      console.log('趋势数据:', res.data);

      if (res.data?.code === 200) {
        setTrendData(res.data.data);
      }
    } catch (error) {
      console.error('加载趋势数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChangeIcon = (value: number | undefined) => {
    if (value === undefined || value === 0) {
      return <Minus size={16} color="#64748B" />;
    }
    return value > 0 ? (
      <TrendingUp size={16} color="#EF4444" />
    ) : (
      <TrendingDown size={16} color="#10B981" />
    );
  };

  const getChangeColor = (value: number | undefined) => {
    if (value === undefined || value === 0) return 'text-gray-500';
    // 体重和体脂下降是好的
    if (metric === 'weight' || metric === 'body_fat') {
      return value < 0 ? 'text-green-500' : 'text-red-500';
    }
    // 肌肉增长是好的
    if (metric === 'skeletal_muscle') {
      return value > 0 ? 'text-green-500' : 'text-red-500';
    }
    return value > 0 ? 'text-blue-500' : 'text-gray-500';
  };

  const formatChange = (change: { value: number; percent: number } | undefined) => {
    if (!change) return { value: '--', percent: '--' };
    const sign = change.value >= 0 ? '+' : '';
    const percentSign = change.percent >= 0 ? '+' : '';
    return {
      value: `${sign}${change.value.toFixed(1)}`,
      percent: `${percentSign}${change.percent.toFixed(1)}%`,
    };
  };

  // 格式化日期为 YY/MM/DD 格式
  const formatDate = (dateStr: string) => {
    // dateStr 格式为 YYYY-MM-DD
    const year = dateStr.slice(2, 4);
    const month = dateStr.slice(5, 7);
    const day = dateStr.slice(8, 10);
    return `${year}/${month}/${day}`;
  };

  const renderSimpleChart = () => {
    if (!trendData || trendData.data.length === 0) {
      return (
        <View className="h-48 flex items-center justify-center">
          <Text className="block text-gray-400">暂无数据</Text>
        </View>
      );
    }

    const data = trendData.data;
    const values = data
      .map((d) => d[metric as keyof TrendDataPoint] as number | undefined)
      .filter((v): v is number => v !== undefined);

    if (values.length === 0) {
      return (
        <View className="h-48 flex items-center justify-center">
          <Text className="block text-gray-400">该指标暂无数据</Text>
        </View>
      );
    }

    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;
    const chartHeight = 160;
    const chartWidth = 300;
    const padding = 20;
    const chartAreaWidth = chartWidth - padding * 2;

    // 计算点的位置
    const getPointPositions = () => {
      return data.map((d, i) => {
        const value = d[metric as keyof TrendDataPoint] as number | undefined;
        if (value === undefined) return null;
        const percent = (value - minVal) / range;
        const x = padding + (data.length === 1 ? chartAreaWidth / 2 : (i / (data.length - 1)) * chartAreaWidth);
        const y = chartHeight - (percent * (chartHeight - padding * 2));
        return { x, y, value, date: d.date };
      }).filter(Boolean) as { x: number; y: number; value: number; date: string }[];
    };

    const points = getPointPositions();

    // 生成折线 SVG path (用于参考)
    const _generateLinePath = () => {
      if (points.length < 2) return '';
      return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    };
    void _generateLinePath; // 避免未使用警告

    return (
      <View className="relative">
        {/* Y轴标签 */}
        <View className="absolute left-0 top-0 bottom-0 flex flex-col justify-between py-2">
          <Text className="block text-xs text-gray-400">{maxVal.toFixed(1)}</Text>
          <Text className="block text-xs text-gray-400">{((maxVal + minVal) / 2).toFixed(1)}</Text>
          <Text className="block text-xs text-gray-400">{minVal.toFixed(1)}</Text>
        </View>

        {/* 图表区域 */}
        <View className="ml-10 relative" style={{ height: `${chartHeight}px` }}>
          {/* 背景网格线 */}
          <View className="absolute inset-0 flex flex-col justify-between">
            <View className="h-px bg-gray-100" />
            <View className="h-px bg-gray-100" />
            <View className="h-px bg-gray-100" />
          </View>

          {/* 折线图 - 使用 Canvas 组件绘制 */}
          <Canvas
            canvasId="trendChart"
            style={{ width: `${chartWidth}px`, height: `${chartHeight}px` }}
            onTouchStart={(e) => handleTouch(e, points)}
            onTouchMove={(e) => handleTouch(e, points)}
          />
        </View>

        {/* X轴标签 */}
        <View className="ml-10 flex justify-between mt-2 px-2">
          {data.length > 0 && (
            <>
              <Text className="block text-xs text-gray-400">{formatDate(data[0].date)}</Text>
              {data.length > 1 && (
                <Text className="block text-xs text-gray-400">{formatDate(data[data.length - 1].date)}</Text>
              )}
            </>
          )}
        </View>

        {/* 悬浮提示 */}
        {tooltip.visible && (
          <View
            className="absolute bg-gray-800 text-white text-xs px-2 py-1 rounded"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y - 30}px`,
              transform: 'translateX(-50%)',
            }}
          >
            <Text className="block text-white text-xs">
              {tooltip.value?.toFixed(1)} {currentMetric?.unit}
            </Text>
            <Text className="block text-gray-300 text-xs">{tooltip.date}</Text>
          </View>
        )}
      </View>
    );
  };

  // Canvas 触摸事件处理
  const handleTouch = (e: any, points: { x: number; y: number; value: number; date: string }[]) => {
    if (points.length === 0) return;
    const touchX = e.touches?.[0]?.x || e.detail?.x;
    if (touchX === undefined) return;

    // 找到最近的点
    let nearest = points[0];
    let minDist = Math.abs(points[0].x - touchX);
    for (const p of points) {
      const dist = Math.abs(p.x - touchX);
      if (dist < minDist) {
        minDist = dist;
        nearest = p;
      }
    }

    setTooltip({ visible: true, x: nearest.x + 40, y: nearest.y, value: nearest.value, date: nearest.date });
  };

  // Canvas 绘制
  useEffect(() => {
    if (!trendData || trendData.data.length < 2) return;

    const ctx = Taro.createCanvasContext('trendChart');
    const data = trendData.data;
    const values = data.map((d) => d[metric as keyof TrendDataPoint] as number | undefined).filter((v): v is number => v !== undefined);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;
    const chartHeight = 160;
    const padding = 20;
    const chartAreaWidth = 300 - padding * 2;

    // 计算点位置
    const points = data.map((d, i) => {
      const value = d[metric as keyof TrendDataPoint] as number | undefined;
      if (value === undefined) return null;
      const percent = (value - minVal) / range;
      const x = padding + (data.length === 1 ? chartAreaWidth / 2 : (i / (data.length - 1)) * chartAreaWidth);
      const y = chartHeight - (percent * (chartHeight - padding * 2));
      // 使用完整日期格式 MM-DD 或 MM/DD (包含年份会在tooltip显示)
      const dateStr = d.date; // 格式为 YYYY-MM-DD
      return { x, y, value, date: dateStr };
    }).filter(Boolean) as { x: number; y: number; value: number; date: string }[];

    // 绘制背景
    ctx.setFillStyle('#f9fafb');
    ctx.fillRect(0, 0, 300, chartHeight);

    // 绘制网格线
    ctx.setStrokeStyle('#f3f4f6');
    ctx.setLineWidth(1);
    for (let i = 0; i < 4; i++) {
      const y = padding + (i / 3) * (chartHeight - padding * 2);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(300 - padding, y);
      ctx.stroke();
    }

    // 绘制填充区域
    ctx.setFillStyle('rgba(139, 92, 246, 0.1)');
    ctx.beginPath();
    points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, chartHeight - padding);
      ctx.lineTo(p.x, p.y);
    });
    ctx.lineTo(points[points.length - 1].x, chartHeight - padding);
    ctx.closePath();
    ctx.fill();

    // 绘制折线
    ctx.setStrokeStyle('#8B5CF6');
    ctx.setLineWidth(2);
    ctx.setLineCap('round');
    ctx.setLineJoin('round');
    ctx.beginPath();
    points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // 绘制数据点
    ctx.setFillStyle('#8B5CF6');
    points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
      ctx.setFillStyle('#ffffff');
      ctx.fill();
      ctx.setStrokeStyle('#8B5CF6');
      ctx.setLineWidth(2);
      ctx.stroke();
    });

    // 绘制 X 轴日期标签（格式 YY/MM/DD）
    const labelCount = Math.min(points.length, 5);
    ctx.setFillStyle('#6B7280');
    ctx.setFontSize(10);
    for (let i = 0; i < labelCount; i++) {
      const idx = Math.floor((i / (labelCount - 1)) * (points.length - 1));
      const p = points[idx];
      if (p) {
        const date = p.date; // 格式为 YYYY-MM-DD
        // 转换为 YY/MM/DD 格式
        const year = date.slice(2, 4); // 取后两位年份
        const month = date.slice(5, 7);
        const day = date.slice(8, 10);
        const label = `${year}/${month}/${day}`;
        ctx.fillText(label, p.x - 15, chartHeight + 12);
      }
    }

    ctx.draw();
  }, [trendData, metric]);

  const currentMetric = metricOptions.find((m) => m.value === metric);
  const currentChange = trendData?.changes?.[metric as keyof Changes];

  return (
    <View className="min-h-screen bg-gray-50 pb-20">
      {/* 头部 */}
      <View className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 pt-8 pb-16">
        <Text className="block text-white text-xl font-bold">趋势分析</Text>
        <Text className="block text-purple-100 text-sm mt-1">
          追踪您的身体数据变化
        </Text>
      </View>

      {loading ? (
        <View className="px-4 -mt-10">
          <Skeleton className="h-8 w-48 mb-4 rounded-lg" />
          <Skeleton className="h-48 mb-4 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </View>
      ) : (
        <>
          {/* 时间范围选择 */}
          <View className="px-4 -mt-10">
            <View className="flex bg-white rounded-xl p-1 shadow-sm">
              <Button
                variant={period === '30days' ? 'default' : 'ghost'}
                className={`flex-1 rounded-lg ${period === '30days' ? 'bg-purple-500' : ''}`}
                onClick={() => setPeriod('30days')}
              >
                <Text className={`block text-sm ${period === '30days' ? 'text-white' : 'text-gray-600'}`}>
                  近30天
                </Text>
              </Button>
              <Button
                variant={period === 'all' ? 'default' : 'ghost'}
                className={`flex-1 rounded-lg ${period === 'all' ? 'bg-purple-500' : ''}`}
                onClick={() => setPeriod('all')}
              >
                <Text className={`block text-sm ${period === 'all' ? 'text-white' : 'text-gray-600'}`}>
                  全部数据
                </Text>
              </Button>
            </View>
          </View>

          {/* 指标选择 */}
          <View className="px-4 mt-4">
            <View className="flex gap-2 overflow-x-auto pb-2">
              {metricOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={metric === option.value ? 'default' : 'outline'}
                  size="sm"
                  className={`flex-shrink-0 ${metric === option.value ? 'bg-purple-500' : ''}`}
                  onClick={() => setMetric(option.value)}
                >
                  <Text className={`block text-xs ${metric === option.value ? 'text-white' : 'text-gray-600'}`}>
                    {option.label}
                  </Text>
                </Button>
              ))}
            </View>
          </View>

          {/* 趋势图表 */}
          <View className="px-4 mt-4">
            <Card className="rounded-2xl">
              <CardContent className="p-4">
                <View className="flex items-center justify-between mb-4">
                  <Text className="block text-base font-semibold text-gray-900">
                    {currentMetric?.label}趋势
                  </Text>
                  {currentChange && (
                    <View className="flex items-center">
                      {getChangeIcon(currentChange.value)}
                      <Text className={`block text-sm font-medium ml-1 ${getChangeColor(currentChange.value)}`}>
                        {formatChange(currentChange).value} {currentMetric?.unit}
                      </Text>
                      <Text className={`block text-xs ml-1 ${getChangeColor(currentChange.value)}`}>
                        ({formatChange(currentChange).percent})
                      </Text>
                    </View>
                  )}
                </View>
                {renderSimpleChart()}
              </CardContent>
            </Card>
          </View>

          {/* 变化详情 */}
          {trendData && trendData.data.length >= 2 && (
            <View className="px-4 mt-4">
              <Card className="rounded-2xl">
                <CardContent className="p-4">
                  <Text className="block text-sm font-medium text-gray-500 mb-3">
                    变化详情
                  </Text>
                  <View className="space-y-3">
                    {metricOptions.map((option) => {
                      const change = trendData.changes?.[option.value as keyof Changes];
                      return (
                        <View key={option.value} className="flex items-center justify-between">
                          <Text className="block text-sm text-gray-600">{option.label}</Text>
                          <View className="flex items-center">
                            {getChangeIcon(change?.value)}
                            <Text className={`block text-sm font-medium ml-1 ${
                              change?.value
                                ? option.value === 'weight' || option.value === 'body_fat'
                                  ? change.value < 0 ? 'text-green-500' : 'text-red-500'
                                  : change.value > 0 ? 'text-green-500' : 'text-red-500'
                                : 'text-gray-400'
                            }`}
                            >
                              {change ? `${change.value >= 0 ? '+' : ''}${change.value.toFixed(1)} ${option.unit}` : '--'}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </CardContent>
              </Card>
            </View>
          )}

          {/* 记录数量提示 */}
          {trendData && (
            <View className="px-4 mt-4 mb-4">
              <Text className="block text-xs text-gray-400 text-center">
                共 {trendData.data.length} 条记录
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default TrendPage;
