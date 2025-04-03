export interface Course {
  id: number;
  category_id: number;
  name: string;
  description: string;
  status: number;
  price: number;
  discount: number;
  image: string;
  total_rating: number;
  enrollment_count: number;
  category: {
    id: number;
    name: string;
  };
}

export interface User {
  id: number;
  fullname: string;
  username: string;
  avatar: string;
}

export interface Enrollment {
  id: number;
  course_id: number;
  user_id: number;
  rating?: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
  user: User;
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
  createdAt: string;
  updatedAt: string;
} 