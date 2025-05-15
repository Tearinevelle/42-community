import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section 
      id="home" 
      className="relative bg-gradient-to-r from-blue-600 to-indigo-700 py-20 md:py-32"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-30"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 [text-shadow:0_2px_4px_rgba(0,0,0,0.2)]">
            Создаем современные веб-решения
          </h1>
          <p className="text-xl md:text-2xl text-white mb-10 [text-shadow:0_2px_4px_rgba(0,0,0,0.2)]">
            Разработка быстрых, отзывчивых и красивых веб-сайтов для вашего бизнеса
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              size="lg"
              variant="secondary" 
              className="px-8 py-6 bg-white text-blue-600 font-medium hover:bg-gray-100"
              onClick={() => scrollToSection("services")}
            >
              Наши услуги
            </Button>
            <Button 
              size="lg"
              variant="outline" 
              className="px-8 py-6 bg-transparent border-2 border-white text-white font-medium hover:bg-white hover:bg-opacity-10"
              onClick={() => scrollToSection("contact")}
            >
              Связаться с нами
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
