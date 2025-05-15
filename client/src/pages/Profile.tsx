import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn, getUserStatusText, getRandomGradient } from "@/lib/utils";
import { userRankColors } from "@/lib/constants";
import { useEffect } from "react";

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Set page title
  useEffect(() => {
    document.title = "Сеть - Профиль | Универсальная социальная платформа";
  }, []);

  // Fetch user profile data if logged in
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['/api/users', user?.id],
    enabled: !!user?.id,
  });

  // Fetch user's listings
  const { data: userListings } = useQuery({
    queryKey: ['/api/users', user?.id, 'listings'],
    enabled: !!user?.id,
  });

  // Fetch user's events
  const { data: userEvents } = useQuery({
    queryKey: ['/api/users', user?.id, 'events'],
    enabled: !!user?.id,
  });

  // Fetch user's blog posts
  const { data: userPosts } = useQuery({
    queryKey: ['/api/users', user?.id, 'posts'],
    enabled: !!user?.id,
  });

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <i className="fas fa-user-circle text-6xl text-secondary mb-4"></i>
        <h1 className="text-2xl font-bold mb-2">Профиль недоступен</h1>
        <p className="text-gray-400 mb-6">Войдите через Telegram, чтобы получить доступ к своему профилю</p>
        <div id="profile-login-button">
          <Button className="bg-secondary hover:bg-secondary/90">
            <i className="fab fa-telegram-plane mr-2"></i>
            Войти через Telegram
          </Button>
        </div>
      </div>
    );
  }

  // Use actual user data or fallback to auth context data
  const userData = profileData || user;
  const rankColorClass = userRankColors[userData?.rank as keyof typeof userRankColors] || "text-gray-500";
  const bannerGradient = userData?.bannerColor || getRandomGradient();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile header with banner and avatar */}
      <div className="relative mb-6">
        <div className={`h-48 bg-gradient-to-r ${bannerGradient} rounded-lg`}></div>
        <div className="absolute -bottom-16 left-6 border-4 border-background rounded-full">
          <img 
            src={userData?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150"} 
            alt={userData?.displayName} 
            className="w-32 h-32 rounded-full object-cover"
          />
        </div>
        <div className="absolute bottom-4 right-4">
          <Button variant="outline" className="bg-background/30 backdrop-blur-sm border-white/20 hover:bg-background/50">
            <i className="fas fa-pencil-alt mr-2"></i>
            Редактировать профиль
          </Button>
        </div>
      </div>

      {/* Profile information */}
      <div className="mt-16 mb-8 px-2">
        <h1 className="text-3xl font-bold">{userData?.displayName}</h1>
        <div className="flex items-center mt-1 text-sm text-gray-400">
          <span className={cn(
            "w-2 h-2 rounded-full mr-2",
            userData?.isOnline ? "bg-green-500" : "bg-gray-500"
          )}></span>
          <span>{getUserStatusText(userData?.isOnline, userData?.lastSeen)}</span>
          <span className="mx-2">•</span>
          <span className={rankColorClass}>{userData?.rank}</span>
        </div>
        <p className="mt-4 text-gray-300">
          {userData?.bio || "Информация о пользователе не указана"}
        </p>
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="bg-card px-4 py-2 rounded-lg">
            <div className="text-sm text-gray-400">Сделки</div>
            <div className="text-xl font-semibold">{userData?.transactionsCount || 0}</div>
          </div>
          <div className="bg-card px-4 py-2 rounded-lg">
            <div className="text-sm text-gray-400">Рейтинг</div>
            <div className="text-xl font-semibold">
              <i className="fas fa-star text-yellow-500 mr-1"></i>
              {userData?.rating?.toFixed(1) || "0.0"}/5
            </div>
          </div>
          <div className="bg-card px-4 py-2 rounded-lg">
            <div className="text-sm text-gray-400">Дата регистрации</div>
            <div className="text-xl font-semibold">
              {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "Неизвестно"}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="listings" className="w-full">
        <TabsList className="w-full grid grid-cols-4 mb-6">
          <TabsTrigger value="listings">Товары</TabsTrigger>
          <TabsTrigger value="events">Мероприятия</TabsTrigger>
          <TabsTrigger value="posts">Публикации</TabsTrigger>
          <TabsTrigger value="videos">Видео</TabsTrigger>
        </TabsList>

        <TabsContent value="listings">
          {userListings?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {userListings.map((listing) => (
                <Card key={listing.id} className="bg-card">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold">{listing.title}</h3>
                    <p className="text-gray-400 text-sm">{listing.description}</p>
                    <div className="mt-2 font-bold">{listing.price} ₽</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <i className="fas fa-shopping-bag text-4xl text-gray-500 mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">Нет товаров</h3>
              <p className="text-gray-400">У вас пока нет размещенных товаров</p>
              <Button className="mt-4 bg-secondary hover:bg-secondary/90">
                <i className="fas fa-plus mr-2"></i>
                Добавить товар
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="events">
          {userEvents?.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {userEvents.map((event) => (
                <Card key={event.id} className="bg-card">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold">{event.title}</h3>
                    <p className="text-gray-400 text-sm">{event.description}</p>
                    <div className="mt-2 text-sm text-gray-400">
                      <i className="far fa-calendar-alt mr-2"></i>
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <i className="fas fa-calendar text-4xl text-gray-500 mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">Нет мероприятий</h3>
              <p className="text-gray-400">Вы пока не создали ни одного мероприятия</p>
              <Button className="mt-4 bg-secondary hover:bg-secondary/90">
                <i className="fas fa-plus mr-2"></i>
                Создать мероприятие
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="posts">
          {userPosts?.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {userPosts.map((post) => (
                <Card key={post.id} className="bg-card">
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold">{post.title}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{post.content}</p>
                    <div className="mt-2 flex items-center text-sm text-gray-400">
                      <span className="flex items-center mr-4">
                        <i className="far fa-eye mr-1"></i> {post.views}
                      </span>
                      <span className="flex items-center">
                        <i className="far fa-heart mr-1"></i> {post.likes}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <i className="fas fa-newspaper text-4xl text-gray-500 mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">Нет публикаций</h3>
              <p className="text-gray-400">Вы пока не создали ни одной публикации</p>
              <Button className="mt-4 bg-secondary hover:bg-secondary/90">
                <i className="fas fa-plus mr-2"></i>
                Создать публикацию
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="videos">
          <div className="text-center py-12">
            <i className="fas fa-video text-4xl text-gray-500 mb-4"></i>
            <h3 className="text-xl font-semibold mb-2">Нет видео</h3>
            <p className="text-gray-400">Вы пока не загрузили ни одного видео</p>
            <Button className="mt-4 bg-secondary hover:bg-secondary/90">
              <i className="fas fa-plus mr-2"></i>
              Загрузить видео
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
