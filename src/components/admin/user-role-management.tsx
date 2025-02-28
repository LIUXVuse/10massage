"use client";

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export function UserRoleManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // 獲取用戶列表
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('獲取用戶列表失敗');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('獲取用戶列表錯誤:', error);
      toast.error('獲取用戶列表失敗');
    } finally {
      setLoading(false);
    }
  };

  // 更新用戶角色
  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      setLoadingId(userId);
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: userId, role: newRole }),
      });

      if (!response.ok) {
        throw new Error('更新用戶角色失敗');
      }

      // 更新本地狀態
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      toast.success('用戶角色已更新');
    } catch (error) {
      console.error('更新用戶角色錯誤:', error);
      toast.error('更新用戶角色失敗');
    } finally {
      setLoadingId(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                用戶名
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                電子郵件
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                目前角色
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                設定角色
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-center">
                  載入中...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-center">
                  沒有用戶數據
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.image ? (
                        <img className="h-10 w-10 rounded-full mr-3" src={user.image} alt={user.name} />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
                          <span className="text-gray-500">{user.name?.[0]?.toUpperCase() || '?'}</span>
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name || '未命名'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${user.role?.toUpperCase() === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 
                      user.role?.toUpperCase() === 'MASSEUR' ? 'bg-green-100 text-green-800' : 
                      'bg-blue-100 text-blue-800'}`}>
                      {user.role?.toUpperCase() === 'ADMIN' ? '管理員' : 
                       user.role?.toUpperCase() === 'MASSEUR' ? '按摩師' : '一般用戶'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <select
                      value={user.role}
                      onChange={(e) => updateUserRole(user.id, e.target.value)}
                      disabled={loadingId === user.id}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="user">一般用戶</option>
                      <option value="masseur">按摩師</option>
                      <option value="admin">管理員</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 