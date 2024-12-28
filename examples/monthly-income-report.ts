import { CuenticaAPI, type Invoice } from "cuentica-sdk";

async function generateMonthlyIncomeReport(api: CuenticaAPI, month: string) {
  // Get current and previous month dates
  const currentDate = new Date(month);
  const previousDate = new Date(currentDate);
  previousDate.setMonth(previousDate.getMonth() - 1);

  // Format dates for API
  const currentMonth = {
    initial_date: `${month}-01`,
    end_date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0],
  };

  const previousMonth = {
    initial_date:
      previousDate.toISOString().split("T")[0].substring(0, 7) + "-01",
    end_date: new Date(
      previousDate.getFullYear(),
      previousDate.getMonth() + 1,
      0
    )
      .toISOString()
      .split("T")[0],
  };

  // Fetch invoices for both months
  const [currentInvoices, previousInvoices] = await Promise.all([
    api.getInvoices(currentMonth),
    api.getInvoices(previousMonth),
  ]);

  // Calculate totals
  const calculateTotals = (invoices: Invoice[]) => {
    return invoices.reduce(
      (acc, inv) => {
        const total = inv.invoice_lines.reduce(
          (sum, line) => {
            const lineTotal = line.amount * line.quantity;
            const tax = (lineTotal * line.tax) / 100;
            return {
              net: sum.net + lineTotal,
              tax: sum.tax + tax,
              total: sum.total + lineTotal + tax,
            };
          },
          { net: 0, tax: 0, total: 0 }
        );
        return {
          net: acc.net + total.net,
          tax: acc.tax + total.tax,
          total: acc.total + total.total,
        };
      },
      { net: 0, tax: 0, total: 0 }
    );
  };

  const currentTotals = calculateTotals(currentInvoices);
  const previousTotals = calculateTotals(previousInvoices);

  // Calculate month-over-month changes
  const calculateChange = (current: number, previous: number) =>
    previous ? (((current - previous) / previous) * 100).toFixed(2) : "N/A";

  return {
    date: currentDate,
    invoices_count: currentInvoices.length,
    totals: currentTotals,
    comparison: {
      net_change: calculateChange(currentTotals.net, previousTotals.net),
      tax_change: calculateChange(currentTotals.tax, previousTotals.tax),
      total_change: calculateChange(currentTotals.total, previousTotals.total),
    },
    details: currentInvoices.map((inv) => ({
      id: inv.id,
      date: inv.date,
      customer: inv.customer,
      total: inv.invoice_lines.reduce(
        (sum, line) => sum + line.amount * line.quantity * (1 + line.tax / 100),
        0
      ),
    })),
  };
}

(async function main() {
  const api = new CuenticaAPI(process.env.CUENTICA_TOKEN);
  let total = 0;
  const last12Months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return date.toISOString().split("T")[0].substring(0, 7);
  }).reverse();

  console.log("Month              | Total (€)    | Invoices | Change (%)");
  console.log("-------------------|--------------|----------|-----------");
  for (const month of last12Months) {
    const report = await generateMonthlyIncomeReport(api, month);
    const date = report.date.toLocaleDateString("es-ES", {
      month: "long",
      year: "numeric",
    });

    const paddedDate = date.padEnd(18);
    const paddedTotal = report.totals.total.toFixed(2).padStart(13);
    const paddedInvoices = String(report.invoices_count).padStart(9);
    const paddedChange =
      (Number(report.comparison.total_change) >= 0 ? "+" : "") +
      Number(report.comparison.total_change).toFixed(2) +
      "%";
    total += report.totals.total;
    console.log(
      `${paddedDate} |${paddedTotal} |${paddedInvoices} | ${paddedChange}`
    );
  }
  console.log("-------------------|--------------|----------|-----------");
  console.log(`Total: ${total.toFixed(2)}€`);
})();
