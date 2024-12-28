import { CuenticaAPI, Expense, Invoice, RateLimitError } from "./index";

// Mock the global fetch function
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock environment variable
process.env.CUENTICA_TOKEN = "test-token";

describe("CuenticaAPI", () => {
  let api: CuenticaAPI;

  beforeEach(() => {
    api = new CuenticaAPI("test-token");
    mockFetch.mockClear();
  });

  describe("constructor", () => {
    it("should initialize with provided token", () => {
      const api = new CuenticaAPI("custom-token");
      expect(api["token"]).toBe("custom-token");
    });

    it("should use environment variable if no token provided", () => {
      const api = new CuenticaAPI();
      expect(api["token"]).toBe("test-token");
    });

    it("should throw error if no token available", () => {
      const originalToken = process.env.CUENTICA_TOKEN;
      delete process.env.CUENTICA_TOKEN;

      expect(() => new CuenticaAPI()).toThrow("API token is required");

      process.env.CUENTICA_TOKEN = originalToken;
    });
  });

  describe("request handling", () => {
    it("should handle rate limit errors", async () => {
      const resetTime = new Date();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: new Headers({
          "X-RateLimit-Reset": (resetTime.getTime() / 1000).toString(),
        }),
      });

      const promise = api.getCompany();
      await expect(promise).rejects.toThrow(RateLimitError);
      await expect(promise).rejects.toMatchObject({
        resetTime: resetTime,
      });
    });

    it("should handle general HTTP errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve("Internal Server Error"),
      });

      await expect(api.getCompany()).rejects.toThrow("HTTP 500");
    });

    it("should handle 204 responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const result = await api.deleteCustomer(1);
      expect(result).toBeUndefined();
    });

    it("should handle empty response content type", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: () => Promise.reject(new Error("Invalid JSON")),
      });

      await expect(api.getCompany()).rejects.toThrow("Invalid JSON");
    });
  });

  describe("company endpoints", () => {
    it("should get company information", async () => {
      const mockCompany = { id: 1, name: "Test Company" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCompany),
      });

      const result = await api.getCompany();
      expect(result).toEqual(mockCompany);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cuentica.com/company",
        expect.objectContaining({
          method: "GET",
          headers: expect.any(Headers),
        }),
      );
    });
  });

  describe("customer endpoints", () => {
    const mockCustomer = { id: 1, name: "Test Customer" };

    it("should list customers with pagination", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockCustomer]),
      });

      const result = await api.getCustomers({ page: 2, page_size: 50 });
      expect(result).toEqual([mockCustomer]);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cuentica.com/customer?page=2&page_size=50",
        expect.any(Object),
      );
    });

    it("should list customers without optional parameters", async () => {
      const mockCustomer = { id: 1, name: "Test Customer" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockCustomer]),
      });

      const result = await api.getCustomers();
      expect(result).toEqual([mockCustomer]);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cuentica.com/customer?page=1&page_size=100",
        expect.any(Object),
      );
    });

    it("should get single customer", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCustomer),
      });

      const result = await api.getCustomer(1);
      expect(result).toEqual(mockCustomer);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cuentica.com/customer/1",
        expect.any(Object),
      );
    });

    it("should create customer", async () => {
      const newCustomer = { name: "New Customer" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 1, ...newCustomer }),
      });

      const result = await api.createCustomer(newCustomer);
      expect(result).toEqual({ id: 1, ...newCustomer });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cuentica.com/customer",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(newCustomer),
        }),
      );
    });

    it("should update customer", async () => {
      const updateData = { name: "Updated Customer" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 1, ...updateData }),
      });

      const result = await api.updateCustomer(1, updateData);
      expect(result).toEqual({ id: 1, ...updateData });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cuentica.com/customer/1",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(updateData),
        }),
      );
    });

    it("should delete customer", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await api.deleteCustomer(1);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cuentica.com/customer/1",
        expect.objectContaining({
          method: "DELETE",
        }),
      );
    });
  });

  describe("invoice endpoints", () => {
    const mockInvoice = { id: 1, number: "INV-001", total: 100 };

    it("should get single invoice", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockInvoice),
      });

      const result = await api.getInvoice(1);
      expect(result).toEqual(mockInvoice);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cuentica.com/invoice/1",
        expect.any(Object),
      );
    });

    it("should create invoice", async () => {
      const newInvoice = { number: "INV-002", total: 200 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 2, ...newInvoice }),
      });

      const result = await api.createInvoice(newInvoice as unknown as Invoice);
      expect(result).toEqual({ id: 2, ...newInvoice });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cuentica.com/invoice",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(newInvoice),
        }),
      );
    });

    it("should update invoice", async () => {
      const updateData = { total: 150 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...mockInvoice, ...updateData }),
      });

      const result = await api.updateInvoice(1, updateData as Partial<Invoice>);
      expect(result).toEqual({ ...mockInvoice, ...updateData });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cuentica.com/invoice/1",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(updateData),
        }),
      );
    });

    it("should delete invoice", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await api.deleteInvoice(1);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cuentica.com/invoice/1",
        expect.objectContaining({
          method: "DELETE",
        }),
      );
    });

    it("should list invoices with filters", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockInvoice]),
      });

      const result = await api.getInvoices({
        initial_date: "2024-01-01",
        end_date: "2024-12-31",
        tags: ["tag1", "tag2"],
      });

      expect(result).toEqual([mockInvoice]);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("initial_date=2024-01-01"),
        expect.any(Object),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`tags=${encodeURIComponent("tag1,tag2")}`),
        expect.any(Object),
      );
    });

    it("should list invoices without optional parameters", async () => {
      const mockInvoice = { id: 1, number: "INV-001", total: 100 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockInvoice]),
      });

      const result = await api.getInvoices();
      expect(result).toEqual([mockInvoice]);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cuentica.com/invoice",
        expect.any(Object),
      );
    });

    it("should list invoices with empty tags array", async () => {
      const mockInvoice = { id: 1, number: "INV-001", total: 100 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockInvoice]),
      });

      const result = await api.getInvoices({ tags: [] });
      expect(result).toEqual([mockInvoice]);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cuentica.com/invoice?tags=",
        expect.any(Object),
      );
    });

    it("should get invoice PDF", async () => {
      const mockBlob = new Blob(["fake-pdf"], { type: "application/pdf" });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      });

      const result = await api.getInvoicePdf(1);
      expect(result).toEqual(mockBlob);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cuentica.com/invoice/1/pdf",
        expect.any(Object),
      );
    });

    it("should handle failed blob download for invoice PDF", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve("Error downloading PDF"),
      });

      await expect(api.getInvoicePdf(1)).rejects.toThrow(
        "HTTP 500: Error downloading PDF",
      );
    });
  });

  describe("transfer endpoints", () => {
    const mockTransfer = {
      id: 1,
      amount: 1000,
      date: "2024-01-15",
      origin_account: 123,
      destination_account: 456,
      payment_method: "wire_transfer" as const,
    };

    it("should get single transfer", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTransfer),
      });

      const result = await api.getTransfer(1);
      expect(result).toEqual(mockTransfer);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cuentica.com/transfer/1",
        expect.any(Object),
      );
    });

    it("should create transfer", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTransfer),
      });

      const newTransfer = {
        amount: 1000,
        date: "2024-01-15",
        origin_account: 123,
        destination_account: 456,
        payment_method: "wire_transfer" as const,
      };

      const result = await api.createTransfer(newTransfer);
      expect(result).toEqual(mockTransfer);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cuentica.com/transfer",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(newTransfer),
        }),
      );
    });

    it("should list transfers without optional parameters", async () => {
      const mockTransfer = { id: 1, amount: 100, date: "2024-01-01" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockTransfer]),
      });

      const result = await api.getTransfers();
      expect(result).toEqual([mockTransfer]);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cuentica.com/transfer",
        expect.any(Object),
      );
    });

    it("should update transfer", async () => {
      const updateData = { amount: 1500 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 1, ...updateData }),
      });

      const result = await api.updateTransfer(1, updateData);
      expect(result).toEqual({ id: 1, ...updateData });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cuentica.com/transfer/1",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(updateData),
        }),
      );
    });

    it("should delete transfer", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await api.deleteTransfer(1);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cuentica.com/transfer/1",
        expect.objectContaining({
          method: "DELETE",
        }),
      );
    });
  });

  describe("provider endpoints", () => {
    const mockProvider = {
      id: 1,
      name: "Test Provider",
      vat_number: "123456789",
    };

    it("should list providers with pagination", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockProvider]),
      });

      const result = await api.getProviders({
        page: 2,
        page_size: 50,
        q: "test",
      });
      expect(result).toEqual([mockProvider]);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cuentica.com/provider?page=2&page_size=50&q=test",
        expect.any(Object),
      );
    });

    it("should list providers without optional parameters", async () => {
      const mockProvider = { id: 1, name: "Test Provider" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockProvider]),
      });

      const result = await api.getProviders();
      expect(result).toEqual([mockProvider]);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cuentica.com/provider?page=1&page_size=100",
        expect.any(Object),
      );
    });

    it("should get single provider", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProvider),
      });

      const result = await api.getProvider(1);
      expect(result).toEqual(mockProvider);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cuentica.com/provider/1",
        expect.any(Object),
      );
    });

    it("should create provider", async () => {
      const newProvider = { name: "New Provider", vat_number: "987654321" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 1, ...newProvider }),
      });

      const result = await api.createProvider(newProvider);
      expect(result).toEqual({ id: 1, ...newProvider });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cuentica.com/provider",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(newProvider),
        }),
      );
    });

    it("should update provider", async () => {
      const updateData = { name: "Updated Provider" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...mockProvider, ...updateData }),
      });

      const result = await api.updateProvider(1, updateData);
      expect(result).toEqual({ ...mockProvider, ...updateData });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cuentica.com/provider/1",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(updateData),
        }),
      );
    });

    it("should delete provider", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await api.deleteProvider(1);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cuentica.com/provider/1",
        expect.objectContaining({
          method: "DELETE",
        }),
      );
    });
  });

  describe("expense endpoints", () => {
    const mockExpense = {
      id: 1,
      amount: 100.5,
      date: "2024-01-15",
      provider_id: 1,
      description: "Test Expense",
    };

    it("should list expenses with filters", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockExpense]),
      });

      const result = await api.getExpenses({
        initial_date: "2024-01-01",
        end_date: "2024-12-31",
        tags: ["expense", "test"],
      });

      expect(result).toEqual([mockExpense]);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("initial_date=2024-01-01"),
        expect.any(Object),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`tags=${encodeURIComponent("expense,test")}`),
        expect.any(Object),
      );
    });

    it("should list expenses without optional parameters", async () => {
      const mockExpense = { id: 1, amount: 100, date: "2024-01-01" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockExpense]),
      });

      const result = await api.getExpenses();
      expect(result).toEqual([mockExpense]);
    });

    it("should get single expense", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockExpense),
      });

      const result = await api.getExpense(1);
      expect(result).toEqual(mockExpense);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cuentica.com/expense/1",
        expect.any(Object),
      );
    });

    it("should create expense", async () => {
      const newExpense = {
        amount: 150.75,
        date: "2024-01-20",
        provider_id: 2,
        description: "New Expense",
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 2, ...newExpense }),
      });

      const result = await api.createExpense(newExpense);
      expect(result).toEqual({ id: 2, ...newExpense });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cuentica.com/expense",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(newExpense),
        }),
      );
    });

    it("should update expense", async () => {
      const updateData = { amount: 200.25 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...mockExpense, ...updateData }),
      });

      const result = await api.updateExpense(1, updateData as Partial<Expense>);
      expect(result).toEqual({ ...mockExpense, ...updateData });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cuentica.com/expense/1",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(updateData),
        }),
      );
    });

    it("should delete expense", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await api.deleteExpense(1);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cuentica.com/expense/1",
        expect.objectContaining({
          method: "DELETE",
        }),
      );
    });
  });

  describe("document endpoints", () => {
    const mockDocument = {
      id: 1,
      filename: "test.pdf",
      date: "2024-01-15",
      expense_id: 1,
    };

    it("should create document with attachment", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDocument),
      });

      const attachment = {
        filename: "test.pdf",
        content: "base64-content",
        mime_type: "application/pdf",
      };

      const result = await api.createDocument({
        attachment,
        date: "2024-01-15",
      });

      expect(result).toEqual(mockDocument);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cuentica.com/document",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            attachment,
            date: "2024-01-15",
          }),
        }),
      );
    });

    it("should list documents with filters", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockDocument]),
      });

      const result = await api.getDocuments({
        initial_date: "2024-01-01",
        end_date: "2024-12-31",
      });

      expect(result).toEqual([mockDocument]);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("initial_date=2024-01-01"),
        expect.any(Object),
      );
    });

    it("should list expenses without optional parameters", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockDocument]),
      });

      const result = await api.getDocuments();
      expect(result).toEqual([mockDocument]);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cuentica.com/document",
        expect.any(Object),
      );
    });

    it("should get single document", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDocument),
      });

      const result = await api.getDocument(1);
      expect(result).toEqual(mockDocument);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cuentica.com/document/1",
        expect.any(Object),
      );
    });

    it("should update document", async () => {
      const updateData = {
        date: "2024-01-20",
        expense_id: 2,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...mockDocument, ...updateData }),
      });

      const result = await api.updateDocument(1, updateData);
      expect(result).toEqual({ ...mockDocument, ...updateData });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cuentica.com/document/1",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(updateData),
        }),
      );
    });

    it("should delete document", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await api.deleteDocument(1);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cuentica.com/document/1",
        expect.objectContaining({
          method: "DELETE",
        }),
      );
    });
  });

  describe("tag endpoints", () => {
    it("should get all tags", async () => {
      const mockTags = [
        { id: 1, name: "Tag 1" },
        { id: 2, name: "Tag 2" },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTags),
      });

      const result = await api.getTags();
      expect(result).toEqual(mockTags);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.cuentica.com/tag",
        expect.objectContaining({
          method: "GET",
        }),
      );
    });
  });

  describe("request error handling", () => {
    it("should handle failed JSON parsing", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error("Invalid JSON")),
      });

      await expect(api.getCompany()).rejects.toThrow("Invalid JSON");
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));
      await expect(api.getCompany()).rejects.toThrow("Network error");
    });

    it("should handle empty response with invalid content type", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ "content-type": "text/plain" }),
        json: () => Promise.reject(new Error("Invalid JSON")),
      });

      await expect(api.getCompany()).rejects.toThrow();
    });
  });
});
