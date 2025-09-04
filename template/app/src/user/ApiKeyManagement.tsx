import { useState } from 'react';
import type { User } from 'wasp/entities';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Eye, EyeOff, Copy, Trash2, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: Date;
  lastUsedAt?: Date;
  isActive: boolean;
}

interface ApiKeyManagementProps {
  user: User;
}

export function ApiKeyManagement({ user }: ApiKeyManagementProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Production API',
      key: 'sk_live_1234567890abcdef',
      createdAt: new Date('2024-01-15'),
      lastUsedAt: new Date('2024-01-20'),
      isActive: true,
    },
    {
      id: '2',
      name: 'Development API',
      key: 'sk_test_abcdef1234567890',
      createdAt: new Date('2024-01-10'),
      isActive: true,
    },
  ]);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('API密钥已复制到剪贴板');
    } catch (err) {
      toast.error('复制失败');
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('请输入API密钥名称');
      return;
    }

    setIsCreating(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newKey: ApiKey = {
        id: Date.now().toString(),
        name: newKeyName,
        key: `sk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        createdAt: new Date(),
        isActive: true,
      };
      
      setApiKeys(prev => [...prev, newKey]);
      setNewKeyName('');
      toast.success('API密钥创建成功');
    } catch (error) {
      toast.error('创建API密钥失败');
    } finally {
      setIsCreating(false);
    }
  };

  const deleteApiKey = async (keyId: string) => {
    if (!confirm('确定要删除这个API密钥吗？此操作不可撤销。')) {
      return;
    }

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      setApiKeys(prev => prev.filter(key => key.id !== keyId));
      toast.success('API密钥已删除');
    } catch (error) {
      toast.error('删除API密钥失败');
    }
  };

  const maskApiKey = (key: string) => {
    return key.substring(0, 12) + '•'.repeat(key.length - 16) + key.substring(key.length - 4);
  };

  return (
    <Card className='mb-4 lg:m-8'>
      <CardHeader>
        <CardTitle className='text-base font-semibold leading-6 text-foreground'>
          API密钥管理
        </CardTitle>
        <p className='text-sm text-muted-foreground'>
          管理您的API密钥，用于访问数据抓取服务。请妥善保管您的密钥。
        </p>
      </CardHeader>
      <CardContent className='p-0'>
        {/* 创建新密钥 */}
        <div className='py-4 px-6'>
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='flex-1'>
              <Label htmlFor='keyName' className='text-sm font-medium text-muted-foreground'>
                密钥名称
              </Label>
              <Input
                id='keyName'
                type='text'
                placeholder='例如：生产环境API'
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className='mt-1'
              />
            </div>
            <div className='flex items-end'>
              <Button
                onClick={createApiKey}
                disabled={isCreating || !newKeyName.trim()}
                className='flex items-center gap-2'
              >
                <Plus className='h-4 w-4' />
                {isCreating ? '创建中...' : '创建密钥'}
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* API密钥列表 */}
        <div className='py-4 px-6'>
          {apiKeys.length === 0 ? (
            <div className='text-center py-8 text-muted-foreground'>
              <p>暂无API密钥</p>
              <p className='text-sm'>创建您的第一个API密钥开始使用服务</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {apiKeys.map((apiKey, index) => (
                <div key={apiKey.id}>
                  {index > 0 && <Separator className='mb-4' />}
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <h4 className='font-medium text-foreground'>{apiKey.name}</h4>
                        <p className='text-sm text-muted-foreground'>
                          创建于 {apiKey.createdAt.toLocaleDateString()}
                          {apiKey.lastUsedAt && (
                            <span> • 最后使用 {apiKey.lastUsedAt.toLocaleDateString()}</span>
                          )}
                        </p>
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          apiKey.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {apiKey.isActive ? '活跃' : '已禁用'}
                        </span>
                      </div>
                    </div>
                    
                    <div className='flex items-center gap-2'>
                      <div className='flex-1 font-mono text-sm bg-muted p-2 rounded border'>
                        {showKeys[apiKey.id] ? apiKey.key : maskApiKey(apiKey.key)}
                      </div>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                        className='flex items-center gap-1'
                      >
                        {showKeys[apiKey.id] ? (
                          <EyeOff className='h-4 w-4' />
                        ) : (
                          <Eye className='h-4 w-4' />
                        )}
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => copyToClipboard(apiKey.key)}
                        className='flex items-center gap-1'
                      >
                        <Copy className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => deleteApiKey(apiKey.id)}
                        className='flex items-center gap-1 text-red-600 hover:text-red-700'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}