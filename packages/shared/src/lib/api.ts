import axios from "axios";
import { apiClient } from "../api/client";

interface ApiResponse<T = unknown> {
  data: T;
  success?: boolean;
  error?: {
    code?: string;
    message?: string;
    details?: Record<string, unknown>;
  };
  pagination?: {
    total: number;
    page: number;
    limit: number;
    total_pages?: number;
    totalPages?: number;
  };
}

interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  retries?: number;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface FabWashGstInvoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  status: string;
  seller: GstInvoiceParty;
  buyer: GstInvoiceParty;
  place_of_supply: string;
  place_of_supply_code: string;
  supply_type: string;
  reverse_charge: string;
  line_items: GstInvoiceLineItem[];
  taxable_value: string;
  cgst_amount: string;
  sgst_amount: string;
  igst_amount: string;
  total_gst: string;
  invoice_total: string;
  reference?: string | null;
  notes?: string | null;
}

export interface GstInvoiceParty {
  name: string;
  address: string;
  gstin: string;
  state: string;
  state_code: string;
  email?: string | null;
  phone?: string | null;
}

export interface GstInvoiceLineItem {
  description: string;
  sac: string;
  quantity: string;
  unit: string;
  rate: string;
  gst_rate: string;
  taxable_value: string;
  cgst_amount: string;
  sgst_amount: string;
  igst_amount: string;
}

export interface CreateFabWashGstInvoice {
  invoice_date: string;
  due_date: string;
  seller: GstInvoiceParty;
  buyer: GstInvoiceParty;
  place_of_supply: string;
  place_of_supply_code: string;
  reverse_charge?: boolean;
  line_items: Array<{
    description: string;
    sac: string;
    quantity: number;
    unit: string;
    rate: number;
    gst_rate: number;
  }>;
  reference?: string;
  notes?: string;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 500,
): Promise<T> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.statusCode >= 400 &&
        error.statusCode < 500 &&
        error.statusCode !== 408 &&
        error.statusCode !== 429
      ) {
        throw error;
      }
      if (attempt >= maxRetries) throw error;
      await new Promise((resolve) =>
        setTimeout(resolve, initialDelayMs * 2 ** attempt),
      );
    }
  }
}

async function makeRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  const { method = "GET", headers, body, params, retries = 2 } = options;
  const request = () =>
    apiClient.request<ApiResponse<T>>({
      url: `/api/v1${endpoint}`,
      method,
      headers,
      data: body,
      params,
    });

  try {
    return method === "GET"
      ? await retryWithBackoff(request, retries)
      : await request();
  } catch (error) {
    if (!axios.isAxiosError(error)) throw error;

    const responseBody = error.response?.data;
    const bodyRecord =
      typeof responseBody === "object" && responseBody !== null
        ? (responseBody as Record<string, unknown>)
        : {};
    const nestedError =
      typeof bodyRecord.error === "object" && bodyRecord.error !== null
        ? (bodyRecord.error as Record<string, unknown>)
        : {};
    const message =
      (typeof bodyRecord.detail === "string" && bodyRecord.detail) ||
      (typeof nestedError.message === "string" && nestedError.message) ||
      error.message;

    throw new ApiError(
      error.response?.status ?? 0,
      typeof nestedError.code === "string"
        ? nestedError.code
        : "API_REQUEST_FAILED",
      message,
      typeof nestedError.details === "object" && nestedError.details !== null
        ? Object.fromEntries(
            Object.entries(nestedError.details).filter(
              (entry): entry is [string, string] =>
                typeof entry[1] === "string",
            ),
          )
        : undefined,
    );
  }
}

export const api = {
  fabwashInvoices: {
    list: () =>
      makeRequest<FabWashGstInvoice[]>("/fabwash/invoices"),
    create: (data: CreateFabWashGstInvoice) =>
      makeRequest<FabWashGstInvoice>("/fabwash/invoices", {
        method: "POST",
        body: data,
      }),
    get: (id: string) =>
      makeRequest<FabWashGstInvoice>(
        `/fabwash/invoices/${encodeURIComponent(id)}`,
      ),
  },
  fabricBatches: {
    list: (page = 1, limit = 10, search = "") =>
      makeRequest("/fabric-batches", { params: { page, limit, search } }),
    get: (id: string) =>
      makeRequest(`/fabric-batches/${encodeURIComponent(id)}`),
    create: (data: unknown) =>
      makeRequest("/fabric-batches", { method: "POST", body: data }),
    update: (id: string, data: unknown) =>
      makeRequest(`/fabric-batches/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: data,
      }),
    delete: (id: string) =>
      makeRequest(`/fabric-batches/${encodeURIComponent(id)}`, {
        method: "DELETE",
      }),
  },
  processes: {
    list: (page = 1, limit = 10, status = "") =>
      makeRequest("/processes", { params: { page, limit, status } }),
    get: (id: string) => makeRequest(`/processes/${encodeURIComponent(id)}`),
    create: (data: unknown) =>
      makeRequest("/processes", { method: "POST", body: data }),
    update: (id: string, data: unknown) =>
      makeRequest(`/processes/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: data,
      }),
    delete: (id: string) =>
      makeRequest(`/processes/${encodeURIComponent(id)}`, { method: "DELETE" }),
  },
  customers: {
    list: (page = 1, limit = 10, status = "") =>
      makeRequest("/customers", { params: { page, limit, status } }),
    get: (id: string) => makeRequest(`/customers/${encodeURIComponent(id)}`),
    create: (data: unknown) =>
      makeRequest("/customers", { method: "POST", body: data }),
    update: (id: string, data: unknown) =>
      makeRequest(`/customers/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: data,
      }),
    delete: (id: string) =>
      makeRequest(`/customers/${encodeURIComponent(id)}`, { method: "DELETE" }),
  },
  invoices: {
    list: (page = 1, limit = 10, status = "") =>
      makeRequest("/invoices", { params: { page, limit, status } }),
    get: (id: string) => makeRequest(`/invoices/${encodeURIComponent(id)}`),
    create: (data: unknown) =>
      makeRequest("/invoices", { method: "POST", body: data }),
    update: (id: string, data: unknown) =>
      makeRequest(`/invoices/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: data,
      }),
    delete: (id: string) =>
      makeRequest(`/invoices/${encodeURIComponent(id)}`, { method: "DELETE" }),
  },
  reports: {
    metrics: (timeRange = "month") =>
      makeRequest("/reports/metrics", { params: { time_range: timeRange } }),
    trends: (timeRange = "month") =>
      makeRequest("/reports/trends", { params: { time_range: timeRange } }),
    export: (format = "pdf") =>
      makeRequest("/reports/export", { method: "POST", body: { format } }),
  },
};

export type { ApiResponse, ApiRequestOptions };
