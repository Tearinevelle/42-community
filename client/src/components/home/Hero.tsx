import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useRef, useEffect } from "react";
import { initTelegramLogin, TelegramAuthData } from "@/lib/telegram";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { TELEGRAM_BOT_NAME } from "@/lib/constants";

export default function Hero() {
  const { isAuthenticated, login } = useAuth();
  const telegramLoginRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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
      initTelegramLogin(TELEGRAM_BOT_NAME, "hero-telegram-login", handleTelegramLogin);
    }
  }, [isAuthenticated]);

  return (
    <section className="mb-8 relative overflow-hidden rounded-xl">
      <div className="bg-gradient-main p-6 md:p-10 rounded-xl relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold font-montserrat mb-4">
            Добро пожаловать в <span className="text-secondary">42-коммьюнити</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-6">
            42-коммьюнити - это место, где вы можете безопасно общаться, торговать и делиться контентом
          </p>
          <div className="flex flex-wrap gap-4">
            {!isAuthenticated ? (
              <>
                <div id="hero-telegram-login" ref={telegramLoginRef}>
                  <Button className="bg-secondary hover:bg-secondary/90 text-white font-medium py-3 px-6 rounded-lg flex items-center gap-2">
                    <i className="fab fa-telegram-plane"></i>
                    <span>Присоединиться через Telegram</span>
                  </Button>
                </div>
                <Link href="/about">
                  <Button variant="outline" className="bg-muted hover:bg-accent text-white font-medium py-3 px-6 rounded-lg">
                    Узнать больше
                  </Button>
                </Link>
              </>
            ) : (
              <Button className="bg-secondary hover:bg-secondary/90 text-white font-medium py-3 px-6 rounded-lg flex items-center gap-2">
                <i className="fas fa-user-friends"></i>
                <span>Найти друзей</span>
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="absolute inset-0 z-0 opacity-30 pattern-dots-lg text-gray-700 top-0 left-0 w-full h-full"></div>
    </section>
  );
}