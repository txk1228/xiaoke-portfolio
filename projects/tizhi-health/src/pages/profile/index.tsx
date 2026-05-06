import { View, Text } from '@tarojs/components';
import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { Network } from '@/network';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Smile, Calendar, Trash2 } from 'lucide-react-taro';

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
}

const ProfilePage = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [records, setRecords] = useState<BodyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 编辑弹窗状态
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    nickname: '',
    age: '',
    gender: 'male' as 'male' | 'female',
  });

  // 删除确认弹窗
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // 获取本地用户信息
      const localUser = Taro.getStorageSync('userInfo');
      if (localUser?.id) {
        setUser(localUser);
        setEditForm({
          nickname: localUser.nickname || '',
          age: localUser.age?.toString() || '',
          gender: localUser.gender || 'male',
        });

        // 获取服务器上的用户信息
        try {
          const userRes = await Network.request({
            url: `/api/users/${localUser.id}`,
          });
          if (userRes.data?.code === 200 && userRes.data.data) {
            const serverUser = userRes.data.data;
            setUser(serverUser);
            setEditForm({
              nickname: serverUser.nickname || '',
              age: serverUser.age?.toString() || '',
              gender: serverUser.gender || 'male',
            });
            Taro.setStorageSync('userInfo', serverUser);
          }
        } catch (e) {
          console.log('用户可能在服务器上不存在，需要创建');
        }

        // 获取记录列表 - 获取全部记录并按日期倒序排列
        const recordsRes = await Network.request({
          url: `/api/records/user/${localUser.id}`,
        });
        console.log('记录列表:', recordsRes.data);
        if (recordsRes.data?.code === 200) {
          // 按日期倒序排列（最新的在前）
          const allRecords = recordsRes.data.data || [];
          const sortedRecords = [...allRecords].sort((a, b) => 
            new Date(b.record_date).getTime() - new Date(a.record_date).getTime()
          );
          setRecords(sortedRecords);
        }
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 打开编辑弹窗
  const handleOpenEdit = () => {
    if (user) {
      setEditForm({
        nickname: user.nickname || '',
        age: user.age?.toString() || '',
        gender: user.gender || 'male',
      });
    } else {
      setEditForm({
        nickname: '',
        age: '',
        gender: 'male',
      });
    }
    setShowEditDialog(true);
  };

  // 保存用户信息
  const handleSaveUser = async () => {
    if (!editForm.nickname || !editForm.age) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    try {
      setSaving(true);

      if (user?.id) {
        // 更新现有用户
        const res = await Network.request({
          url: `/api/users/${user.id}`,
          method: 'PUT',
          data: {
            nickname: editForm.nickname,
            age: parseInt(editForm.age),
            gender: editForm.gender,
          },
        });

        if (res.data?.code === 200) {
          const updatedUser = { ...user, ...res.data.data };
          setUser(updatedUser);
          Taro.setStorageSync('userInfo', updatedUser);
          Taro.showToast({ title: '保存成功', icon: 'success' });
        }
      } else {
        // 创建新用户
        const res = await Network.request({
          url: '/api/users',
          method: 'POST',
          data: {
            nickname: editForm.nickname,
            age: parseInt(editForm.age),
            gender: editForm.gender,
          },
        });

        if (res.data?.code === 200) {
          setUser(res.data.data);
          Taro.setStorageSync('userInfo', res.data.data);
          Taro.showToast({ title: '创建成功', icon: 'success' });
        }
      }

      setShowEditDialog(false);
    } catch (error) {
      console.error('保存失败:', error);
      Taro.showToast({ title: '保存失败', icon: 'none' });
    } finally {
      setSaving(false);
    }
  };

  // 删除记录
  const handleDeleteRecord = async () => {
    if (!recordToDelete) return;

    try {
      const res = await Network.request({
        url: `/api/records/${recordToDelete}`,
        method: 'DELETE',
      });

      if (res.data?.code === 200) {
        setRecords(records.filter((r) => r.id !== recordToDelete));
        Taro.showToast({ title: '删除成功', icon: 'success' });
      } else {
        Taro.showToast({ title: '删除失败', icon: 'none' });
      }
    } catch (error) {
      console.error('删除失败:', error);
      Taro.showToast({ title: '删除失败', icon: 'none' });
    } finally {
      setShowDeleteDialog(false);
      setRecordToDelete(null);
    }
  };

  // 确认删除
  const confirmDelete = (recordId: string) => {
    setRecordToDelete(recordId);
    setShowDeleteDialog(true);
  };

  if (loading) {
    return (
      <View className="min-h-screen bg-gray-50 p-4">
        <Skeleton className="h-32 mb-4 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </View>
    );
  }

  return (
    <View className="min-h-screen bg-gray-50 pb-20">
      {/* 头部 */}
      <View className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 pt-8 pb-16">
        <View className="flex items-center justify-between">
          <View>
            <Text className="block text-white text-xl font-bold">
              {user?.nickname || '设置'}
            </Text>
            {user && (
              <Text className="block text-blue-100 text-sm mt-1">
                {user.age}岁 · {user.gender === 'male' ? '男' : '女'}
              </Text>
            )}
          </View>
          {/* 头像 - 与首页一致 */}
          <View className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f472b6 0%, #fb923c 100%)' }}>
            <Smile size={32} color="white" />
          </View>
        </View>
      </View>

      {/* 用户信息卡片 */}
      <View className="px-4 -mt-8">
        <Card className="rounded-2xl shadow-lg">
          <CardContent className="p-4">
            {!user ? (
              <View className="text-center py-4">
                <Text className="block text-gray-500 mb-4">
                  还没有设置个人信息
                </Text>
                <Button onClick={handleOpenEdit}>
                  <Text className="block text-white">立即设置</Text>
                </Button>
              </View>
            ) : (
              <View className="space-y-3">
                <View className="flex items-center justify-between">
                  <Text className="block text-gray-500 text-sm">昵称</Text>
                  <Text className="block text-gray-900 font-medium">{user.nickname}</Text>
                </View>
                <View className="flex items-center justify-between">
                  <Text className="block text-gray-500 text-sm">年龄</Text>
                  <Text className="block text-gray-900 font-medium">{user.age}岁</Text>
                </View>
                <View className="flex items-center justify-between">
                  <Text className="block text-gray-500 text-sm">性别</Text>
                  <Badge variant="outline">
                    {user.gender === 'male' ? '男' : '女'}
                  </Badge>
                </View>
              </View>
            )}

            <View className="mt-4 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleOpenEdit}
              >
                <Text className="block text-blue-600">
                  {user ? '编辑信息' : '设置信息'}
                </Text>
              </Button>
            </View>
          </CardContent>
        </Card>
      </View>

      {/* 记录列表 */}
      <View className="px-4 mt-6">
        <Text className="block text-lg font-semibold text-gray-900 mb-3">
          历史记录 ({records.length}条)
        </Text>

        {records.length > 0 ? (
          <View className="space-y-3">
            {records.map((record) => (
              <Card key={record.id} className="rounded-xl">
                <CardContent className="p-3">
                  <View className="flex items-center justify-between">
                    <View className="flex items-center">
                      <Calendar size={16} color="#64748B" className="mr-2" />
                      <Text className="block text-sm font-medium text-gray-900">
                        {record.record_date}
                      </Text>
                    </View>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => confirmDelete(record.id)}
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </Button>
                  </View>
                  <View className="flex flex-wrap gap-x-4 gap-y-1 mt-2 ml-6">
                    {record.weight && (
                      <Text className="block text-xs text-gray-500">
                        体重: {record.weight}kg
                      </Text>
                    )}
                    {record.bmi && (
                      <Text className="block text-xs text-gray-500">
                        BMI: {record.bmi}
                      </Text>
                    )}
                    {record.body_fat && (
                      <Text className="block text-xs text-gray-500">
                        体脂: {record.body_fat}%
                      </Text>
                    )}
                    {record.skeletal_muscle && (
                      <Text className="block text-xs text-gray-500">
                        骨骼肌: {record.skeletal_muscle}kg
                      </Text>
                    )}
                    {record.visceral_fat && (
                      <Text className="block text-xs text-gray-500">
                        内脏脂肪: {record.visceral_fat}
                      </Text>
                    )}
                    {record.water_rate && (
                      <Text className="block text-xs text-gray-500">
                        水分: {record.water_rate}%
                      </Text>
                    )}
                    {record.body_age && (
                      <Text className="block text-xs text-gray-500">
                        身体年龄: {record.body_age}岁
                      </Text>
                    )}
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        ) : (
          <Card className="rounded-xl">
            <CardContent className="p-6 text-center">
              <Text className="block text-gray-400">暂无记录</Text>
              <Text className="block text-sm text-gray-400 mt-1">
                开始记录你的第一条数据吧
              </Text>
            </CardContent>
          </Card>
        )}
      </View>

      {/* 编辑用户信息弹窗 */}
      <AlertDialog open={showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowEditDialog(false);
        }
      }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{user ? '编辑信息' : '设置信息'}</AlertDialogTitle>
          </AlertDialogHeader>
          <View className="space-y-4 mt-2 py-4">
            <View>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                昵称
              </Label>
              <View className="bg-gray-50 rounded-xl px-4 py-3">
                <Input
                  placeholder="请输入昵称"
                  value={editForm.nickname}
                  onInput={(e) =>
                    setEditForm((prev) => ({ ...prev, nickname: e.detail.value }))
                  }
                  className="w-full"
                />
              </View>
            </View>

            <View>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                年龄
              </Label>
              <View className="bg-gray-50 rounded-xl px-4 py-3">
                <Input
                  type="number"
                  placeholder="请输入年龄"
                  value={editForm.age}
                  onInput={(e) =>
                    setEditForm((prev) => ({ ...prev, age: e.detail.value }))
                  }
                  className="w-full"
                />
              </View>
            </View>

            <View>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                性别
              </Label>
              <View className="flex gap-3">
                <Button
                  variant={editForm.gender === 'male' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() =>
                    setEditForm((prev) => ({ ...prev, gender: 'male' }))
                  }
                >
                  <Text className={`block ${editForm.gender === 'male' ? 'text-white' : 'text-gray-600'}`}>
                    男
                  </Text>
                </Button>
                <Button
                  variant={editForm.gender === 'female' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() =>
                    setEditForm((prev) => ({ ...prev, gender: 'female' }))
                  }
                >
                  <Text className={`block ${editForm.gender === 'female' ? 'text-white' : 'text-gray-600'}`}>
                    女
                  </Text>
                </Button>
              </View>
            </View>
          </View>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowEditDialog(false)}>
              <Text className="block text-gray-600">取消</Text>
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveUser}>
              <Text className="block text-white">
                {saving ? '保存中...' : '保存'}
              </Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 删除确认弹窗 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={(open) => {
        if (!open) {
          setShowDeleteDialog(false);
          setRecordToDelete(null);
        }
      }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
          </AlertDialogHeader>
          <Text className="block text-sm text-gray-500 py-2">
            确定要删除这条记录吗？此操作无法撤销。
          </Text>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteDialog(false);
              setRecordToDelete(null);
            }}
            >
              <Text className="block text-gray-600">取消</Text>
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRecord} className="bg-red-500 hover:bg-red-600">
              <Text className="block text-white">删除</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </View>
  );
};

export default ProfilePage;
