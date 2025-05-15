import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { MoreVertical, Heart, MessageCircle, Share2, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Comment, Post, User } from "@shared/schema";

interface PostCardProps {
  post: Post & { user: User };
  showComments?: boolean;
}

interface PostComment extends Comment {
  user: User;
}

const PostCard = ({ post, showComments = false }: PostCardProps) => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const [showCommentsState, setShowCommentsState] = useState(showComments);
  
  // Get post likes and comments count
  const { data: postDetails } = useQuery({
    queryKey: ['/api/posts', post.id],
    enabled: !!post.id,
  });

  // Get post comments
  const { data: comments = [] } = useQuery<PostComment[]>({
    queryKey: ['/api/posts', post.id, 'comments'],
    queryFn: async () => {
      const res = await fetch(`/api/posts/${post.id}/comments`);
      if (!res.ok) throw new Error('Failed to fetch comments');
      return res.json();
    },
    enabled: showCommentsState,
  });

  // Check if user liked the post
  const { data: likeStatus } = useQuery({
    queryKey: ['/api/posts', post.id, 'likes', 'check'],
    queryFn: async () => {
      if (!isAuthenticated) return { isLiked: false };
      const res = await fetch(`/api/posts/${post.id}/likes/check`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to check like status');
      return res.json();
    },
    enabled: isAuthenticated,
  });

  // Like post mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (likeStatus?.isLiked) {
        await apiRequest('DELETE', `/api/posts/${post.id}/likes`);
      } else {
        await apiRequest('POST', '/api/likes', { postId: post.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts', post.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts', post.id, 'likes', 'check'] });
    },
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest('POST', '/api/comments', { 
        postId: post.id,
        content 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts', post.id, 'comments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts', post.id] });
      setCommentText('');
    },
  });

  const handleLike = () => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    likeMutation.mutate();
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    if (commentText.trim()) {
      commentMutation.mutate(commentText);
    }
  };

  const toggleComments = () => {
    setShowCommentsState(prev => !prev);
  };

  // Extract hashtags from post content
  const tags = post.content?.match(/#[a-zA-Zа-яА-Я0-9_]+/g) || [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.user.profileImageUrl || ""} alt={post.user.username || ""} />
            <AvatarFallback>{(post.user.username || post.user.firstName || "?").slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">
              {post.user.username || `${post.user.firstName || ''} ${post.user.lastName || ''}`}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ru }) : ''}
            </div>
          </div>
        </div>
        <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>
      
      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="mb-3">{post.content}</p>
        {post.imageUrl && (
          <img 
            src={post.imageUrl}
            alt="Post image" 
            className="rounded-xl w-full h-auto object-cover mb-3"
          />
        )}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      {/* Post Stats */}
      <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <Heart className={`h-4 w-4 ${likeStatus?.isLiked ? 'fill-accent-500 text-accent-500' : ''}`} />
            {' '}
            {postDetails?.likes || 0}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            {' '}
            {postDetails?.comments || 0}
          </span>
        </div>
        <span>
          <i className="ri-eye-line"></i> {Math.floor(Math.random() * 500) + 100} просмотров
        </span>
      </div>
      
      {/* Post Actions */}
      <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-700">
        <button 
          className={`flex items-center justify-center gap-2 py-2 hover:text-accent-500 dark:hover:text-accent-400 ${likeStatus?.isLiked ? 'text-accent-500 dark:text-accent-400' : 'text-gray-600 dark:text-gray-300'}`}
          onClick={handleLike}
        >
          <Heart className={`h-5 w-5 ${likeStatus?.isLiked ? 'fill-accent-500' : ''}`} />
          <span>Нравится</span>
        </button>
        <button 
          className="flex items-center justify-center gap-2 py-2 text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400"
          onClick={toggleComments}
        >
          <MessageCircle className="h-5 w-5" />
          <span>Комментировать</span>
        </button>
        <button className="flex items-center justify-center gap-2 py-2 text-gray-600 dark:text-gray-300 hover:text-secondary-500 dark:hover:text-secondary-400">
          <Share2 className="h-5 w-5" />
          <span>Поделиться</span>
        </button>
      </div>
      
      {/* Comments Section */}
      {showCommentsState && (
        <div className="bg-gray-50 dark:bg-gray-850 p-4 border-t border-gray-100 dark:border-gray-700">
          {comments.length > 0 ? (
            <div className="mb-3">
              {comments.map(comment => (
                <div key={comment.id} className="flex items-start gap-3 mb-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user.profileImageUrl || ""} alt={comment.user.username || ""} />
                    <AvatarFallback>{(comment.user.username || comment.user.firstName || "?").slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 text-sm flex-1">
                    <div className="font-medium mb-1">
                      {comment.user.username || `${comment.user.firstName || ''} ${comment.user.lastName || ''}`}
                    </div>
                    <p>{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-3 text-gray-500 dark:text-gray-400">
              Будьте первым, кто оставит комментарий!
            </div>
          )}
          
          {/* Comment input */}
          <form onSubmit={handleComment} className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.profileImageUrl || ""} alt={user?.username || ""} />
              <AvatarFallback>{user ? (user.username || user.firstName || "?").slice(0, 1) : "?"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Написать комментарий..."
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full py-2 px-4 pr-10 text-sm"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute right-3 top-2 text-primary-500 hover:text-primary-600"
                disabled={!commentText.trim() || commentMutation.isPending}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;
