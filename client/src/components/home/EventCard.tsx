import { Button } from "@/components/ui/button";
import { formatEventDate } from "@/lib/utils";

interface EventCardProps {
  event: {
    id: number;
    title: string;
    description: string;
    eventType: string;
    category: string;
    location: string;
    date: string;
    image: string | null;
    participantsCount: number;
    organizer: {
      id: number;
      displayName: string;
    };
  };
  onParticipate: (eventId: number) => void;
}

export default function EventCard({ event, onParticipate }: EventCardProps) {
  const eventTypeLabel = event.eventType === "online" ? "Онлайн" : "Офлайн";
  const eventTypeClass = event.eventType === "online" 
    ? "bg-purple-500/20 text-purple-400" 
    : "bg-secondary/20 text-secondary";
  
  const categoryClass = "bg-blue-500/20 text-blue-400";
  
  // Use the provided image or a default based on category
  const getDefaultImage = () => {
    switch (event.category.toLowerCase()) {
      case "технологии":
        return "https://images.unsplash.com/photo-1540304453527-62f979142a17?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=450&h=250";
      case "музыка":
        return "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=450&h=250";
      case "игры":
        return "https://images.unsplash.com/photo-1511882150382-421056c89033?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=450&h=250";
      default:
        return "https://images.unsplash.com/photo-1540304453527-62f979142a17?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=450&h=250";
    }
  };
  
  const imageUrl = event.image || getDefaultImage();
  
  const locationText = event.eventType === "online" 
    ? "Discord, ссылка после регистрации" 
    : event.location || "Место уточняется";
  
  const locationIcon = event.eventType === "online" ? "globe" : "map-marker-alt";
  
  const handleParticipate = () => {
    onParticipate(event.id);
  };
  
  return (
    <div className="gradient-border">
      <div className="bg-muted rounded-lg overflow-hidden">
        <img 
          src={imageUrl} 
          alt={event.title} 
          className="w-full h-40 object-cover"
        />
        <div className="p-4">
          <div className="flex items-center mb-2">
            <span className={`${eventTypeClass} text-xs px-2 py-1 rounded-full`}>
              {eventTypeLabel}
            </span>
            <span className={`${categoryClass} text-xs px-2 py-1 rounded-full ml-2`}>
              {event.category}
            </span>
          </div>
          <h3 className="text-lg font-medium">{event.title}</h3>
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex items-center text-gray-400">
              <i className="far fa-calendar-alt w-5 text-center mr-2"></i>
              <span>{formatEventDate(event.date)}</span>
            </div>
            <div className="flex items-center text-gray-400">
              <i className={`fas fa-${locationIcon} w-5 text-center mr-2`}></i>
              <span>{locationText}</span>
            </div>
            <div className="flex items-center text-gray-400">
              <i className="fas fa-users w-5 text-center mr-2"></i>
              <span>{event.participantsCount} участников</span>
            </div>
          </div>
          <div className="mt-4 flex space-x-2">
            <Button 
              onClick={handleParticipate}
              className="flex-1 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
            >
              Участвовать
            </Button>
            <button className="w-10 h-10 border border-gray-600 rounded-lg flex items-center justify-center hover:bg-accent transition-colors">
              <i className="far fa-bookmark"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
