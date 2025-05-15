import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Image, Video, Calendar, Store } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const PostCreator = () => {
  const { user, isAuthenticated } = useAuth();
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Post creation mutation
  const postMutation = useMutation({
    mutationFn: async () => {
      if (postImage) {
        const formData = new FormData();
        formData.append("content", postContent);
        formData.append("image", postImage);
        
        const response = await fetch("/api/posts", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        
        if (!response.ok) {
          throw new Error("Failed to create post");
        }
        
        return response.json();
      } else {
        return apiRequest("POST", "/api/posts", { content: postContent });
      }
    },
    onSuccess: () => {
      setPostContent("");
      setPostImage(null);
      setPostImagePreview(null);
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Успех!",
        description: "Ваш пост успешно опубликован",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось опубликовать пост. Пожалуйста, попробуйте еще раз.",
        variant: "destructive",
      });
      console.error(error);
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPostImage(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) {
      toast({
        title: "Ошибка",
        description: "Пост не может быть пустым",
        variant: "destructive",
      });
      return;
    }
    
    postMutation.mutate();
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      // Reset form when dialog is closed
      setPostContent("");
      setPostImage(null);
      setPostImagePreview(null);
    }
    setIsDialogOpen(open);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="w-10 h-10">
          <AvatarImage src={user?.profileImageUrl || ""} alt={user?.username || ""} />
          <AvatarFallback>{user ? (user.username || user.firstName || "?").slice(0, 1) : "?"}</AvatarFallback>
        </Avatar>
        
        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild className="flex-1">
            <Input
              type="text"
              placeholder="Что у вас нового?"
              className="w-full bg-gray-100 dark:bg-gray-700 rounded-full py-2 px-4 text-sm cursor-pointer"
              readOnly
            />
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Создание поста</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user?.profileImageUrl || ""} alt={user?.username || ""} />
                    <AvatarFallback>{user ? (user.username || user.firstName || "?").slice(0, 1) : "?"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {user?.username || `${user?.firstName || ''} ${user?.lastName || ''}`}
                    </p>
                  </div>
                </div>
                
                <Textarea
                  placeholder="Что у вас нового?"
                  className="w-full min-h-[150px]"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                />
                
                {postImagePreview && (
                  <div className="relative">
                    <img
                      src={postImagePreview}
                      alt="Preview"
                      className="max-h-[300px] rounded-lg w-full object-contain"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setPostImage(null);
                        setPostImagePreview(null);
                      }}
                    >
                      Удалить
                    </Button>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <label className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                    <Image className="h-5 w-5 text-green-500" />
                    <span>Фото</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    disabled
                  >
                    <Video className="h-5 w-5 text-blue-500" />
                    <span>Видео</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    disabled
                  >
                    <Calendar className="h-5 w-5 text-purple-500" />
                    <span>Мероприятие</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    disabled
                  >
                    <Store className="h-5 w-5 text-orange-500" />
                    <span>Товар</span>
                  </Button>
                </div>
                
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={!postContent.trim() || postMutation.isPending}
                  >
                    {postMutation.isPending ? "Публикация..." : "Опубликовать"}
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          onClick={() => setIsDialogOpen(true)}
        >
          <Image className="h-5 w-5 text-green-500" />
          <span>Фото</span>
        </Button>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          onClick={() => setIsDialogOpen(true)}
        >
          <Video className="h-5 w-5 text-blue-500" />
          <span>Видео</span>
        </Button>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          onClick={() => setIsDialogOpen(true)}
        >
          <Calendar className="h-5 w-5 text-purple-500" />
          <span>Мероприятие</span>
        </Button>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          onClick={() => setIsDialogOpen(true)}
        >
          <Store className="h-5 w-5 text-orange-500" />
          <span>Товар</span>
        </Button>
      </div>
    </div>
  );
};

export default PostCreator;
