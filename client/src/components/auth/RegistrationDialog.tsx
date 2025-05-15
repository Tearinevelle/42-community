
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { TelegramAuthData, UserRegistrationData, registerUser } from "@/lib/telegram";
import { useToast } from "@/hooks/use-toast";

interface RegistrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  telegramData: TelegramAuthData;
  onSuccess: () => void;
}

export function RegistrationDialog({ isOpen, onClose, telegramData, onSuccess }: RegistrationDialogProps) {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("other");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const registrationData: UserRegistrationData = {
        displayName,
        username,
        gender,
        telegramData
      };
      
      await registerUser(registrationData);
      onSuccess();
      toast({
        title: "Регистрация успешна",
        description: "Добро пожаловать в 42-коммьюнити!",
      });
    } catch (error) {
      toast({
        title: "Ошибка регистрации",
        description: error instanceof Error ? error.message : "Произошла ошибка при регистрации",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Давайте познакомимся!</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="displayName">Введите Имя Пользователя</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="username">Введите username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Выберите пол</Label>
            <RadioGroup value={gender} onValueChange={(value: any) => setGender(value)}>
              <div className="flex space-x-4">
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
                  <Label htmlFor="other">Другое</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
          <p className="text-sm text-yellow-500">
            Не используйте свой username, используемый в телеграме, чтобы обезопасить себя.
          </p>
          <Button type="submit" className="w-full">Завершить регистрацию</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
