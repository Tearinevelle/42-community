import { cn } from "@/lib/utils";

interface QuickStartSectionProps {
  className?: string;
}

export function QuickStartSection({ className }: QuickStartSectionProps) {
  return (
    <div className={cn("bg-white p-6 rounded-lg shadow-md mt-6", className)}>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Начало работы</h2>
      <div className="space-y-4">
        <div className="rounded-md bg-blue-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fa fa-info-circle text-blue-400"></i>
            </div>
            <div className="ml-3 flex-1 md:flex md:justify-between">
              <p className="text-sm text-blue-700">Установите зависимости перед началом работы.</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-900 mb-2">1. Установка зависимостей</h3>
          <pre className="text-sm text-gray-700 bg-gray-100 p-2 rounded"><code>npm install</code></pre>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-900 mb-2">2. Запуск проекта в режиме разработки</h3>
          <pre className="text-sm text-gray-700 bg-gray-100 p-2 rounded"><code>npm run dev</code></pre>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-900 mb-2">3. Сборка проекта</h3>
          <pre className="text-sm text-gray-700 bg-gray-100 p-2 rounded"><code>npm run build</code></pre>
        </div>
      </div>
    </div>
  );
}
