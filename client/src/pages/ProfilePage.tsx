import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import PostCard from "@/components/feed/PostCard";
import ProductCard from "@/components/marketplace/ProductCard";
import EventCard from "@/components/events/EventCard";
import VideoCard from "@/components/videos/VideoCard";
import { apiRequest } from "@/lib/api";
import { Edit, Settings, Image, CalendarDays, ShoppingBag, FileVideo } from "lucide-react";
import { ChromePicker, TwitterPicker } from "react-color";

// Расширенный интерфейс пользователя для нашего приложения
interface ExtendedUser extends User {
  status?: string;
  profileImageUrl?: string;
  bannerImageUrl?: string;
  firstName?: string;
  lastName?: string;
}

// Интерфейсы для типов данных в приложении
interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  createdAt: string;
  author: User;
}

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  sellerId: number;
  image: string | null;
  createdAt: string;
  seller: User;
}

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  organizerId: number;
  image: string | null;
  location: string | null;
  eventType: string;
  category: string;
  participantsCount: number | null;
  createdAt: string;
  organizer: User;
}

interface Video {
  id: number;
  title: string;
  description: string;
  authorId: number;
  url: string;
  thumbnailUrl: string | null;
  viewCount: number;
  createdAt: string;
  author: User;
}

const EditProfileDialog = ({ open, onOpenChange, currentUser }: { open: boolean, onOpenChange: (open: boolean) => void, currentUser: User | undefined }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { id } = useParams();
  const { user: loggedInUser } = useAuth();
  const isCurrentUser = !id || (loggedInUser && id === loggedInUser.id);
  const userId = isCurrentUser ? loggedInUser?.id : id;

  const [username, setUsername] = useState(currentUser?.username || "");
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [status, setStatus] = useState(currentUser?.status || "");
  const [gender, setGender] = useState(currentUser?.gender || "");
  const [bannerColor, setBannerColor] = useState(currentUser?.bannerColor || "");
  const [interfaceColor, setInterfaceColor] = useState<string>("#6366f1"); // По умолчанию цвет интерфейса
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [bannerImage, setBannerImage] = useState<File | null>(null);

  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username || "");
      setBio(currentUser.bio || "");
      setStatus(currentUser.status || "");
      setGender(currentUser.gender || "");
      setBannerColor(currentUser.bannerColor || "");
    }
  }, [currentUser]);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBannerImage(e.target.files[0]);
    }
  };

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("bio", bio);
      formData.append("status", status);
      formData.append("gender", gender);
      formData.append("bannerColor", bannerColor);
      formData.append("interfaceColor", interfaceColor);

      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      if (bannerImage) {
        formData.append("bannerImage", bannerImage);
      }

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      return response.json();
    },
    onSuccess: () => {
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId] });
      toast({
        title: "Профиль обновлен",
        description: "Ваш профиль был успешно обновлен",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль. Пожалуйста, попробуйте еще раз.",
        variant: "destructive",
      });
      console.error(error);
    }
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Редактирование профиля</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Имя пользователя</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ваше имя пользователя"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Статус</Label>
            <Input
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="Ваш текущий статус"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">О себе</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Расскажите о себе"
              className="min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Пол</Label>
            <RadioGroup 
              value={gender} 
              onValueChange={setGender}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male">Мужской</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female">Женский</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">Другой</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label>Цвет интерфейса</Label>
            <div className="flex flex-col space-y-2">
              <div className="picker-container" style={{ margin: "0 auto" }}>
                <ChromePicker
                  color={interfaceColor}
                  onChange={(color) => setInterfaceColor(color.hex)}
                  disableAlpha={true}
                />
              </div>
              <div className="flex items-center mt-2 gap-2">
                <span>Цветовые темы:</span>
                <TwitterPicker
                  color={interfaceColor}
                  onChange={(color) => setInterfaceColor(color.hex)}
                  triangle="hide"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profileImage">Фото профиля</Label>
            <Input
              id="profileImage"
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bannerImage">Баннер профиля</Label>
            <Input
              id="bannerImage"
              type="file"
              accept="image/*"
              onChange={handleBannerImageChange}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Рекомендуемый размер: 1200x400px
            </p>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? "Сохранение..." : "Сохранить изменения"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const ProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for edit profile dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

  // Determine if we're viewing the current user's profile
  const isCurrentUser = !id || (currentUser && id === currentUser.id);
  const userId = isCurrentUser ? currentUser?.id : id;

  // Redirect to login if trying to view own profile but not logged in
  useEffect(() => {
    if (isCurrentUser && !isAuthenticated && !currentUser) {
      window.location.href = "/api/login";
    }
  }, [isCurrentUser, isAuthenticated, currentUser]);

  // Fetch user data
  const { data: profileUser, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ['/api/users', userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch user");
      return response.json();
    },
    enabled: !!userId,
  });

  // Fetch user posts
  const { data: userPosts = [], isLoading: isLoadingPosts } = useQuery<Post[]>({
    queryKey: ['/api/users', userId, 'posts'],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      const response = await fetch(`/api/users/${userId}/posts`);
      if (!response.ok) throw new Error("Failed to fetch posts");
      return response.json();
    },
    enabled: !!userId && activeTab === "posts",
  });

  // Fetch user products
  const { data: userProducts = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ['/api/users', userId, 'products'],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      const response = await fetch(`/api/users/${userId}/products`);
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
    enabled: !!userId && activeTab === "products",
  });

  // Fetch user events
  const { data: userEvents = [], isLoading: isLoadingEvents } = useQuery<Event[]>({
    queryKey: ['/api/users', userId, 'events'],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      const response = await fetch(`/api/users/${userId}/events`);
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    },
    enabled: !!userId && activeTab === "events",
  });

  // Fetch user videos
  const { data: userVideos = [], isLoading: isLoadingVideos } = useQuery<Video[]>({
    queryKey: ['/api/users', userId, 'videos'],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      const response = await fetch(`/api/users/${userId}/videos`);
      if (!response.ok) throw new Error("Failed to fetch videos");
      return response.json();
    },
    enabled: !!userId && activeTab === "videos",
  });

  if (isLoadingUser) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Banner skeleton */}
          <Skeleton className="w-full h-48 rounded-lg" />

          {/* Profile info skeleton */}
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <Skeleton className="w-32 h-32 rounded-full -mt-16 border-4 border-white dark:border-gray-800" />
            <div className="flex-1 space-y-2 text-center md:text-left">
              <Skeleton className="h-8 w-48 mx-auto md:mx-0" />
              <Skeleton className="h-4 w-32 mx-auto md:mx-0" />
              <Skeleton className="h-4 w-64 mx-auto md:mx-0" />
            </div>
          </div>

          {/* Tabs skeleton */}
          <Skeleton className="h-10 w-full" />

          {/* Content skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, index) => (
              <Skeleton key={index} className="h-64 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profileUser && userId) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Пользователь не найден</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Пользователь, которого вы ищете, не существует или был удален.
        </p>
        <Button onClick={() => navigate("/")}>Вернуться на главную</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        {/* Banner */}
        <div 
          className="h-48 rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 bg-cover bg-center"
          style={{ 
            backgroundImage: profileUser?.bannerImageUrl 
              ? `url(${profileUser.bannerImageUrl})` 
              : undefined 
          }}
        ></div>

        {/* Profile info */}
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <Avatar className="w-32 h-32 -mt-16 border-4 border-white dark:border-gray-800">
            <AvatarImage src={profileUser?.profileImageUrl || ""} alt={profileUser?.username || ""} />
            <AvatarFallback className="text-3xl">
              {(profileUser?.username || profileUser?.firstName || "?").slice(0, 1)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold font-heading">
              {profileUser?.username || `${profileUser?.firstName || ''} ${profileUser?.lastName || ''}`}
            </h1>
            {profileUser?.status && (
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {profileUser.status}
              </p>
            )}
            {profileUser?.bio && (
              <p className="mt-2 text-gray-700 dark:text-gray-300">
                {profileUser.bio}
              </p>
            )}
          </div>

          {isCurrentUser && (
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Edit className="h-4 w-4" />
            <span>Редактировать профиль</span>
          </Button>
          <EditProfileDialog 
            open={isEditDialogOpen} 
            onOpenChange={setIsEditDialogOpen}
            currentUser={profileUser}
          />
          )}
        </div>

        {/* Tabs for user content */}
        <Tabs defaultValue="posts" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="posts" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              <span>Посты</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span>Товары</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              <span>Мероприятия</span>
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-2">
              <FileVideo className="h-4 w-4" />
              <span>Видео</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            {isLoadingPosts ? (
              <div className="space-y-6">
                {Array(3).fill(0).map((_, index) => (
                  <Skeleton key={index} className="h-64 w-full rounded-lg" />
                ))}
              </div>
            ) : userPosts.length > 0 ? (
              <div className="space-y-6">
                {userPosts.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={{ ...post, user: profileUser as User }} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow">
                <h3 className="text-lg font-medium mb-2">Нет постов</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {isCurrentUser 
                    ? "У вас пока нет постов. Создайте свой первый пост!" 
                    : "У этого пользователя пока нет постов."}
                </p>
                {isCurrentUser && (
                  <Button onClick={() => navigate("/")}>
                    Создать пост
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            {isLoadingProducts ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, index) => (
                  <Skeleton key={index} className="h-64 w-full rounded-lg" />
                ))}
              </div>
            ) : userProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {userProducts.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={{ ...product, user: profileUser as User }} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow">
                <h3 className="text-lg font-medium mb-2">Нет товаров</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {isCurrentUser 
                    ? "У вас пока нет товаров на продажу. Создайте свой первый товар!" 
                    : "У этого пользователя пока нет товаров на продажу."}
                </p>
                {isCurrentUser && (
                  <Button onClick={() => navigate("/marketplace")}>
                    Добавить товар
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            {isLoadingEvents ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, index) => (
                  <Skeleton key={index} className="h-32 w-full rounded-lg" />
                ))}
              </div>
            ) : userEvents.length > 0 ? (
              <div className="space-y-4">
                {userEvents.map(event => (
                  <EventCard 
                    key={event.id} 
                    event={{ ...event, user: profileUser as User }} 
                    compact={false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow">
                <h3 className="text-lg font-medium mb-2">Нет мероприятий</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {isCurrentUser 
                    ? "У вас пока нет созданных мероприятий. Создайте свое первое мероприятие!" 
                    : "У этого пользователя пока нет созданных мероприятий."}
                </p>
                {isCurrentUser && (
                  <Button onClick={() => navigate("/events")}>
                    Создать мероприятие
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="videos" className="mt-6">
            {isLoadingVideos ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, index) => (
                  <div className="space-y-2" key={index}>
                    <Skeleton className="w-full aspect-video rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : userVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {userVideos.map(video => (
                  <div key={video.id} className="space-y-2">
                    <VideoCard 
                      video={{ ...video, user: profileUser as User }} 
                    />
                    <div className="px-1">
                      <h3 className="font-medium line-clamp-2">{video.title}</h3>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span>{video.views} просмотров</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow">
                <h3 className="text-lg font-medium mb-2">Нет видео</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {isCurrentUser 
                    ? "У вас пока нет загруженных видео. Загрузите свое первое видео!" 
                    : "У этого пользователя пока нет загруженных видео."}
                </p>
                {isCurrentUser && (
                  <Button onClick={() => navigate("/videos")}>
                    Загрузить видео
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;