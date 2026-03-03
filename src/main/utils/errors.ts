import type { ApiResult, AppErrorCode } from "../../shared/contracts/result";

export function ok<T>(data: T): ApiResult<T> {
  return { ok: true, data };
}

export function fail<T = never>(
  code: AppErrorCode,
  message: string
): ApiResult<T> {
  return { ok: false, error: { code, message } };
}

export function toUnknownError<T = never>(error: unknown): ApiResult<T> {
  console.error(error);
  return fail("UNKNOWN_ERROR", "Произошла непредвиденная ошибка");
}