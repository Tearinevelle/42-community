import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-primary border-t border-gray-800 py-6 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <div className="text-xl font-bold font-montserrat text-white mb-2">
            <span className="text-secondary">42</span>-коммьюнити
          </div>
          <p className="text-gray-400 text-sm">© {new Date().getFullYear()} Все права защищены</p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          <Link href="/about">
            <a className="text-gray-400 hover:text-white transition-colors">О проекте</a>
          </Link>
          <Link href="/rules">
            <a className="text-gray-400 hover:text-white transition-colors">Правила</a>
          </Link>
          <Link href="/support">
            <a className="text-gray-400 hover:text-white transition-colors">Поддержка</a>
          </Link>
          <Link href="/contacts">
            <a className="text-gray-400 hover:text-white transition-colors">Контакты</a>
          </Link>
        </div>

        <div className="mt-4 md:mt-0 flex space-x-4">
          <a 
            href="https://t.me/your_channel" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <i className="fab fa-telegram"></i>
          </a>
          <a 
            href="https://vk.com/your_group" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <i className="fab fa-vk"></i>
          </a>
          <a 
            href="https://discord.gg/your_server" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <i className="fab fa-discord"></i>
          </a>
        </div>
      </div>
    </footer>
  );
}