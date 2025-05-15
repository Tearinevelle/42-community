import ChatPreview from "./ChatPreview";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

export default function ChatSection() {
  const { isAuthenticated } = useAuth();
  
  const { data: chats } = useQuery({
    queryKey: ['/api/chats'],
    enabled: isAuthenticated,
  });

  // Calculate unread messages count
  const unreadCount = chats?.reduce((count, chat) => {
    if (chat.lastMessage && !chat.lastMessage.read) {
      return count + 1;
    }
    return count;
  }, 0) || 0;

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold font-montserrat">Общение</h2>
        <a href="/chat" className="text-secondary flex items-center gap-1 hover:underline">
          <span>Все чаты</span>
          <i className="fas fa-chevron-right text-sm"></i>
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chat preview component */}
        <ChatPreview chats={chats || []} unreadCount={unreadCount} />

        {/* Chat security component */}
        <div className="gradient-border">
          <div className="bg-muted p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <div className="text-secondary text-3xl mr-3">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3 className="text-xl font-bold">Безопасное общение</h3>
            </div>
            
            <p className="text-gray-300 mb-4">
              Наша платформа обеспечивает защищенное общение между пользователями. Вот несколько правил безопасности:
            </p>
            
            <ul className="space-y-3 mb-4">
              <li className="flex items-start gap-2">
                <i className="fas fa-check-circle text-green-500 mt-1"></i>
                <span className="text-gray-300">Все сделки проводите через нашу платформу с гарантией</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fas fa-check-circle text-green-500 mt-1"></i>
                <span className="text-gray-300">Обращайте внимание на рейтинг и отзывы пользователей</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fas fa-exclamation-triangle text-yellow-500 mt-1"></i>
                <span className="text-gray-300">Не переходите на общение через сторонние мессенджеры</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fas fa-exclamation-triangle text-yellow-500 mt-1"></i>
                <span className="text-gray-300">Никогда не передавайте личные данные или пароли</span>
              </li>
            </ul>
            
            <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg flex items-start gap-3">
              <i className="fas fa-info-circle text-yellow-500 mt-1"></i>
              <p className="text-sm text-gray-300">
                Наша система автоматически выявляет подозрительное поведение и предупреждает вас о потенциальных мошенниках.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
