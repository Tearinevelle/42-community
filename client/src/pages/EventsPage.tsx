import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Event, User } from "@shared/schema";
import EventCard from "@/components/events/EventCard";
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
import { Search, Filter, Calendar, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const EventsPage = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("upcoming");
  const pageSize = 10;

  // Form state for creating event
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventStartTime, setEventStartTime] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  const [eventImage, setEventImage] = useState<File | null>(null);

  // Fetch events with pagination and filtering
  const { data: events = [], isLoading, isFetching } = useQuery<(Event & { user: User })[]>({
    queryKey: ['/api/events', { limit: pageSize, offset: page * pageSize, timeFilter, search: searchQuery }],
    queryFn: async () => {
      let url = `/api/events?limit=${pageSize}&offset=${page * pageSize}`;
      if (timeFilter) {
        url += `&timeFilter=${timeFilter}`;
      }
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch events');
      return res.json();
    },
    keepPreviousData: true,
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("title", eventTitle);
      formData.append("description", eventDescription);
      formData.append("location", eventLocation);
      formData.append("startDate", eventStartDate);
      formData.append("endDate", eventEndDate);
      formData.append("startTime", eventStartTime);
      formData.append("endTime", eventEndTime);

      if (eventImage) {
        formData.append("image", eventImage);
      }

      const response = await fetch("/api/events", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to create event");
      }

      return response.json();
    },
    onSuccess: () => {
      resetForm();
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({
        title: "Успех!",
        description: "Ваше мероприятие успешно создано",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать мероприятие. Пожалуйста, попробуйте еще раз.",
        variant: "destructive",
      });
      console.error(error);
    }
  });

  const resetForm = () => {
    setEventTitle("");
    setEventDescription("");
    setEventLocation("");
    setEventStartDate("");
    setEventEndDate("");
    setEventStartTime("");
    setEventEndTime("");
    setEventImage(null);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) resetForm();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEventImage(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!eventTitle || !eventDescription || !eventLocation || 
        !eventStartDate || !eventEndDate || !eventStartTime || !eventEndTime) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    createEventMutation.mutate();
  };

  const loadMoreEvents = () => {
    setPage(prevPage => prevPage + 1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0); // Reset to first page when searching
  };

  const handleTimeFilterChange = (value: string) => {
    setTimeFilter(value);
    setPage(0); // Reset to first page when changing filter
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-heading">Мероприятия</h1>

        {isAuthenticated ? (
          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Создать мероприятие
              </Button>
            </DialogTrigger>
        ) : (
          <div className="flex items-center gap-2">
            <i className="fas fa-info-circle text-secondary"></i>
            <span className="text-sm text-gray-500">Чтобы создать мероприятие, войдите через Telegram</span>
            <div id="events-login-button"></div>
          </div>
        )}
                <Plus className="h-4 w-4 mr-2" />
                Создать мероприятие
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Создание мероприятия</DialogTitle>
              </DialogHeader>


              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="title">Название мероприятия *</Label>
                  <Input
                    id="title"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="Введите название мероприятия"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Описание *</Label>
                  <Textarea
                    id="description"
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    placeholder="Опишите ваше мероприятие"
                    className="min-h-[100px]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Место проведения *</Label>
                  <Input
                    id="location"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="Адрес или название места"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Дата начала *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={eventStartDate}
                      onChange={(e) => setEventStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Дата окончания *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={eventEndDate}
                      onChange={(e) => setEventEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Время начала *</Label>
                    <Input
                      id="startTime"
                      value={eventStartTime}
                      onChange={(e) => setEventStartTime(e.target.value)}
                      placeholder="например, 18:00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">Время окончания *</Label>
                    <Input
                      id="endTime"
                      value={eventEndTime}
                      onChange={(e) => setEventEndTime(e.target.value)}
                      placeholder="например, 21:00"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Изображение</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Рекомендуемый размер: 1200x600px
                  </p>
                </div>

                <div className="flex justify-end mt-4">
                  <Button
                    type="submit"
                    disabled={createEventMutation.isPending}
                  >
                    {createEventMutation.isPending ? "Создание..." : "Создать мероприятие"}
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
                placeholder="Поиск мероприятий..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </form>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <Select value={timeFilter} onValueChange={handleTimeFilterChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Время" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Предстоящие</SelectItem>
                <SelectItem value="past">Прошедшие</SelectItem>
                <SelectItem value="all">Все мероприятия</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Events List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array(5).fill(0).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex gap-3">
                <Skeleton className="w-16 h-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : events.length > 0 ? (
        <>
          <div className="space-y-4">
            {events.map(event => (
              <EventCard key={event.id} event={event} compact={false} />
            ))}
          </div>

          {/* Load More Button */}
          {events.length >= pageSize && (
            <div className="mt-8 text-center">
              <Button 
                onClick={loadMoreEvents}
                disabled={isFetching}
                variant="outline"
                className="px-6"
              >
                {isFetching ? "Загрузка..." : "Показать больше мероприятий"}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow">
          <h3 className="text-lg font-medium mb-2">Мероприятия не найдены</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchQuery 
              ? "Попробуйте изменить параметры поиска" 
              : timeFilter === "upcoming" 
                ? "Нет предстоящих мероприятий" 
                : timeFilter === "past" 
                  ? "Нет прошедших мероприятий" 
                  : "В данный момент мероприятия отсутствуют"}
          </p>
          {(searchQuery || timeFilter !== "upcoming") && (
            <Button 
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setTimeFilter("upcoming");
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

export default EventsPage;