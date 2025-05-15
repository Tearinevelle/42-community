import { Link } from "wouter";
import { formatTimeSince } from "@/lib/utils";

interface BlogPostProps {
  post: {
    id: number;
    title: string;
    content: string;
    image: string | null;
    views: number;
    likes: number;
    comments: number;
    tags: string[];
    createdAt: string;
    author: {
      id: number;
      displayName: string;
      avatar: string | null;
    };
  };
}

export default function BlogPost({ post }: BlogPostProps) {
  // Default image if none provided
  const imageUrl = post.image || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=300";
  
  // Tag colors based on tag name
  const getTagColor = (tag: string) => {
    const tagColors: Record<string, string> = {
      "IT": "bg-blue-500/20 text-blue-400",
      "Бизнес": "bg-green-500/20 text-green-400",
      "Игры": "bg-purple-500/20 text-purple-400",
      "Обзор": "bg-yellow-500/20 text-yellow-400",
      "Музыка": "bg-pink-500/20 text-pink-400",
      "Технологии": "bg-blue-500/20 text-blue-400",
    };
    
    return tagColors[tag] || "bg-gray-500/20 text-gray-400";
  };
  
  return (
    <div className="gradient-border">
      <div className="bg-muted rounded-lg overflow-hidden">
        <img 
          src={imageUrl} 
          alt={post.title} 
          className="w-full h-48 object-cover"
        />
        <div className="p-5">
          <div className="flex items-center mb-3">
            <img 
              src={post.author.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=40&h=40"} 
              alt={post.author.displayName} 
              className="w-6 h-6 rounded-full mr-2"
            />
            <span className="text-sm text-gray-400">{post.author.displayName}</span>
            <span className="mx-2 text-gray-600">•</span>
            <span className="text-sm text-gray-400">{formatTimeSince(post.createdAt)}</span>
          </div>
          <Link href={`/blog/${post.id}`}>
            <a>
              <h3 className="text-xl font-bold mb-2 hover:text-secondary transition-colors">{post.title}</h3>
            </a>
          </Link>
          <p className="text-gray-400 mb-4 line-clamp-2">{post.content}</p>
          <div className="flex items-center justify-between">
            <div className="flex space-x-3">
              <span className="text-sm text-gray-500 flex items-center">
                <i className="far fa-eye mr-1"></i>
                {post.views}
              </span>
              <span className="text-sm text-gray-500 flex items-center">
                <i className="far fa-comment mr-1"></i>
                {post.comments}
              </span>
              <span className="text-sm text-gray-500 flex items-center">
                <i className="far fa-heart mr-1"></i>
                {post.likes}
              </span>
            </div>
            <div className="flex space-x-2">
              {post.tags.slice(0, 2).map((tag, index) => (
                <span key={index} className={`${getTagColor(tag)} text-xs px-2 py-1 rounded-full`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
