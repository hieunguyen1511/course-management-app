import { Category } from "./category";
export interface Section {
  id: number;
  title: string;
  description?: string;
  lessons: Lesson[];
}

export interface Answer {
  id: string;
  content: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  content: string;
  note?: string;
  answers: Answer[];
}

export interface Lesson {
  id: number;
  title: string;
  content?: string;
  duration: string;
  videoUrl?: string;
  isQuiz?: boolean;
  questions?: Question[];
}

export interface Course {
  id: string;
  name: string;
  category: Category;
  description: string;
  isPaid: boolean;
  price: string | number;
  hasDiscount: boolean;
  discount: string;
  image: string;
  enrollment_count: string | number;
  total_rating: number;
  status: number;
  sections: Section[];
} 