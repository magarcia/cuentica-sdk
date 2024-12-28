# Cuéntica SDK <!-- omit in toc -->

A TypeScript SDK for the [Cuéntica](https://cuentica.com/) API, providing easy access to accounting and tax management features for freelancers and small businesses. For detailed API documentation, visit the [Cuéntica API docs](https://apidocs.cuentica.com/).

## Table of Contents <!-- omit in toc -->

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
  - [Authentication](#authentication)
  - [Debug Logging](#debug-logging)
- [API Reference](#api-reference)
  - [Company Management](#company-management)
  - [Customer Management](#customer-management)
  - [Invoice Management](#invoice-management)
  - [Expense Management](#expense-management)
  - [Document Management](#document-management)
  - [Transfer Management](#transfer-management)
- [Error Handling](#error-handling)
  - [Rate Limiting](#rate-limiting)
- [TypeScript Support](#typescript-support)
- [Contributing](#contributing)
- [License](#license)

## Features

- Full TypeScript support with comprehensive type definitions
- Promise-based API with async/await
- Built-in rate limiting handling and error management
- Debug logging support for troubleshooting
- Support for all Cuéntica API endpoints
- Environment variable configuration support
- ESM and CommonJS support

## Installation

```bash
npm install cuentica
```

## Quick Start

```typescript
import { CuenticaAPI } from "cuentica";

// Initialize the client using token directly
const api = new CuenticaAPI("your-api-token");

// Or using environment variable
const apiWithEnv = new CuenticaAPI(); // Will use CUENTICA_TOKEN env variable

// Basic usage example
async function example() {
  try {
    // Get company info
    const company = await api.getCompany();
    console.log(company);

    // Get invoices for a date range
    const invoices = await api.getInvoices({
      initial_date: "2024-01-01",
      end_date: "2024-12-31",
      tags: ["important"],
    });
    console.log(invoices);
  } catch (error) {
    if (error instanceof RateLimitError) {
      console.log("Rate limit exceeded, retry after:", error.resetTime);
    } else {
      console.error("Error:", error);
    }
  }
}
```

## Configuration

### Authentication

The SDK supports two methods of authentication:

1. Direct token initialization:

```typescript
const api = new CuenticaAPI("your-api-token");
```

2. Environment variable:

```typescript
// Set CUENTICA_TOKEN environment variable
process.env.CUENTICA_TOKEN = "your-api-token";
const api = new CuenticaAPI();
```

### Debug Logging

The SDK uses the `debug` package for logging. Enable different logging levels by setting the DEBUG environment variable:

```bash
# Enable all logs
DEBUG=cuentica:* npm start

# Enable only request logs
DEBUG=cuentica:request npm start

# Enable only error logs
DEBUG=cuentica:error npm start
```

## API Reference

### Company Management

```typescript
// Get company information
const company = await api.getCompany();
```

### Customer Management

```typescript
// List customers with pagination and search
const customers = await api.getCustomers({
  page: 1,
  page_size: 100,
  q: "search term",
});

// Get a specific customer
const customer = await api.getCustomer(123);

// Create a new customer
const newCustomer = await api.createCustomer({
  name: "John",
  surname_1: "Doe",
  email: "john@example.com",
});

// Update a customer
await api.updateCustomer(123, {
  email: "newemail@example.com",
});

// Delete a customer
await api.deleteCustomer(123);
```

### Invoice Management

```typescript
// List invoices with filters
const invoices = await api.getInvoices({
  initial_date: "2024-01-01",
  end_date: "2024-12-31",
  tags: ["important"],
  customer: 123,
  min_total_limit: 1000,
});

// Get invoice PDF
const pdfBlob = await api.getInvoicePdf(456);
```

### Expense Management

```typescript
// List expenses with filters
const expenses = await api.getExpenses({
  initial_date: "2024-01-01",
  end_date: "2024-12-31",
  provider: 789,
  draft: false,
});

// Create a new expense with multiple lines
const newExpense = await api.createExpense({
  provider: 789,
  date: "2024-01-15",
  document_type: "invoice",
  expense_lines: [
    {
      description: "Office supplies",
      base: 100,
      tax: 21,
    },
    {
      description: "Software license",
      base: 50,
      tax: 21,
    },
  ],
});
```

### Document Management

```typescript
// List documents with filters
const documents = await api.getDocuments({
  initial_date: "2024-01-01",
  end_date: "2024-12-31",
  assigned: true,
});

// Upload a document with attachment
const newDocument = await api.createDocument({
  date: "2024-01-15",
  attachment: {
    filename: "invoice.pdf",
    data: "base64-encoded-content",
  },
});
```

### Transfer Management

```typescript
// List transfers with filters
const transfers = await api.getTransfers({
  initial_date: "2024-01-01",
  end_date: "2024-12-31",
  payment_method: "wire_transfer",
});

// Create a bank transfer
const newTransfer = await api.createTransfer({
  amount: 1000,
  date: "2024-01-15",
  origin_account: 123,
  destination_account: 456,
  payment_method: "wire_transfer",
});
```

## Error Handling

The SDK provides detailed error handling:

```typescript
try {
  await api.getInvoices();
} catch (error) {
  if (error instanceof RateLimitError) {
    // Rate limit exceeded - error.resetTime contains the time when the limit will reset
    console.log(
      "Rate limit exceeded, retry after:",
      error.resetTime.toISOString()
    );
  } else {
    // Handle other API errors
    console.error("API error:", error.message);
  }
}
```

### Rate Limiting

The API has the following rate limits:

- 600 requests per 5 minutes
- 7200 requests per day

When these limits are exceeded, the SDK throws a `RateLimitError` with the reset time.

## TypeScript Support

The SDK includes comprehensive TypeScript definitions for all API endpoints and data structures:

```typescript
import type {
  Invoice,
  Customer,
  ListInvoicesParams,
  RateLimitError,
} from "cuentica";

// Parameters are fully typed
const params: ListInvoicesParams = {
  initial_date: "2024-01-01",
  tags: ["important"],
  customer: 123,
};
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. When contributing, please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License. See LICENSE for details.
