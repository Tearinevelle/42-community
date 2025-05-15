import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add Font Awesome for icons
const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
document.head.appendChild(link);

// Add page title
const title = document.createElement("title");
title.textContent = "Клиент-серверное приложение";
document.head.appendChild(title);

createRoot(document.getElementById("root")!).render(<App />);
