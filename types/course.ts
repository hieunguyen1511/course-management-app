import { Category } from "./category";
export interface Section {
  id: number;
  course_id: number;
  name: string;
  description?: string;
  lessons: Lesson[];
  save: boolean,
  newIdLesson: number,
}

export interface Answer {
  id: number;
  question_id: number;
  content: string;
  is_correct: boolean;
  save: boolean,
}

export interface Question {
  id: number;
  lesson_id: number;
  content: string;
  note?: string;
  answers: Answer[];
  save: boolean,
  newIdAnswer: number,
}

export interface Lesson {
  id: number;
  section_id: number;
  title: string;
  content?: string;
  is_quizz?: boolean;
  video_url?: string;
  questions: Question[];
  save: boolean,
  newIdQuestion: number,
}

export interface Course {
  id: number;
  name: string;
  category: Category;
  description: string;
  isPaid: boolean;
  price: number;
  hasDiscount: boolean;
  discount: number;
  image: string;
  enrollment_count: number,
  total_rating: number,
  status: number,
  sections: Section[];
} 

export interface Enrollment {
  id: number;
  course_id: number;
  user: User;
  price: number;
  rating: number;
  review: string;
  completed_at: string | Date;
  last_access: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
  enrollment_lessons: Enrollment_Lesson[];
}

export interface User {
  id: number;
  username: string;
  fullname: string;
  avatar: string;
  role: number,
  email: string;
}

export interface Comment {
  id: number;
  course_id: number;
  user: User;
  content: string;
  parent_id: number;
  createdAt: string | Date;
}

export interface Enrollment_Lesson {
  id: number;
  enrollment_id: number;
  lesson_id: number;
  completed_at: string | Date;
}