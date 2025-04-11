export interface UserHeader {
  fullname: string;
}
export interface ContinueCourse {
  enrollmentId: number;
  courseId: number;
  categoryId: number;
  name: string;
  description: string;
  progress: number;
  image: string;
  last_accessed: string;
}

export interface CourseCard {
  courseId: number;
  categoryId: number;
  name: string;
  description: string;
  categoryName: string;
  price: number;
  discount: number;
  image: string;
  rating: number;
}

export interface CategoryItem {
  id: number;
  name: string;
}

export interface MyProgressCourse {
  enrollmentId: number;
  courseId: number;
  categoryId: number;
  name: string;
  categoryName: string;
  description: string;
  progress: number;
  total_lesson: number;
  total_lesson_completed: number;
  image: string;
  last_accessed: string;
}
export interface MyCompletedCourse {
  enrollmentId: number;
  courseId: number;
  categoryId: number;
  name: string;
  categoryName: string;
  description: string;
  image: string;
  rating: number;
  completed_at: string;
}

export interface UserComment {
  id: number;
  user_id: number;
  course_id: number;
  content: string;
  parent_id: number;
  createdAt: string;
  fullname: string;
  avatar: string;
  role: number;
  replies: UserComment[];
}

export interface ResultCourse {
  courseId: number;
  categoryId: number;
  name: string;
  description: string;
  categoryName: string;
  price: number;
  discount: number;
  image: string;
  rating: number;
}
