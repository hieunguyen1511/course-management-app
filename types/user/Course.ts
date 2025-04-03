export interface Course {
  id: number;
  name: string;
  description: string;
  status: number;
  price: number;
  discount: number;
  category_id: number;
  total_rating: number;
  enrollment_count: number;
  image: string;
  category: {
    id: number;
    name: string;
  };
}
