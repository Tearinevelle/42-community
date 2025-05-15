import { useState } from "react";
import { Link } from "wouter";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <div className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center md:hidden">
              <button
                onClick={onToggleSidebar}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              >
                <i className="fa fa-bars"></i>
              </button>
            </div>
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
              <Link href="/" className="px-3 py-2 text-sm font-medium text-gray-900 rounded-md">
                Главная
              </Link>
              <Link href="/docs" className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 rounded-md">
                Документация
              </Link>
              <Link href="/settings" className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 rounded-md">
                Настройки
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Button className="relative inline-flex items-center px-4 py-2 text-sm font-medium">
                <i className="fa fa-plus mr-2"></i>
                Новый проект
              </Button>
            </div>
            <div className="ml-4 relative">
              <div>
                <button
                  type="button"
                  className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <span className="sr-only">Открыть меню пользователя</span>
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <i className="fa fa-user text-gray-600"></i>
                  </div>
                </button>
              </div>
              {isUserMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Профиль
                    </Link>
                    <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Настройки
                    </Link>
                    <button className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Выйти
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
