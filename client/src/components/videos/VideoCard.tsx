import { Link } from "wouter";
import { Play } from "lucide-react";
import { Video, User } from "@shared/schema";

interface VideoCardProps {
  video: Video & { user: User };
  featured?: boolean;
}

const VideoCard = ({ video, featured = false }: VideoCardProps) => {
  // Format view count
  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
      return (views / 1000).toFixed(1) + 'K';
    }
    return views.toString();
  };

  // Duration formatting
  const formatDuration = (duration: string) => {
    return duration || "00:00";
  };

  return (
    <Link href={`/video/${video.id}`}>
      <a className="group cursor-pointer block">
        <div className={`relative rounded-xl overflow-hidden ${featured ? 'mb-3 aspect-video' : 'mb-2 aspect-video'}`}>
          <img 
            src={video.thumbnailUrl}
            alt={video.title} 
            className="w-full h-full object-cover"
          />
          <div className={`absolute inset-0 ${featured ? 'bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:opacity-90 transition-opacity' : ''}`}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`bg-white/20 backdrop-blur-sm rounded-full ${featured ? 'w-12 h-12' : 'w-8 h-8'} flex items-center justify-center ${featured ? '' : 'opacity-0 group-hover:opacity-100 transition-opacity'}`}>
              <Play className={`text-white ${featured ? 'h-6 w-6' : 'h-4 w-4'}`} fill="white" />
            </div>
          </div>
          <span className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
            {formatDuration(video.duration || "")}
          </span>
          
          {featured && (
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <h4 className="font-medium text-sm">{video.title}</h4>
              <div className="flex items-center text-xs gap-2 mt-1">
                <span>{video.user.username || `${video.user.firstName || ''} ${video.user.lastName || ''}`}</span>
                <span>•</span>
                <span>{formatViews(video.views || 0)} просмотров</span>
              </div>
            </div>
          )}
        </div>
        
        {!featured && (
          <h4 className="text-xs font-medium truncate">{video.title}</h4>
        )}
      </a>
    </Link>
  );
};

export default VideoCard;
