import { Button } from "@/components/ui/button";
import PortfolioCard from "@/components/ui/portfolio-card";

interface PortfolioItem {
  id: number;
  image: string;
  title: string;
  description: string;
  alt: string;
}

const portfolioItems: PortfolioItem[] = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
    title: "Интернет-магазин электроники",
    description: "Современный адаптивный дизайн с оптимизированным пользовательским опытом покупок",
    alt: "Интернет-магазин электроники"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
    title: "Корпоративный сайт юридической фирмы",
    description: "Элегантный дизайн, отражающий профессионализм и надежность компании",
    alt: "Корпоративный сайт юридической фирмы"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1526498460520-4c246339dccb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
    title: "Мобильное приложение для доставки еды",
    description: "Интуитивный интерфейс с возможностью отслеживания заказа в реальном времени",
    alt: "Мобильное приложение для доставки еды"
  }
];

export default function PortfolioSection() {
  return (
    <section id="portfolio" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Наше портфолио</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Ознакомьтесь с некоторыми из наших недавних проектов
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {portfolioItems.map((item) => (
            <PortfolioCard
              key={item.id}
              image={item.image}
              title={item.title}
              description={item.description}
              alt={item.alt}
            />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            className="px-6 py-3 border border-primary text-primary font-medium hover:bg-primary hover:text-white"
            onClick={() => {
              const contactSection = document.getElementById("contact");
              if (contactSection) {
                contactSection.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            Посмотреть больше проектов
          </Button>
        </div>
      </div>
    </section>
  );
}
