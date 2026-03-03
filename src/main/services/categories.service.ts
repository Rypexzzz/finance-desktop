import { listCategories } from "../db/queries/categories.repo";
import type { CategoryType } from "../../shared/types/category";

export function getCategories(params?: { type?: CategoryType }) {
  return listCategories(params?.type);
}