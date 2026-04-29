"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export interface UseUrlPaginationOptions {
  basePath: string;
  defaultLimit?: number;
  defaultSort?: string;
  paramName?: string;
}

export interface UseUrlPaginationResult {
  currentPage: number;
  apiParams: Record<string, unknown>;
  handlePageChange: (page: number) => void;
}

/**
 * URL-synced pagination — reads the `?page=N` query param so navigating
 * with the browser's back/forward buttons restores list scroll position.
 *
 *   const { currentPage, apiParams, handlePageChange } = useUrlPagination({
 *     basePath: "/shooters",
 *     defaultLimit: 25,
 *     defaultSort: "-createdAt",
 *   });
 */
export function useUrlPagination(
  opts: UseUrlPaginationOptions,
): UseUrlPaginationResult {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const paramName = opts.paramName ?? "page";

  const currentPage = Math.max(1, Number(params.get(paramName) ?? "1") || 1);

  const apiParams = useMemo<Record<string, unknown>>(() => {
    const out: Record<string, unknown> = {
      page: currentPage,
      limit: opts.defaultLimit ?? 25,
    };
    if (opts.defaultSort) out.sort = opts.defaultSort;
    return out;
  }, [currentPage, opts.defaultLimit, opts.defaultSort]);

  const handlePageChange = useCallback(
    (next: number) => {
      const url = new URLSearchParams(params.toString());
      if (next <= 1) url.delete(paramName);
      else url.set(paramName, String(next));
      const qs = url.toString();
      router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [router, pathname, params, paramName],
  );

  return { currentPage, apiParams, handlePageChange };
}
