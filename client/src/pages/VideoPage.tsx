import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Video, User } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  ThumbsUp, 
  Play,
  Bookmark,
  Flag
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { useEffect, useRef, useState } from "react";
import { apiRequest } from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";
import VideoCard from "@/components/videos/VideoCard";

const VideoPage = () => {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [comment, setComment] = useState("");
  
  // Fetch video details
  const { data: video, isLoading } = useQuery<Video & { user: User }>({
    queryKey: ['/api/videos', id],
    queryFn: async () => {
      const res = await fetch(`/api/videos/${id}`);
      if (!res.ok) throw new Error('Failed to fetch video');
      return res.json();
    },
    enabled: !!id,
  });
  
  // Fetch related videos
  const { data: relatedVideos = [] } = useQuery<(Video & { user: User })[]>({
    queryKey: ['/api/videos', { limit: 5 }],
    queryFn: async () => {
      const res = await fetch('/api/videos?limit=5');
      if (!res.ok) throw new Error('Failed to fetch related videos');
      return res.json();
    },
  });
  
  // Post comment mutation
  const commentMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/video-comments', { 
        videoId: Number(id),
        content: comment 
      });
    },
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ['/api/videos', id, 'comments'] });
      toast({
        title: "Комментарий добавлен",
        description: "Ваш комментарий успешно опубликован",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить комментарий. Пожалуйста, попробуйте еще раз.",
        variant: "destructive",
      });
      console.error(error);
    }
  });
  
  // Like video mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/video-likes', { videoId: Number(id) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos', id] });
      toast({
        title: "Понравилось!",
        description: "Видео добавлено в понравившиеся",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось выполнить действие. Пожалуйста, попробуйте еще раз.",
        variant: "destructive",
      });
      console.error(error);
    }
  });
  
  const handlePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const handleLike = () => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    
    likeMutation.mutate();
  };
  
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    
    if (!comment.trim()) {
      toast({
        title: "Ошибка",
        description: "Комментарий не может быть пустым",
        variant: "destructive",
      });
      return;
    }
    
    commentMutation.mutate();
  };
  
  // Format view count
  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views.toString();
  };
  
  // Update video player state
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('ended', handleEnded);
    
    return () => {
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, []);
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            {Array(3).fill(0).map((_, index) => (
              <Skeleton key={index} className="aspect-video w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (!video) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Видео не найдено</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Видео, которое вы ищете, не существует или было удалено.
        </p>
        <Button onClick={() => navigate("/videos")}>Вернуться к видео</Button>
      </div>
    );
  }
  
  // Filter out current video from related videos
  const filteredRelatedVideos = relatedVideos.filter(v => v.id !== Number(id)).slice(0, 4);
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            {video.videoUrl ? (
              <>
                <video
                  ref={videoRef}
                  src={video.videoUrl}
                  className="w-full h-full object-contain"
                  poster={video.thumbnailUrl}
                  controls
                  preload="metadata"
                ></video>
                {!isPlaying && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center cursor-pointer"
                    onClick={handlePlayPause}
                  >
                    <div className="bg-black/30 rounded-full p-4">
                      <Play className="h-12 w-12 text-white" fill="white" />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <img 
                  src={video.thumbnailUrl}
                  alt={video.title} 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
          </div>
          
          {/* Video Information */}
          <div>
            <h1 className="text-2xl font-bold font-heading">{video.title}</h1>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span>{formatViews(video.views || 0)} просмотров</span>
                <span className="mx-2">•</span>
                <span>
                  {video.createdAt && formatDistanceToNow(new Date(video.createdAt), { addSuffix: true, locale: ru })}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="gap-2" onClick={handleLike}>
                  <Heart className="h-5 w-5" />
                  <span>Нравится</span>
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Bookmark className="h-5 w-5" />
                  <span>Сохранить</span>
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Share2 className="h-5 w-5" />
                  <span>Поделиться</span>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Channel Info */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={video.user.profileImageUrl || ""} alt={video.user.username || ""} />
                <AvatarFallback>{(video.user.username || video.user.firstName || "?").slice(0, 1)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">
                  {video.user.username || `${video.user.firstName || ''} ${video.user.lastName || ''}`}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Подписчики: 1.2K
                </div>
              </div>
            </div>
            <Button variant="default" size="sm" onClick={() => navigate(`/profile/${video.user.id}`)}>
              Подписаться
            </Button>
          </div>
          
          {/* Description */}
          {video.description && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="whitespace-pre-line">{video.description}</p>
            </div>
          )}
          
          {/* Comments */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Комментарии</h2>
            
            {/* Comment form */}
            {isAuthenticated && (
              <form onSubmit={handleSubmitComment} className="flex gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={user?.profileImageUrl || ""} alt={user?.username || ""} />
                  <AvatarFallback>{user ? (user.username || user.firstName || "?").slice(0, 1) : "?"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Добавить комментарий..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="resize-none"
                  />
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      size="sm"
                      disabled={!comment.trim() || commentMutation.isPending}
                    >
                      {commentMutation.isPending ? "Отправка..." : "Отправить"}
                    </Button>
                  </div>
                </div>
              </form>
            )}
            
            {/* Sample comments (would be fetched from API in a real implementation) */}
            <div className="space-y-4 mt-6">
              <div className="flex gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback>А</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Алексей</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">2 дня назад</span>
                  </div>
                  <p className="mt-1">Отличное видео! Очень понравилось, продолжайте в том же духе.</p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <button className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                      <ThumbsUp className="h-4 w-4" /> 12
                    </button>
                    <button className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                      <MessageCircle className="h-4 w-4" /> Ответить
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback>М</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Мария</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">1 неделю назад</span>
                  </div>
                  <p className="mt-1">Можно более подробно рассказать о том, что было показано на 2:15? Очень интересная тема!</p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <button className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                      <ThumbsUp className="h-4 w-4" /> 8
                    </button>
                    <button className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                      <MessageCircle className="h-4 w-4" /> Ответить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sidebar - Related Videos */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Похожие видео</h2>
          
          {filteredRelatedVideos.length > 0 ? (
            <div className="space-y-4">
              {filteredRelatedVideos.map(relatedVideo => (
                <div key={relatedVideo.id} className="space-y-2">
                  <VideoCard video={relatedVideo} />
                  <div className="px-1">
                    <h3 className="font-medium line-clamp-2">{relatedVideo.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span>{relatedVideo.user.username || `${relatedVideo.user.firstName || ''} ${relatedVideo.user.lastName || ''}`}</span>
                      <span className="mx-1">•</span>
                      <span>{formatViews(relatedVideo.views || 0)} просмотров</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              Нет похожих видео
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
