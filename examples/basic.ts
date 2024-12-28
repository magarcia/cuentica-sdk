import { CuenticaAPI, RateLimitError } from "cuentica-sdk";

// Initialize the client
const api = new CuenticaAPI(process.env.CUENTICA_TOKEN);

// Basic usage
async function main() {
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
      console.log("Rate limit exceeded, retry after:", error.message);
    } else {
      console.error("Error:", error);
    }
  }
}

main();
