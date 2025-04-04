export interface Enrollment {
  id: number;
  course_id: number;
  user_id: number;
  total_lesson: number;
  complete_lesson: number;
  last_access: any;
  price: any;
  rating: any;
  review: any;
  completed_at: any;
  createdAt: string;
  updatedAt: string;
  course: Course;
  enrollment_lessons: EnrollmentLesson[];
}

export interface EnrollmentLesson {
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
}

export interface Category {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: number;
  course_id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: number;
  section_id: number;
  title: string;
  content: string;
  is_quizz: boolean;
  duration: string;
  video_url: string;
  createdAt: string;
  updatedAt: string;
  //
  lesson_status: string;
}
