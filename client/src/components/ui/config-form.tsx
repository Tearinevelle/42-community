import { useState } from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface ConfigFormProps {
  className?: string;
}

interface ConfigFormData {
  projectName: string;
  dbConnection: string;
  apiPort: string;
  enableAuth: boolean;
}

export function ConfigForm({ className }: ConfigFormProps) {
  const [config, setConfig] = useState<ConfigFormData>({
    projectName: "",
    dbConnection: "",
    apiPort: "3000",
    enableAuth: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setConfig({
      ...config,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // В реальном приложении здесь был бы код для отправки данных на сервер
    toast({
      title: "Успешно",
      description: "Настройки сохранены успешно!",
    });
  };

  return (
    <div className={cn("bg-white p-6 rounded-lg shadow-md mt-6", className)}>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Настройка окружения</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
              Название проекта
            </label>
            <input
              type="text"
              name="projectName"
              id="projectName"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Мой проект"
              value={config.projectName}
              onChange={handleInputChange}
            />
          </div>
          
          <div>
            <label htmlFor="dbConnection" className="block text-sm font-medium text-gray-700">
              Строка подключения к БД
            </label>
            <input
              type="text"
              name="dbConnection"
              id="dbConnection"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="postgresql://user:password@localhost:5432/mydb"
              value={config.dbConnection}
              onChange={handleInputChange}
            />
          </div>
          
          <div>
            <label htmlFor="apiPort" className="block text-sm font-medium text-gray-700">
              Порт API
            </label>
            <input
              type="number"
              name="apiPort"
              id="apiPort"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="3000"
              value={config.apiPort}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="enableAuth"
                name="enableAuth"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                checked={config.enableAuth}
                onChange={handleInputChange}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="enableAuth" className="font-medium text-gray-700">
                Включить аутентификацию
              </label>
              <p className="text-gray-500">Активирует систему регистрации и авторизации в приложении.</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Отмена
          </Button>
          <Button type="submit" className="ml-3">
            Сохранить
          </Button>
        </div>
      </form>
    </div>
  );
}
