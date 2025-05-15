import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, Lock, MessageCircle, ShoppingBag, CalendarDays, Video } from "lucide-react";

const AuthPage = () => {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);
  
  const handleLogin = () => {
    window.location.href = "/api/login";
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-lg">Загрузка...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left column - Platform info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold font-heading mb-4">
              <span className="text-gradient">BLYAT</span> Platform
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Многофункциональная социальная платформа, объединяющая блог, маркетплейс, 
              мероприятия и короткие видео в одном месте.
            </p>
          </div>
          
          <Tabs defaultValue="blog" className="mt-8">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="blog">Блог</TabsTrigger>
              <TabsTrigger value="marketplace">Маркетплейс</TabsTrigger>
              <TabsTrigger value="events">Мероприятия</TabsTrigger>
              <TabsTrigger value="videos">Видео</TabsTrigger>
            </TabsList>
            <TabsContent value="blog" className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Блог</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Создавайте и публикуйте посты, делитесь своими мыслями, комментируйте и взаимодействуйте 
                    с другими пользователями.
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="marketplace" className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg text-secondary-600 dark:text-secondary-400">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Маркетплейс</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Продавайте и покупайте товары, используя систему безопасных сделок с эскроу. 
                    Добавляйте фотографии, описания и цены для своих товаров.
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="events" className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-accent-100 dark:bg-accent-900/30 rounded-lg text-accent-600 dark:text-accent-400">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Мероприятия</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Создавайте и управляйте мероприятиями, приглашайте участников, отслеживайте регистрации 
                    и делитесь информацией о предстоящих событиях.
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="videos" className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400">
                  <Video className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Короткие видео</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Загружайте и просматривайте короткие видео, добавляйте описания, комментарии и лайки.
                    Делитесь своим творчеством и находите новые интересные ролики.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right column - Auth card */}
        <div>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Добро пожаловать!</CardTitle>
              <CardDescription>
                Войдите в свой аккаунт чтобы получить доступ ко всем функциям платформы
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-6">
                <div className="mx-auto mb-4 p-4 rounded-full bg-primary-50 dark:bg-primary-900/30 w-16 h-16 flex items-center justify-center">
                  <Lock className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">Безопасный вход</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Используйте свой аккаунт Replit для безопасного входа на платформу
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Преимущества авторизации:</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-green-500 flex-shrink-0"></div>
                    <span>Создание и комментирование постов</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-green-500 flex-shrink-0"></div>
                    <span>Продажа и покупка товаров через систему эскроу</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-green-500 flex-shrink-0"></div>
                    <span>Создание и регистрация на мероприятия</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-green-500 flex-shrink-0"></div>
                    <span>Загрузка и просмотр коротких видео</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-green-500 flex-shrink-0"></div>
                    <span>Кастомизация профиля (аватар, баннер, темы)</span>
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full gap-2" onClick={handleLogin}>
                <LogIn className="h-5 w-5" />
                <span>Войти</span>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
