type Payment = {
  product: string;
  amount: string;
};

// Placeholder demo rows, swap in your own
const payments: Payment[] = [
  { product: "Product A", amount: "+49.00 $" },
  { product: "Product B", amount: "+120.00 $" },
  { product: "Product C", amount: "+9.00 $" },
  { product: "Product D", amount: "+19.00 $" },
  { product: "Product E", amount: "+270.00 $" },
];

export function Payments() {
  return (
    <div aria-hidden="true" className="relative h-50 w-full">
      <div className="absolute right-4 top-2 w-[110%] rounded-lg border border-border bg-card shadow-sm transition-transform duration-300 group-hover:-translate-y-1">
        <table className="w-full text-sm">
          <tbody>
            {payments.map((payment) => (
              <tr
                key={payment.product}
                className="border-b border-border last:border-b-0"
              >
                <td className="px-4 py-3 font-medium text-foreground">
                  {payment.product}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums text-muted-foreground group-hover:text-primary duration-500">
                  {payment.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
