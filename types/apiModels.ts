export interface Enrollment {
  id: number;
  course_id: number;
  user_id: number;
  total_lesson: number;
  last_access: any;
  price: any;
  rating: any;
  review: any;
  completed_at: any;
  createdAt: string;
  updatedAt: string;
  course: Course;
  enrollment_lessons: EnrollmentLesson[];
  user: User;
}

export interface EnrollmentLesson {
  id: number;
  enrollment_id: number;
  lesson_id: number;
  completed_at: Date;
}

export interface Course {
  id: number;
  category_id: number;
  name: string;
  description: string;
  status: number;
  price: number;
  discount: number;
  image: any;
  total_rating: number;
  createdAt: string;
  updatedAt: string;
  category: Category;
  sections: Section[];
  hasDiscount: boolean;
  enrollment_count: number;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
  courseCount: number;
}

export interface Section {
  id: number;
  course_id: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  lessons: Lesson[];
  save: boolean;
  newIdLesson: number;
}

export interface Lesson {
  id: number;
  section_id: number;
  title: string;
  content: string;
  is_quizz: boolean;
  video_url?: string;
  createdAt?: string;
  updatedAt?: string;
  questions: Question[];
  lesson_status?: string;
  save: boolean;
  newIdQuestion: number;
}

export interface Question {
  id: number;
  lesson_id: number;
  content: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
  answers: Answer[];
  save: boolean;
  newIdAnswer: number;
}

export interface Answer {
  id: number;
  question_id: number;
  content: string;
  is_correct: boolean;
  createdAt?: string;
  updatedAt?: string;
  save: boolean;
}

export interface User {
  id: number;
  username: string;
  fullname: string;
  avatar: string;
  role: number;
  email: string;
  totalCourses: number;
  phone?: string;
  birth?: any;
}

export interface Comment {
  id: number;
  course_id: number;
  user: User;
  content: string;
  parent_id: number;
  createdAt: string | Date;
  replies: Comment[];
}
