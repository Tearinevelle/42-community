import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";
import { initTelegramLogin, TelegramAuthData } from "@/lib/telegram";
import { TELEGRAM_BOT_NAME } from "@/lib/constants";

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export default function Header({ onToggleMobileMenu }: HeaderProps) {
  const [location] = useLocation();
  const { user, isAuthenticated, login, logout } = useAuth();
  const isMobile = useMobile();
  const { toast } = useToast();
  const telegramLoginRef = useRef<HTMLDivElement>(null);

  // Get page title based on current location
  const getPageTitle = () => {
    const path = location;
    switch (path) {
      case "/":
        return "Главная";
      case "/profile":
        return "Профиль";
      case "/chat":
        return "Чаты";
      case "/marketplace":
        return "Маркет";
      case "/events":
        return "Сходки";
      case "/blog":
        return "Блог";
      case "/videos":
        return "Короткие видео";
      case "/settings":
        return "Настройки";
      default:
        return "Сеть";
    }
  };

  // Handle successful Telegram login
  const handleTelegramLogin = async (authData: TelegramAuthData) => {
    try {
      await login(authData);
      toast({
        title: "Успешный вход",
        description: "Вы успешно вошли в систему",
      });
    } catch (error) {
      toast({
        title: "Ошибка входа",
        description: "Не удалось войти через Telegram",
        variant: "destructive",
      });
    }
  };

  // Initialize Telegram login
  useEffect(() => {
    if (!isAuthenticated && telegramLoginRef.current) {
      const container = telegramLoginRef.current;
      container.innerHTML = ''; // Очищаем контейнер перед инициализацией
      initTelegramLogin(TELEGRAM_BOT_NAME, "telegram-login", handleTelegramLogin);
    }
  }, [isAuthenticated]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Выход выполнен",
        description: "Вы успешно вышли из системы",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось выйти из системы",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-primary border-b border-gray-800 py-3 px-4 md:px-6 flex items-center justify-between">
      {isMobile ? (
        <button 
          onClick={onToggleMobileMenu}
          className="text-white focus:outline-none"
        >
          <i className="fas fa-bars text-xl"></i>
        </button>
      ) : (
        <div>
          <h1 className="text-xl font-montserrat font-bold">{getPageTitle()}</h1>
        </div>
      )}

      <div className="flex items-center space-x-4 ml-auto">
        {!isAuthenticated && (
          <div className="hidden md:block" id="telegram-login" ref={telegramLoginRef}></div>
        )}
        
        {isAuthenticated && (
          <>
            <div className="relative">
              <button className="text-white focus:outline-none">
                <i className="fas fa-bell text-xl"></i>
                <span className="notification-dot"></span>
              </button>
            </div>

            <div className="relative">
              <button className="text-white focus:outline-none">
                <i className="fas fa-envelope text-xl"></i>
                <span className="notification-dot"></span>
              </button>
            </div>

            <div className="hidden md:block">
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <i className="fas fa-sign-out-alt"></i>
                <span>Выйти</span>
              </Button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}