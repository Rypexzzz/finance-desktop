import { electronApi } from "../../lib/electron-api";
import type { CategoryType } from "../../../shared/types/category";

export async function listCategories(params?: { type?: CategoryType }) {
  const res = await electronApi.categories.list(params);
  if (!res.ok) throw new Error(res.error.message);
  return res.data;
}