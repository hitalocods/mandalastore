export type Category = {
  id: string;
  name: string;
  parent_id: string | null;
  slug: string | null;
  sort_order: number;
  image_url?: string | null;
  /** Se a categoria aparece na faixa "ITENS" da página inicial */
  show_in_gallery?: boolean;
  created_at: string;
};

export type CategoryWithChildren = Category & {
  children: CategoryWithChildren[];
};
