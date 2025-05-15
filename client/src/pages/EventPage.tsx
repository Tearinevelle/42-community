import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Event, User } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, MapPin, Share, Star, Calendar, User as UserIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const EventPage = () => {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  
  // Fetch event details
  const { data: event, isLoading } = useQuery<Event & { user: User }>({
    queryKey: ['/api/events', id],
    queryFn: async () => {
      const res = await fetch(`/api/events/${id}`);
      if (!res.ok) throw new Error('Failed to fetch event');
      return res.json();
    },
    enabled: !!id,
  });
  
  const handleRegister = () => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    
    setIsRegisterDialogOpen(true);
  };
  
  const confirmRegistration = () => {
    // This would be an actual API call in a real application
    setIsRegisterDialogOpen(false);
    toast({
      title: "Регистрация подтверждена",
      description: "Вы успешно зарегистрировались на мероприятие",
    });
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'd MMMM yyyy', { locale: ru });
    } catch (e) {
      return dateString;
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Мероприятие не найдено</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Мероприятие, которое вы ищете, не существует или было удалено.
        </p>
        <Button onClick={() => navigate("/events")}>Вернуться к мероприятиям</Button>
      </div>
    );
  }
  
  // Parse dates
  const startDate = formatDate(event.startDate);
  const endDate = formatDate(event.endDate);
  const sameDay = startDate === endDate;
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <h1 className="text-3xl font-bold font-heading">{event.title}</h1>
          
          {/* Event Image */}
          {event.imageUrl && (
            <img 
              src={event.imageUrl}
              alt={event.title} 
              className="w-full h-auto object-cover rounded-lg shadow"
            />
          )}
          
          {/* Event Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Дата</div>
                <div>{sameDay ? startDate : `${startDate} - ${endDate}`}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Clock className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Время</div>
                <div>{event.startTime} - {event.endTime}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 col-span-2">
              <MapPin className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Место</div>
                <div>{event.location}</div>
              </div>
            </div>
          </div>
          
          {/* Description */}
          <div>
            <h2 className="text-xl font-bold mb-3">Описание</h2>
            <div className="prose dark:prose-invert max-w-none">
              <p>{event.description}</p>
            </div>
          </div>
          
          {/* Organizer */}
          <div>
            <h2 className="text-xl font-bold mb-3">Организатор</h2>
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={event.user.profileImageUrl || ""} alt={event.user.username || ""} />
                <AvatarFallback>{(event.user.username || event.user.firstName || "?").slice(0, 1)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">
                  {event.user.username || `${event.user.firstName || ''} ${event.user.lastName || ''}`}
                </div>
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary-600 dark:text-primary-400"
                  onClick={() => navigate(`/profile/${event.user.id}`)}
                >
                  Профиль организатора
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Registration Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Дата</span>
                <span className="font-medium">{sameDay ? startDate : `${startDate} - ${endDate}`}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Время</span>
                <span className="font-medium">{event.startTime} - {event.endTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Место</span>
                <span className="font-medium">{event.location}</span>
              </div>
            </div>
            
            <Button className="w-full" onClick={handleRegister}>
              Зарегистрироваться
            </Button>
            
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" size="icon">
                <Calendar className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Share className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Star className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Participants */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h3 className="text-lg font-bold mb-4">Участники</h3>
            <div className="flex flex-wrap gap-2">
              {/* This would be actual participants in a real application */}
              <Avatar>
                <AvatarFallback>М</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>А</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>Н</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>К</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>+8</AvatarFallback>
              </Avatar>
            </div>
            <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Всего участников: 12
            </div>
          </div>
          
          {/* Similar Events */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h3 className="text-lg font-bold mb-4">Похожие мероприятия</h3>
            <div className="space-y-4">
              {/* This would be actual similar events in a real application */}
              <div className="group cursor-pointer">
                <div className="text-sm font-medium group-hover:text-primary-600 dark:group-hover:text-primary-400">
                  Мастер-класс по дизайну
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" /> 15 мая
                </div>
              </div>
              <div className="group cursor-pointer">
                <div className="text-sm font-medium group-hover:text-primary-600 dark:group-hover:text-primary-400">
                  Встреча веб-разработчиков
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" /> 22 мая
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Registration confirmation dialog */}
      <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение регистрации</DialogTitle>
            <DialogDescription>
              Вы собираетесь зарегистрироваться на мероприятие "{event.title}".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <div className="text-sm font-medium">Дата и время</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {sameDay ? startDate : `${startDate} - ${endDate}`}, {event.startTime} - {event.endTime}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-500" />
              <div>
                <div className="text-sm font-medium">Место</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{event.location}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-gray-500" />
              <div>
                <div className="text-sm font-medium">Организатор</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {event.user.username || `${event.user.firstName || ''} ${event.user.lastName || ''}`}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRegisterDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={confirmRegistration}>
              Подтвердить регистрацию
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventPage;
