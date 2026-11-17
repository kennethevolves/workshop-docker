export type Category = 'LAPTOPS' | 'COMPONENTS' | 'PERIPHERALS' | 'MONITORS';

export type Product = {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: Category;
  price: number;
  stock: number;
  image: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type User = {
  id: number;
  email: string;
  name: string;
};

export type Health = {
  status: string;
  database: string;
  container: string;
};
