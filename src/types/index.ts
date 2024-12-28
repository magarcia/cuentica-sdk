import type { components } from "./schema";

export type Company = components["schemas"]["Company"];
export type Customer = components["schemas"]["Customer"];
export type Provider = components["schemas"]["Provider"];
export type Invoice = components["schemas"]["Invoice"];
export type Income = components["schemas"]["Income"];
export type Expense = components["schemas"]["Expense"];
export type Transfer = components["schemas"]["Transfer"];
export type Document = components["schemas"]["Document"];
export type Tag = components["schemas"]["Tag"];
export type Attachment = components["schemas"]["Attachment"];

export interface RequestOptions {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
}

export class RateLimitError extends Error {
  resetTime: Date;

  constructor(resetTime: Date) {
    super(`Rate limit exceeded. Reset at ${resetTime.toISOString()}`);
    this.name = "RateLimitError";
    this.resetTime = resetTime;
  }
}

export interface ListParams {
  page?: number;
  page_size?: number;
}

export interface ListCustomersParams extends ListParams {
  q?: string;
}

export interface ListProvidersParams extends ListParams {
  q?: string;
}

export interface ListInvoicesParams extends ListParams {
  customer?: number;
  min_total_limit?: number;
  max_total_limit?: number;
  initial_date?: string;
  end_date?: string;
  serie?: string;
  description?: string;
  issued?: boolean;
  sort?: string;
  tags?: string[];
}

export interface ListExpensesParams extends ListParams {
  provider?: number;
  min_total_limit?: number;
  max_total_limit?: number;
  initial_date?: string;
  end_date?: string;
  expense_type?: string;
  investment_type?: string;
  draft?: boolean;
  sort?: string;
  tags?: string[];
}

export interface ListDocumentsParams extends ListParams {
  sort?: string;
  initial_date?: string;
  end_date?: string;
  keyword?: string;
  assigned?: boolean;
  extension?: string;
  hash?: string;
}

export interface ListTransfersParams extends ListParams {
  origin_account?: number;
  destination_account?: number;
  payment_method?: "cash" | "wire_transfer" | "promissory_note";
  sort?: "asc" | "desc";
  min_total_limit?: number;
  max_total_limit?: number;
  initial_date?: string;
  end_date?: string;
}
