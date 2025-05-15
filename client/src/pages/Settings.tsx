import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { gradients } from "@/lib/utils";

export default function Settings() {
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  
  // Profile settings
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [bannerColor, setBannerColor] = useState("");
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [telegramNotifications, setTelegramNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [eventNotifications, setEventNotifications] = useState(true);
  
  // Privacy settings
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [activityTracking, setActivityTracking] = useState(true);
  
  // Security settings
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  // Set page title
  useEffect(() => {
    document.title = "Сеть - Настройки | Универсальная социальная платформа";
  }, []);
  
  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setBio(user.bio || "");
      setBannerColor(user.bannerColor || gradients[0]);
    }
  }, [user]);
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('PATCH', `/api/users/${user?.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Настройки сохранены",
        description: "Ваш профиль успешно обновлен",
      });
      
      // Invalidate user data queries
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/status'] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль",
        variant: "destructive",
      });
    }
  });
  
  // Handle profile save
  const handleSaveProfile = () => {
    if (!user) return;
    
    updateProfileMutation.mutate({
      displayName,
      bio,
      bannerColor
    });
  };
  
  // Handle notification settings save
  const handleSaveNotifications = () => {
    toast({
      title: "Настройки сохранены",
      description: "Настройки уведомлений успешно обновлены",
    });
  };
  
  // Handle privacy settings save
  const handleSavePrivacy = () => {
    toast({
      title: "Настройки сохранены",
      description: "Настройки приватности успешно обновлены",
    });
  };
  
  // Handle security settings save
  const handleSaveSecurity = () => {
    toast({
      title: "Настройки сохранены",
      description: "Настройки безопасности успешно обновлены",
    });
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Выход выполнен",
        description: "Вы успешно вышли из системы",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <i className="fas fa-cog text-6xl text-secondary mb-4"></i>
        <h1 className="text-2xl font-bold mb-2">Настройки недоступны</h1>
        <p className="text-gray-400 mb-6">Войдите через Telegram, чтобы получить доступ к настройкам</p>
        <div id="settings-login-button">
          <Button className="bg-secondary hover:bg-secondary/90">
            <i className="fab fa-telegram-plane mr-2"></i>
            Войти через Telegram
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Настройки</h1>
        <p className="text-gray-400">
          Управляйте своим профилем, уведомлениями и настройками конфиденциальности
        </p>
      </div>
      
      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-6">
          <TabsTrigger value="notifications">Уведомления</TabsTrigger>
          <TabsTrigger value="privacy">Приватность</TabsTrigger>
          <TabsTrigger value="security">Безопасность</TabsTrigger>
        </TabsList>
        
        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>Настройки уведомлений</CardTitle>
              <CardDescription>
                Настройте способы получения уведомлений от платформы
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Каналы уведомлений</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Электронная почта</Label>
                    <div className="text-sm text-gray-400">Получать уведомления на почту</div>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="telegram-notifications">Telegram</Label>
                    <div className="text-sm text-gray-400">Получать уведомления в Telegram</div>
                  </div>
                  <Switch
                    id="telegram-notifications"
                    checked={telegramNotifications}
                    onCheckedChange={setTelegramNotifications}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Типы уведомлений</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="message-notifications">Сообщения</Label>
                    <div className="text-sm text-gray-400">Уведомления о новых сообщениях</div>
                  </div>
                  <Switch
                    id="message-notifications"
                    checked={messageNotifications}
                    onCheckedChange={setMessageNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="event-notifications">Мероприятия</Label>
                    <div className="text-sm text-gray-400">Уведомления о новых и предстоящих мероприятиях</div>
                  </div>
                  <Switch
                    id="event-notifications"
                    checked={eventNotifications}
                    onCheckedChange={setEventNotifications}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Отмена</Button>
              <Button 
                className="bg-secondary hover:bg-secondary/90"
                onClick={handleSaveNotifications}
              >
                Сохранить изменения
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Privacy Settings */}
        <TabsContent value="privacy">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>Настройки приватности</CardTitle>
              <CardDescription>
                Управляйте видимостью вашего профиля и активности на платформе
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="profile-visibility">Видимость профиля</Label>
                <Select value={profileVisibility} onValueChange={setProfileVisibility}>
                  <SelectTrigger className="bg-muted">
                    <SelectValue placeholder="Выберите настройку видимости" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Публичный (виден всем)</SelectItem>
                    <SelectItem value="registered">Только зарегистрированным</SelectItem>
                    <SelectItem value="private">Приватный (только контактам)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="online-status">Статус онлайн</Label>
                  <div className="text-sm text-gray-400">Показывать другим, когда вы онлайн</div>
                </div>
                <Switch
                  id="online-status"
                  checked={onlineStatus}
                  onCheckedChange={setOnlineStatus}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="activity-tracking">Отслеживание активности</Label>
                  <div className="text-sm text-gray-400">Разрешить сайту собирать данные об использовании</div>
                </div>
                <Switch
                  id="activity-tracking"
                  checked={activityTracking}
                  onCheckedChange={setActivityTracking}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Отмена</Button>
              <Button 
                className="bg-secondary hover:bg-secondary/90"
                onClick={handleSavePrivacy}
              >
                Сохранить изменения
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Security Settings */}
        <TabsContent value="security">
          <Card className="bg-card mb-6">
            <CardHeader>
              <CardTitle>Настройки безопасности</CardTitle>
              <CardDescription>
                Управляйте параметрами безопасности вашего аккаунта
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="two-factor">Двухфакторная аутентификация</Label>
                  <div className="text-sm text-gray-400">Включите дополнительный уровень защиты</div>
                </div>
                <Switch
                  id="two-factor"
                  checked={twoFactorEnabled}
                  onCheckedChange={setTwoFactorEnabled}
                />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-base font-medium">Авторизованные сессии</h3>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Текущая сессия</div>
                      <div className="text-sm text-gray-400">Веб-браузер • {navigator.platform}</div>
                    </div>
                    <span className="text-green-500 text-sm">Активна</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 pt-2">
                <Button variant="outline" className="w-full">
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Завершить все другие сессии
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Отмена</Button>
              <Button 
                className="bg-secondary hover:bg-secondary/90"
                onClick={handleSaveSecurity}
              >
                Сохранить изменения
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="bg-card border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Опасная зона</CardTitle>
              <CardDescription>
                Действия, которые могут иметь серьезные последствия
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-base font-medium">Выход из системы</h3>
                <p className="text-sm text-gray-400">
                  При выходе из системы вам потребуется снова авторизоваться через Telegram для доступа к аккаунту.
                </p>
                <Button 
                  variant="destructive"
                  onClick={handleLogout}
                  className="mt-2"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Выйти из системы
                </Button>
              </div>
              
              <div className="space-y-2 pt-4 border-t border-gray-800">
                <h3 className="text-base font-medium">Удаление аккаунта</h3>
                <p className="text-sm text-gray-400">
                  Это действие нельзя отменить. Будут удалены все данные, связанные с вашим аккаунтом.
                </p>
                <Button 
                  variant="outline" 
                  className="text-destructive border-destructive hover:bg-destructive/10 mt-2"
                >
                  <i className="fas fa-trash-alt mr-2"></i>
                  Удалить аккаунт
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
