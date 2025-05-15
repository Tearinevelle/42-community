
import { useEffect } from 'react';

export default function About() {
  useEffect(() => {
    document.title = "42-коммьюнити - О нас";
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">О нас</h1>
      <div className="prose prose-invert max-w-none space-y-6">
        <p className="text-lg">
          42-коммьюнити - это универсальная социальная платформа, созданная для объединения людей со схожими интересами и целями. Наша миссия - создать безопасное и комфортное пространство для общения, обмена опытом и взаимной поддержки.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8">Почему мы существуем?</h2>
        <p>
          Мы создали эту платформу, чтобы объединить людей в единое сообщество, где каждый может найти единомышленников, поделиться своими знаниями и опытом, а также получить поддержку от других участников.
        </p>

        <h2 className="text-2xl font-semibold mt-8">Наши ценности</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Безопасность и конфиденциальность пользователей</li>
          <li>Открытость и прозрачность в общении</li>
          <li>Взаимоуважение и поддержка</li>
          <li>Развитие и обмен знаниями</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8">Что мы предлагаем?</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Безопасную платформу для общения</li>
          <li>Тематические каналы по интересам</li>
          <li>Маркетплейс для безопасной торговли</li>
          <li>Возможность создания контента и обмена опытом</li>
        </ul>
      </div>
    </div>
  );
}
