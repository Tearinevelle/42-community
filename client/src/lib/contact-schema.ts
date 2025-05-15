import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Имя должно содержать не менее 2 символов" }),
  email: z.string().email({ message: "Пожалуйста, введите корректный email" }),
  phone: z.string().optional(),
  subject: z.string().min(1, { message: "Пожалуйста, выберите тему" }),
  message: z.string().min(10, { message: "Сообщение должно содержать не менее 10 символов" })
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
