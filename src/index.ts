import debug from "debug";

import {
  RateLimitError,
  type RequestOptions,
  type Company,
  type Customer,
  type Provider,
  type Invoice,
  type Expense,
  type Document,
  type Transfer,
  type Tag,
  type ListCustomersParams,
  type ListProvidersParams,
  type ListInvoicesParams,
  type ListExpensesParams,
  type ListDocumentsParams,
  type ListTransfersParams,
  type Attachment,
} from "./types";

const log = debug("cuentica:api");
const logRequest = debug("cuentica:request");
const logError = debug("cuentica:error");

/**
 * Main client for interacting with the Cuéntica API.
 * @example
 * ```typescript
 * // Using token directly
 * const api = new CuenticaAPI('your-token-here');
 *
 * // Using environment variable
 * const api = new CuenticaAPI(); // Will use CUENTICA_TOKEN env variable
 *
 * // Get company info
 * const company = await api.getCompany();
 *
 * // List invoices for a date range
 * const invoices = await api.getInvoices({
 *   initial_date: '2024-01-01',
 *   end_date: '2024-12-31'
 * });
 * ```
 */
export class CuenticaAPI {
  private token: string;
  private baseUrl: string;

  /**
   * Creates a new instance of the Cuéntica API client.
   * @param token - Optional API token. If not provided, it will try to use CUENTICA_TOKEN environment variable
   * @param baseUrl - Optional base URL for the API (defaults to https://api.cuentica.com)
   * @throws {Error} When no token is provided and CUENTICA_TOKEN environment variable is not set
   */
  constructor(token?: string, baseUrl = "https://api.cuentica.com") {
    const authToken = token ?? process.env.CUENTICA_TOKEN;

    if (!authToken) {
      logError("No token provided");
      throw new Error(
        "API token is required. Either pass it to the constructor or set CUENTICA_TOKEN environment variable",
      );
    }

    log("Initializing Cuéntica API client");
    this.token = authToken;
    this.baseUrl = baseUrl;
  }

  /**
   * Makes a request to the Cuéntica API.
   * @internal
   */
  private async request<T>({
    method,
    path,
    body,
    query,
  }: RequestOptions): Promise<T> {
    const url = new URL(path, this.baseUrl);
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, value.toString());
        }
      });
    }

    const headers = new Headers({
      "X-AUTH-TOKEN": this.token,
      ...(body ? { "Content-Type": "application/json" } : {}),
    });

    logRequest(`${method} ${url.toString()}`);
    if (body) {
      logRequest("Request body:", body);
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (response.status === 429) {
      const resetTime = new Date(
        Number(response.headers.get("X-RateLimit-Reset")) * 1000,
      );
      logError(`Rate limit exceeded. Reset at ${resetTime.toISOString()}`);
      throw new RateLimitError(resetTime);
    }

    if (!response.ok) {
      const errorText = await response.text();
      logError(`HTTP ${response.status}: ${errorText}`);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    if (response.status === 204) {
      logRequest("Empty response (204)");
      return undefined as T;
    }

    const data = await response.json();
    logRequest("Response:", data);
    return data;
  }

  /**
   * Get company information.
   * @returns Company information
   * @throws {RateLimitError} When API rate limit is exceeded
   */
  async getCompany(): Promise<Company> {
    return this.request<Company>({ method: "GET", path: "/company" });
  }

  /**
   * List customers with optional filtering and pagination.
   * @param params - List parameters including pagination and search
   * @returns Array of customers
   * @throws {RateLimitError} When API rate limit is exceeded
   */
  async getCustomers(params: ListCustomersParams = {}): Promise<Customer[]> {
    const { page = 1, page_size = 100, q } = params;
    return this.request<Customer[]>({
      method: "GET",
      path: "/customer",
      query: { page, page_size, q },
    });
  }

  /**
   * Get a specific customer by ID.
   * @param id - Customer ID
   * @returns Customer information
   * @throws {RateLimitError} When API rate limit is exceeded
   */
  async getCustomer(id: number): Promise<Customer> {
    return this.request<Customer>({ method: "GET", path: `/customer/${id}` });
  }

  /**
   * Create a new customer.
   * @param customer - Customer data
   * @returns Created customer information
   * @throws {RateLimitError} When API rate limit is exceeded
   */
  async createCustomer(customer: Omit<Customer, "id">): Promise<Customer> {
    return this.request<Customer>({
      method: "POST",
      path: "/customer",
      body: customer,
    });
  }

  /**
   * Update an existing customer.
   * @param id - Customer ID
   * @param customer - Partial customer data to update
   * @returns Updated customer information
   * @throws {RateLimitError} When API rate limit is exceeded
   */
  async updateCustomer(
    id: number,
    customer: Partial<Customer>,
  ): Promise<Customer> {
    return this.request<Customer>({
      method: "PUT",
      path: `/customer/${id}`,
      body: customer,
    });
  }

  /**
   * Delete a customer.
   * @param id - Customer ID
   * @throws {RateLimitError} When API rate limit is exceeded
   */
  async deleteCustomer(id: number): Promise<void> {
    return this.request<void>({ method: "DELETE", path: `/customer/${id}` });
  }

  /**
   * List providers with optional filtering and pagination.
   * @param params - List parameters including pagination and search
   * @returns Array of providers
   * @throws {RateLimitError} When API rate limit is exceeded
   */
  async getProviders(params: ListProvidersParams = {}): Promise<Provider[]> {
    const { page = 1, page_size = 100, q } = params;
    return this.request<Provider[]>({
      method: "GET",
      path: "/provider",
      query: { page, page_size, q },
    });
  }

  /**
   * Get a specific provider by ID.
   * @param id - Provider ID
   * @returns Provider information
   * @throws {RateLimitError} When API rate limit is exceeded
   */
  async getProvider(id: number): Promise<Provider> {
    return this.request<Provider>({ method: "GET", path: `/provider/${id}` });
  }

  /**
   * Create a new provider.
   * @param provider - Provider data
   * @returns Created provider information
   * @throws {RateLimitError} When API rate limit is exceeded
   */
  async createProvider(provider: Omit<Provider, "id">): Promise<Provider> {
    return this.request<Provider>({
      method: "POST",
      path: "/provider",
      body: provider,
    });
  }

  /**
   * Update an existing provider.
   * @param id - Provider ID
   * @param provider - Partial provider data to update
   * @returns Updated provider information
   * @throws {RateLimitError} When API rate limit is exceeded
   */
  async updateProvider(
    id: number,
    provider: Partial<Provider>,
  ): Promise<Provider> {
    return this.request<Provider>({
      method: "PUT",
      path: `/provider/${id}`,
      body: provider,
    });
  }

  /**
   * Delete a provider.
   * @param id - Provider ID
   * @throws {RateLimitError} When API rate limit is exceeded
   */
  async deleteProvider(id: number): Promise<void> {
    return this.request<void>({ method: "DELETE", path: `/provider/${id}` });
  }

  /**
   * List invoices with optional filtering and pagination.
   * @param params - List parameters including date range, customer, and tags
   * @returns Array of invoices
   * @throws {RateLimitError} When API rate limit is exceeded
   */
  async getInvoices(params: ListInvoicesParams = {}): Promise<Invoice[]> {
    const { tags, ...rest } = params;
    const query = {
      ...rest,
      tags: tags?.join(","),
    };

    return this.request<Invoice[]>({ method: "GET", path: "/invoice", query });
  }

  /**
   * Get a specific invoice by ID.
   * @param id - Invoice ID
   * @returns Invoice information
   * @throws {RateLimitError} When API rate limit is exceeded
   */
  async getInvoice(id: number): Promise<Invoice> {
    return this.request<Invoice>({ method: "GET", path: `/invoice/${id}` });
  }

  /**
   * Create a new invoice.
   * @param invoice - Invoice data
   * @returns Created invoice information
   * @throws {RateLimitError} When API rate limit is exceeded
   */
  async createInvoice(invoice: Omit<Invoice, "id">): Promise<Invoice> {
    return this.request<Invoice>({
      method: "POST",
      path: "/invoice",
      body: invoice,
    });
  }

  /**
   * Update an existing invoice.
   * @param id - Invoice ID
   * @param invoice - Partial invoice data to update
   * @returns Updated invoice information
   * @throws {RateLimitError} When API rate limit is exceeded
   */
  async updateInvoice(id: number, invoice: Partial<Invoice>): Promise<Invoice> {
    return this.request<Invoice>({
      method: "PUT",
      path: `/invoice/${id}`,
      body: invoice,
    });
  }

  /**
   * Delete an invoice.
   * @param id - Invoice ID
   * @throws {RateLimitError} When API rate limit is exceeded
   */
  async deleteInvoice(id: number): Promise<void> {
    return this.request<void>({ method: "DELETE", path: `/invoice/${id}` });
  }

  /**
   * Get the PDF file for an invoice.
   * @param id - Invoice ID
   * @returns PDF file as a Blob
   * @throws {RateLimitError} When API rate limit is exceeded
   */
  async getInvoicePdf(id: number): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/invoice/${id}/pdf`, {
      headers: { "X-AUTH-TOKEN": this.token },
    });
    if (!response.ok)
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    return response.blob();
  }

  /**
   * List expenses with optional filtering and pagination.
   * @param params - List parameters including date range, provider, and tags
   * @returns Array of expenses
   * @throws {RateLimitError} When API rate limit is exceeded
   */
  async getExpenses(params: ListExpensesParams = {}): Promise<Expense[]> {
    const { tags, ...rest } = params;
    const query = {
      ...rest,
      tags: tags?.join(","),
    };

    return this.request<Expense[]>({ method: "GET", path: "/expense", query });
  }

  /**
   * Get a specific expense by ID.
   * @param id - Expense ID
   * @returns Expense information
   * @throws {RateLimitError} When API rate limit is exceeded
   */
  async getExpense(id: number): Promise<Expense> {
    return this.request<Expense>({ method: "GET", path: `/expense/${id}` });
  }

  /**
   * Create a new expense.
   * @param expense - Expense data
   * @returns Created expense information
   * @throws {RateLimitError} When API rate limit is exceeded
   */
  async createExpense(expense: Omit<Expense, "id">): Promise<Expense> {
    return this.request<Expense>({
      method: "POST",
      path: "/expense",
      body: expense,
    });
  }

  /**
   * Update an existing expense.
   * @param id - Expense ID
   * @param expense - Partial expense data to update
   * @returns Updated expense information
   * @throws {RateLimitError} When API rate limit is exceeded
   */
  async updateExpense(id: number, expense: Partial<Expense>): Promise<Expense> {
    return this.request<Expense>({
      method: "PUT",
      path: `/expense/${id}`,
      body: expense,
    });
  }

  /**
   * Delete an expense.
   * @param id - Expense ID
   * @throws {RateLimitError} When API rate limit is exceeded
   */
  async deleteExpense(id: number): Promise<void> {
    return this.request<void>({ method: "DELETE", path: `/expense/${id}` });
  }

  /**
   * List documents with optional filtering and pagination.
   * @param params - List parameters including date range and filters
   * @returns Array of documents
   * @throws {RateLimitError} When API rate limit is exceeded
   */
  async getDocuments(params: ListDocumentsParams = {}): Promise<Document[]> {
    return this.request<Document[]>({
      method: "GET",
      path: "/document",
      query: params as Record<string, string | number | boolean | undefined>,
    });
  }

  /**
   * Get a specific document by ID.
   * @param id - Document ID
   * @returns Document information
   * @throws {RateLimitError} When API rate limit is exceeded
   */
  async getDocument(id: number): Promise<Document> {
    return this.request<Document>({ method: "GET", path: `/document/${id}` });
  }

  /**
   * Create a new document.
   * @param document - Document data including optional attachment
   * @returns Created document information
   * @throws {RateLimitError} When API rate limit is exceeded
   */
  async createDocument(document: {
    attachment?: Attachment;
    date?: string;
    expense_id?: number;
  }): Promise<Document> {
    return this.request<Document>({
      method: "POST",
      path: "/document",
      body: document,
    });
  }

  /**
   * Update an existing document.
   * @param id - Document ID
   * @param document - Document data to update
   * @returns Updated document information
   * @throws {RateLimitError} When API rate limit is exceeded
   */
  async updateDocument(
    id: number,
    document: {
      attachment?: Attachment;
      date?: string;
      expense_id?: number;
    },
  ): Promise<Document> {
    return this.request<Document>({
      method: "PUT",
      path: `/document/${id}`,
      body: document,
    });
  }

  /**
   * Delete a document.
   * @param id - Document ID
   * @throws {RateLimitError} When API rate limit is exceeded
   */
  async deleteDocument(id: number): Promise<void> {
    return this.request<void>({ method: "DELETE", path: `/document/${id}` });
  }

  /**
   * List transfers with optional filtering and pagination.
   * @param params - List parameters including date range and accounts
   * @returns Array of transfers
   * @throws {RateLimitError} When API rate limit is exceeded
   */
  async getTransfers(params: ListTransfersParams = {}): Promise<Transfer[]> {
    return this.request<Transfer[]>({
      method: "GET",
      path: "/transfer",
      query: params as Record<string, string | number | boolean | undefined>,
    });
  }

  /**
   * Get a specific transfer by ID.
   * @param id - Transfer ID
   * @returns Transfer information
   * @throws {RateLimitError} When API rate limit is exceeded
   */
  async getTransfer(id: number): Promise<Transfer> {
    return this.request<Transfer>({ method: "GET", path: `/transfer/${id}` });
  }

  /**
   * Create a new transfer between accounts.
   * @param transfer - Transfer data including amount and accounts
   * @returns Created transfer information
   * @throws {RateLimitError} When API rate limit is exceeded
   * @example
   * ```typescript
   * const transfer = await api.createTransfer({
   *   amount: 1000,
   *   date: '2024-01-15',
   *   origin_account: 123,
   *   destination_account: 456,
   *   payment_method: 'wire_transfer'
   * });
   * ```
   */
  async createTransfer(transfer: Omit<Transfer, "id">): Promise<Transfer> {
    return this.request<Transfer>({
      method: "POST",
      path: "/transfer",
      body: transfer,
    });
  }

  /**
   * Update an existing transfer.
   * @param id - Transfer ID
   * @param transfer - Partial transfer data to update
   * @returns Updated transfer information
   * @throws {RateLimitError} When API rate limit is exceeded
   */
  async updateTransfer(
    id: number,
    transfer: Partial<Transfer>,
  ): Promise<Transfer> {
    return this.request<Transfer>({
      method: "PUT",
      path: `/transfer/${id}`,
      body: transfer,
    });
  }

  /**
   * Delete a transfer.
   * @param id - Transfer ID
   * @throws {RateLimitError} When API rate limit is exceeded
   */
  async deleteTransfer(id: number): Promise<void> {
    return this.request<void>({ method: "DELETE", path: `/transfer/${id}` });
  }

  /**
   * Get all available tags that can be used to categorize entries.
   * @returns Array of tags
   * @throws {RateLimitError} When API rate limit is exceeded
   */
  async getTags(): Promise<Tag[]> {
    return this.request<Tag[]>({ method: "GET", path: "/tag" });
  }
}

export * from "./types";
