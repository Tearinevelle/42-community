import EventCard from "./EventCard";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export default function EventsSection() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['/api/events/upcoming'],
  });

  // Mutation for joining events
  const participateMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const res = await apiRequest('POST', `/api/events/${eventId}/participate`);
      return res.json();
    },
    onSuccess: () => {
      // Invalidate events query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/events/upcoming'] });
      
      toast({
        title: "Успешно!",
        description: "Вы присоединились к мероприятию",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось присоединиться к мероприятию",
        variant: "destructive",
      });
    }
  });

  const handleParticipate = (eventId: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Требуется авторизация",
        description: "Войдите через Telegram, чтобы присоединиться к мероприятию",
        variant: "destructive",
      });
      return;
    }
    
    participateMutation.mutate(eventId);
  };

  // Use actual data from API
  const displayEvents = events || [];

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold font-montserrat">Предстоящие сходки</h2>
        <Link href="/events">
          <a className="text-secondary flex items-center gap-1 hover:underline">
            <span>Все мероприятия</span>
            <i className="fas fa-chevron-right text-sm"></i>
          </a>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {displayEvents.map((event) => (
          <EventCard 
            key={event.id} 
            event={event} 
            onParticipate={handleParticipate}
          />
        ))}
      </div>
    </section>
  );
}
