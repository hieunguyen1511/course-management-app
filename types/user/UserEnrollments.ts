
export interface UserEnrollments {
  id: number;
  user_id: number;
  course_id: number;
  total_lesson: number;
  complete_lesson: number;
  progress: number;
  image: string;
  createdAt: string;
  updatedAt: string;
  course: {
    id: number;
    name: string;
    description: string;
    status: number;
    price: number;
    discount: number;
  };
}
