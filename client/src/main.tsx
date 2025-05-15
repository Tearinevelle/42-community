import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { loadFonts } from "@/lib/utils";

// Add font imports
const fontStylesheet = document.createElement("link");
fontStylesheet.rel = "stylesheet";
fontStylesheet.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Roboto:wght@300;400;500&display=swap";
document.head.appendChild(fontStylesheet);

// Add FontAwesome for icons
const fontAwesome = document.createElement("link");
fontAwesome.rel = "stylesheet";
fontAwesome.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
document.head.appendChild(fontAwesome);

// Add meta tags for SEO
const metaDescription = document.createElement("meta");
metaDescription.name = "description";
metaDescription.content = "Сеть - универсальная платформа для общения, торговли, организации мероприятий и многого другого";
document.head.appendChild(metaDescription);

// Set page title
document.title = "Сеть - Универсальная социальная платформа";

createRoot(document.getElementById("root")!).render(<App />);
