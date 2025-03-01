import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">頁面未找到</h2>
        <p className="text-gray-600 mb-6">
          您嘗試訪問的頁面不存在或已被移除。
        </p>
        <Link href="/">
          <Button className="flex items-center space-x-2">
            <Home className="h-4 w-4" />
            <span>返回首頁</span>
          </Button>
        </Link>
      </div>
    </div>
  );
} 