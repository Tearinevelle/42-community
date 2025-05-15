import { useState } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/ui/header";
import { FeatureCard } from "@/components/ui/card";
import { QuickStartSection } from "@/components/ui/quick-start-section";
import { ConfigForm } from "@/components/ui/config-form";
import type { FeatureCard as FeatureCardType } from "@/lib/utils";

export default function Home() {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const features: FeatureCardType[] = [
    {
      title: "Клиентская часть",
      subtitle: "React + TypeScript",
      description: "Клиентская часть приложения с использованием React, TypeScript и Tailwind CSS.",
      icon: "fa fa-desktop",
      iconBgColor: "bg-primary"
    },
    {
      title: "Серверная часть",
      subtitle: "Node.js + Express",
      description: "Серверная часть приложения с использованием Node.js, Express и TypeScript.",
      icon: "fa fa-server",
      iconBgColor: "bg-secondary"
    },
    {
      title: "База данных",
      subtitle: "Drizzle ORM",
      description: "Работа с базой данных через ORM Drizzle с поддержкой SQL баз данных.",
      icon: "fa fa-database",
      iconBgColor: "bg-indigo-500"
    }
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar className={sidebarVisible ? "flex" : ""} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onToggleSidebar={toggleSidebar} />

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-gray-900">Клиент-серверное приложение</h1>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="py-4">
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Стартовая настройка проекта</h2>
                  <p className="text-gray-600 mb-4">
                    Проект настроен с использованием TypeScript, Tailwind CSS, Vite и Drizzle. 
                    Структура проекта содержит директории client, server и shared.
                  </p>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <pre className="text-sm text-gray-700">
                      <code>
{`├── client/          # Клиентская часть приложения
├── server/          # Серверная часть приложения
├── shared/          # Общие компоненты и типы
├── components.json  # Конфигурация компонентов
├── drizzle.config.ts # Конфигурация ORM
├── package.json     # Зависимости проекта
├── postcss.config.js # Конфигурация PostCSS
├── tailwind.config.ts # Конфигурация Tailwind CSS
├── tsconfig.json    # Настройки TypeScript
└── vite.config.ts   # Конфигурация Vite`}
                      </code>
                    </pre>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {features.map((feature, index) => (
                    <FeatureCard
                      key={index}
                      title={feature.title}
                      subtitle={feature.subtitle}
                      description={feature.description}
                      icon={feature.icon}
                      iconBgColor={feature.iconBgColor}
                    />
                  ))}
                </div>

                <QuickStartSection />
                <ConfigForm />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
