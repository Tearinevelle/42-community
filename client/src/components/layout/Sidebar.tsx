import { Link, useLocation } from "wouter";
import { 
  Home, 
  Store, 
  Calendar, 
  Video,
  Code, 
  Brush,
  Music,
  User
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

const Sidebar = () => {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Mock data
  const userGroups = [
    { id: 1, name: "Программисты", icon: <Code className="h-4 w-4" />, color: "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400" },
    { id: 2, name: "UI/UX Дизайн", icon: <Brush className="h-4 w-4" />, color: "bg-secondary-100 dark:bg-secondary-900 text-secondary-600 dark:text-secondary-400" },
    { id: 3, name: "Музыка", icon: <Music className="h-4 w-4" />, color: "bg-accent-100 dark:bg-accent-900 text-accent-600 dark:text-accent-400" }
  ];
  
  const userContacts = [
    { id: 1, name: "Мария", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40&q=80", status: "online" },
    { id: 2, name: "Николай", image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40&q=80", status: "offline", lastSeen: "3ч назад" }
  ];

  if (!isAuthenticated) return null;
  
  return (
    <aside className="hidden md:block w-64 shrink-0 border-r border-gray-200 dark:border-gray-800 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <div className="p-4">
        <nav className="space-y-1">
          <Link href="/">
            <a className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${location === '/' ? 'text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              <Home className="h-5 w-5" />
              <span>Лента</span>
            </a>
          </Link>
          <Link href="/marketplace">
            <a className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${location === '/marketplace' ? 'text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              <Store className="h-5 w-5" />
              <span>Маркетплейс</span>
            </a>
          </Link>
          <Link href="/events">
            <a className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${location === '/events' ? 'text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              <Calendar className="h-5 w-5" />
              <span>Мероприятия</span>
            </a>
          </Link>
          <Link href="/videos">
            <a className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${location === '/videos' ? 'text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              <Video className="h-5 w-5" />
              <span>Видео</span>
              <Badge variant="accent" className="ml-auto text-xs">
                Новое
              </Badge>
            </a>
          </Link>
        </nav>
        
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
          <h4 className="px-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Мои группы</h4>
          <div className="mt-3 space-y-1">
            {userGroups.map(group => (
              <Link key={group.id} href={`/group/${group.id}`}>
                <a className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${group.color}`}>
                    {group.icon}
                  </div>
                  <span className="text-sm">{group.name}</span>
                </a>
              </Link>
            ))}
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
          <h4 className="px-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Мои контакты</h4>
          <div className="mt-3 space-y-1">
            {userContacts.map(contact => (
              <Link key={contact.id} href={`/chat/${contact.id}`}>
                <a className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={contact.image} alt={contact.name} />
                    <AvatarFallback>{contact.name.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="text-sm font-medium">{contact.name}</span>
                    {contact.status === "online" ? (
                      <div className="flex items-center text-xs text-green-500">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block mr-1"></span>
                        Онлайн
                      </div>
                    ) : (
                      <div className="flex items-center text-xs text-gray-400">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full inline-block mr-1"></span>
                        {contact.lastSeen}
                      </div>
                    )}
                  </div>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
