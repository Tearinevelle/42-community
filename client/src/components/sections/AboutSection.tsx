import { Button } from "@/components/ui/button";

export default function AboutSection() {
  return (
    <section id="about" className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
              alt="Наша команда за работой" 
              className="rounded-lg shadow-xl w-full h-auto" 
              loading="lazy"
            />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">О нас</h2>
            <p className="text-lg text-gray-600 mb-6">
              Мы — команда опытных разработчиков и дизайнеров, стремящихся создавать высококачественные веб-решения, которые помогают нашим клиентам достигать их бизнес-целей.
            </p>
            <p className="text-lg text-gray-600 mb-8">
              С 2015 года мы успешно реализовали более 200 проектов для клиентов из различных отраслей, от малого бизнеса до крупных корпораций. Наш подход сочетает в себе инновационные технологии, стильный дизайн и оптимизацию для достижения наилучших результатов.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary mb-2">200+</p>
                <p className="text-gray-600">Проектов</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-primary mb-2">50+</p>
                <p className="text-gray-600">Клиентов</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-primary mb-2">15+</p>
                <p className="text-gray-600">Специалистов</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-primary mb-2">8</p>
                <p className="text-gray-600">Лет опыта</p>
              </div>
            </div>
            <Button 
              className="px-6 py-3" 
              onClick={() => {
                const contactSection = document.getElementById("contact");
                if (contactSection) {
                  contactSection.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              Свяжитесь с нами
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
