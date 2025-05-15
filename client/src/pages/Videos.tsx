import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatNumber } from "@/lib/utils";

export default function Videos() {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  // Set page title
  useEffect(() => {
    document.title = "42-коммьюнити - 42-tok | Место безопасного общения";
  }, []);

  // Fetch videos
  const { data: videos, isLoading } = useQuery({
    queryKey: ['/api/videos/recent'],
  });

  // Use actual data from API
  const displayVideos = videos || [];

  // Filter videos based on search
  const filteredVideos = displayVideos.filter(video => {
    return searchTerm === "" || 
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.author.displayName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">42-tok</h1>
        <p className="text-gray-400">
          Смотрите и создавайте короткие вертикальные видео на любые темы
        </p>
      </div>

      {/* Search and upload */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Input
            placeholder="Поиск видео..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-muted"
          />
          <i className="fas fa-search absolute left-3 top-3 text-gray-500"></i>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-secondary hover:bg-secondary/90 md:w-auto w-full">
              <i className="fas fa-plus mr-2"></i>
              Загрузить видео
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card text-foreground">
            <DialogHeader>
              <DialogTitle>Загрузка видео</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-gray-400">
                Чтобы загрузить видео, пожалуйста, войдите через Telegram
              </p>
              {/* Telegram login button would go here for non-authenticated users */}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Videos grid */}
      {filteredVideos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredVideos.map((video) => (
            <div key={video.id} className="relative group">
              <div className="aspect-[9/16] bg-muted rounded-lg overflow-hidden">
                <img 
                  src={video.thumbnail} 
                  alt={video.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  <h3 className="text-sm font-medium line-clamp-2">{video.title}</h3>
                  <div className="flex items-center mt-2 text-xs text-gray-300">
                    <span className="flex items-center">
                      <i className="fas fa-eye mr-1"></i> {formatNumber(video.views)}
                    </span>
                    <span className="mx-2">•</span>
                    <span className="flex items-center">
                      <i className="fas fa-heart mr-1"></i> {formatNumber(video.likes)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-2 flex items-center">
                <img 
                  src={video.author.avatar} 
                  alt={video.author.displayName} 
                  className="w-6 h-6 rounded-full mr-2"
                />
                <span className="text-xs truncate">{video.author.displayName}</span>
              </div>
              <Button 
                size="icon" 
                variant="ghost" 
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <i className="fas fa-play"></i>
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <i className="fas fa-video-slash text-6xl text-gray-500 mb-4"></i>
          <h3 className="text-xl font-semibold mb-2">Видео не найдены</h3>
          <p className="text-gray-400 mb-4">
            Попробуйте изменить параметры поиска
          </p>
          <Button 
            variant="outline"
            onClick={() => setSearchTerm("")}
          >
            Сбросить фильтры
          </Button>
        </div>
      )}
    </>
  );
}
