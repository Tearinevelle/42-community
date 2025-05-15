import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Video, User } from "@shared/schema";
import VideoCard from "@/components/videos/VideoCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

const VideosPage = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const pageSize = 12;
  
  // Form state for uploading video
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  
  // Fetch videos with pagination and filtering
  const { data: videos = [], isLoading, isFetching } = useQuery<(Video & { user: User })[]>({
    queryKey: ['/api/videos', { limit: pageSize, offset: page * pageSize, sortBy, search: searchQuery }],
    queryFn: async () => {
      let url = `/api/videos?limit=${pageSize}&offset=${page * pageSize}`;
      if (sortBy) {
        url += `&sortBy=${sortBy}`;
      }
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch videos');
      return res.json();
    },
    keepPreviousData: true,
  });

  // Upload video mutation
  const uploadVideoMutation = useMutation({
    mutationFn: async () => {
      if (!videoFile || !thumbnailFile) {
        throw new Error('Видео и миниатюра обязательны');
      }
      
      const formData = new FormData();
      formData.append("title", videoTitle);
      formData.append("description", videoDescription || "");
      formData.append("video", videoFile);
      formData.append("thumbnail", thumbnailFile);
      
      const response = await fetch("/api/videos", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload video");
      }
      
      return response.json();
    },
    onSuccess: () => {
      resetForm();
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      toast({
        title: "Успех!",
        description: "Ваше видео успешно загружено",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить видео. Пожалуйста, попробуйте еще раз.",
        variant: "destructive",
      });
      console.error(error);
    }
  });

  const resetForm = () => {
    setVideoTitle("");
    setVideoDescription("");
    setVideoFile(null);
    setThumbnailFile(null);
    setThumbnailPreview(null);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) resetForm();
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!videoTitle) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите название видео",
        variant: "destructive",
      });
      return;
    }
    
    if (!videoFile) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите видео для загрузки",
        variant: "destructive",
      });
      return;
    }
    
    if (!thumbnailFile) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите миниатюру для видео",
        variant: "destructive",
      });
      return;
    }
    
    uploadVideoMutation.mutate();
  };

  const loadMoreVideos = () => {
    setPage(prevPage => prevPage + 1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0); // Reset to first page when searching
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(0); // Reset to first page when changing sort
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold font-heading">Видео</h1>
          <Badge variant="accent" className="text-xs">
            Новое
          </Badge>
        </div>
        
        {isAuthenticated && (
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Загрузить видео
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Загрузка видео</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Название видео *</Label>
                  <Input
                    id="title"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="Введите название видео"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Описание</Label>
                  <Textarea
                    id="description"
                    value={videoDescription}
                    onChange={(e) => setVideoDescription(e.target.value)}
                    placeholder="Опишите ваше видео"
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="video">Видеофайл *</Label>
                  <Input
                    id="video"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Поддерживаемые форматы: MP4, MOV, AVI. Макс. размер: 100MB
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="thumbnail">Миниатюра *</Label>
                  <Input
                    id="thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Рекомендуемый размер: 1280x720px (16:9)
                  </p>
                </div>
                
                {thumbnailPreview && (
                  <div className="relative">
                    <img
                      src={thumbnailPreview}
                      alt="Preview"
                      className="w-full h-auto rounded-lg aspect-video object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setThumbnailFile(null);
                        setThumbnailPreview(null);
                      }}
                    >
                      Удалить
                    </Button>
                  </div>
                )}
                
                <div className="flex justify-end mt-4">
                  <Button
                    type="submit"
                    disabled={uploadVideoMutation.isPending}
                  >
                    {uploadVideoMutation.isPending ? "Загрузка..." : "Загрузить видео"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Input
                type="text"
                placeholder="Поиск видео..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </form>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Новые</SelectItem>
                <SelectItem value="popular">Популярные</SelectItem>
                <SelectItem value="oldest">Старые</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Videos Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="w-full aspect-video rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : videos.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {videos.map(video => (
              <div key={video.id} className="space-y-2">
                <VideoCard video={video} />
                <div className="px-1">
                  <h3 className="font-medium line-clamp-2">{video.title}</h3>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span>{video.user.username || `${video.user.firstName || ''} ${video.user.lastName || ''}`}</span>
                    <span className="mx-1">•</span>
                    <span>{video.views} просмотров</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Load More Button */}
          {videos.length >= pageSize && (
            <div className="mt-8 text-center">
              <Button 
                onClick={loadMoreVideos}
                disabled={isFetching}
                variant="outline"
                className="px-6"
              >
                {isFetching ? "Загрузка..." : "Показать больше видео"}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow">
          <h3 className="text-lg font-medium mb-2">Видео не найдены</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchQuery ? "Попробуйте изменить параметры поиска" : "В данный момент видео отсутствуют"}
          </p>
          {searchQuery && (
            <Button 
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSortBy("newest");
              }}
            >
              Сбросить фильтры
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default VideosPage;
