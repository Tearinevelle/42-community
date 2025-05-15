
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ChromePicker } from 'react-color';
import { useQueryClient } from "@tanstack/react-query";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUser: any;
}

export default function EditProfileDialog({ open, onOpenChange, currentUser }: EditProfileDialogProps) {
  const [username, setUsername] = useState(currentUser?.username || "");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [themeColor, setThemeColor] = useState("#FF0000");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username || "");
      setThemeColor(currentUser.themeColor || "#FF0000");
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("username", username);
    formData.append("themeColor", themeColor);
    if (avatar) formData.append("avatar", avatar);
    if (banner) formData.append("banner", banner);

    try {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) throw new Error("Failed to update profile");

      toast({
        title: "Профиль обновлен",
        description: "Изменения успешно сохранены",
      });
      
      // Инвалидируем кэш для обновления данных пользователя
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Редактировать профиль</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Имя пользователя</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Введите имя пользователя"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="avatar">Аватарка</Label>
            <Input
              id="avatar"
              type="file"
              accept="image/*,.gif"
              onChange={(e) => e.target.files && setAvatar(e.target.files[0])}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner">Баннер</Label>
            <Input
              id="banner"
              type="file"
              accept="image/*,.gif"
              onChange={(e) => e.target.files && setBanner(e.target.files[0])}
            />
          </div>

          <div className="space-y-2">
            <Label>Цвет кнопок</Label>
            <ChromePicker
              color={themeColor}
              onChange={(color) => setThemeColor(color.hex)}
              className="w-full"
              disableAlpha={true}
            />
          </div>

          <Button type="submit" className="w-full">Сохранить изменения</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
