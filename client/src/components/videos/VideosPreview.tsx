import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Video, User } from "@shared/schema";
import VideoCard from "./VideoCard";
import { Badge } from "@/components/ui/badge";

const VideosPreview = () => {
  const { data: videos = [], isLoading } = useQuery<(Video & { user: User })[]>({
    queryKey: ['/api/videos', { limit: 3 }],
    queryFn: async () => {
      const res = await fetch('/api/videos?limit=3');
      if (!res.ok) throw new Error('Failed to fetch videos');
      return res.json();
    }
  });

  // Get featured video and other videos
  const featuredVideo = videos.length > 0 ? videos[0] : null;
  const otherVideos = videos.length > 1 ? videos.slice(1, 3) : [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-1">
          <h3 className="font-heading font-semibold">Видео</h3>
          <Badge variant="accent" className="text-xs">
            Новое
          </Badge>
        </div>
        <Link href="/videos">
          <a className="text-primary-600 dark:text-primary-400 text-sm">
            Все видео <i className="ri-arrow-right-s-line"></i>
          </a>
        </Link>
      </div>
      
      {isLoading ? (
        <>
          {/* Featured video skeleton */}
          <div className="relative rounded-xl overflow-hidden mb-3 aspect-video bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          
          {/* Video thumbnails skeleton */}
          <div className="grid grid-cols-2 gap-3">
            <div className="group">
              <div className="relative rounded-xl overflow-hidden aspect-video mb-2 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="group">
              <div className="relative rounded-xl overflow-hidden aspect-video mb-2 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </>
      ) : videos.length > 0 ? (
        <>
          {/* Featured Video */}
          {featuredVideo && (
            <VideoCard video={featuredVideo} featured />
          )}
          
          {/* Video Thumbnails */}
          <div className="grid grid-cols-2 gap-3">
            {otherVideos.map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          Нет доступных видео
        </div>
      )}
    </div>
  );
};

export default VideosPreview;
