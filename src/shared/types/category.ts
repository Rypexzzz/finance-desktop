export type CategoryType = "expense" | "income" | "service";

export type Category = {
  id: number;
  code: string;
  nameRu: string;
  type: CategoryType;
  iconName: string;
  color: string;
  isService: boolean;
  sortOrder: number;
  isActive: boolean;
};