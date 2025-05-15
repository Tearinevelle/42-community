import TestimonialCard from "@/components/ui/testimonial-card";

interface Testimonial {
  id: number;
  content: string;
  author: string;
  position: string;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    content: "Команда выполнила все работы в срок и с превосходным качеством. Наш интернет-магазин стал работать намного быстрее, что положительно сказалось на конверсии и продажах.",
    author: "Александр Иванов",
    position: "Директор, ТехноМаркет",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"
  },
  {
    id: 2,
    content: "Прекрасный дизайн и удобный интерфейс — именно то, что мы получили от сотрудничества. Наши клиенты отмечают, насколько легко стало пользоваться сайтом.",
    author: "Елена Петрова",
    position: "Маркетолог, АртСтудио",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"
  },
  {
    id: 3,
    content: "После SEO-оптимизации наш сайт значительно улучшил позиции в поисковых системах, что привело к увеличению органического трафика на 70%. Рекомендую!",
    author: "Михаил Сидоров",
    position: "Основатель, СтройПро",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"
  }
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Что говорят клиенты</h2>
          <p className="text-lg text-blue-100 max-w-3xl mx-auto">
            Отзывы наших довольных клиентов о работе с нами
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              content={testimonial.content}
              author={testimonial.author}
              position={testimonial.position}
              avatar={testimonial.avatar}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
