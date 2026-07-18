export type Category = {
  id: string;
  name: string;
  parent_id: string | null;
  slug: string | null;
  sort_order: number;
  created_at: string;
};

export type CategoryWithChildren = Category & {
  children: Category[];
};
