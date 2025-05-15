import { Monitor, Palette, TrendingUp } from "lucide-react";
import ServiceCard from "@/components/ui/service-card";

interface Service {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const services: Service[] = [
  {
    icon: <Monitor className="h-12 w-12" />,
    title: "Веб-разработка",
    description: "Создание современных, быстрых и отзывчивых веб-сайтов с использованием новейших технологий",
    color: "text-primary"
  },
  {
    icon: <Palette className="h-12 w-12" />,
    title: "UI/UX Дизайн",
    description: "Создание привлекательных и удобных интерфейсов, которые улучшают пользовательский опыт",
    color: "text-secondary"
  },
  {
    icon: <TrendingUp className="h-12 w-12" />,
    title: "SEO Оптимизация",
    description: "Повышение видимости вашего сайта в поисковых системах для привлечения большего числа посетителей",
    color: "text-accent"
  }
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Наши услуги</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Мы предлагаем широкий спектр услуг для создания и продвижения вашего онлайн-присутствия
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard 
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
              color={service.color}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
