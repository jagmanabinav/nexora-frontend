"use client";

import Link from "next/link";
import {
  gstSampleInvoices,
  invoiceAmounts,
  type GstSampleInvoice,
} from "./data";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

function date(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function AddressBlock({
  title,
  party,
}: {
  title: string;
  party: GstSampleInvoice["seller"] | GstSampleInvoice["buyer"];
}) {
  return (
    <section className="rounded-xl border border-slate-200 p-4">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {title}
      </h2>
      <p className="mt-3 font-bold text-slate-900">{party.name}</p>
      <p className="mt-1 text-sm leading-6 text-slate-600">{party.address}</p>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        <dt className="text-slate-500">GSTIN</dt>
        <dd className="font-mono font-semibold">{party.gstin}</dd>
        <dt className="text-slate-500">State</dt>
        <dd>
          {party.state} ({party.stateCode})
        </dd>
        {"email" in party && (
          <>
            <dt className="text-slate-500">Contact</dt>
            <dd>
              {party.email} · {party.phone}
            </dd>
          </>
        )}
      </dl>
    </section>
  );
}

function GstInvoice({ invoice }: { invoice: GstSampleInvoice }) {
  const totals = invoiceAmounts(invoice);
  return (
    <article className="print-invoice mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-9">
      <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">
            Tax invoice
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">
            {invoice.seller.name}
          </h1>
          <p className="mt-1 max-w-lg text-sm text-slate-600">
            {invoice.seller.address}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="font-mono text-lg font-bold text-slate-900">
            {invoice.invoiceNumber}
          </p>
          <span
            className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              invoice.status === "Paid"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-800"
            }`}
          >
            {invoice.status}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <AddressBlock title="Supplier / Bill from" party={invoice.seller} />
        <AddressBlock title="Recipient / Bill to" party={invoice.buyer} />
      </div>

      <dl className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-slate-500">Invoice date</dt>
          <dd className="mt-1 font-semibold">{date(invoice.invoiceDate)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Due date</dt>
          <dd className="mt-1 font-semibold">{date(invoice.dueDate)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Place of supply</dt>
          <dd className="mt-1 font-semibold">{invoice.placeOfSupply}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Supply</dt>
          <dd className="mt-1 font-semibold capitalize">
            {invoice.supplyType.replace("-", " ")}
          </dd>
        </div>
      </dl>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-y border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
              <th className="px-3 py-3">Description of service</th>
              <th className="px-3 py-3">SAC</th>
              <th className="px-3 py-3 text-right">Qty</th>
              <th className="px-3 py-3 text-right">Rate</th>
              <th className="px-3 py-3 text-right">Taxable value</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.description} className="border-b border-slate-100">
                <td className="px-3 py-4 font-medium">{item.description}</td>
                <td className="px-3 py-4 font-mono">{item.sac}</td>
                <td className="px-3 py-4 text-right">
                  {item.quantity.toLocaleString("en-IN")} {item.unit}
                </td>
                <td className="px-3 py-4 text-right">
                  {inr.format(item.rate)}
                </td>
                <td className="px-3 py-4 text-right font-semibold">
                  {inr.format(item.taxableValue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_340px]">
        <div className="rounded-xl border border-slate-200 p-4 text-sm">
          <h2 className="font-bold text-slate-900">Transaction details</h2>
          <p className="mt-2 text-slate-600">{invoice.reference}</p>
          <p className="mt-3 text-slate-500">{invoice.notes}</p>
          <p className="mt-4 text-xs text-slate-500">
            Reverse charge: No · GST rate shown for illustration; verify the
            applicable classification and rate before issuing a real invoice.
          </p>
        </div>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Taxable value</dt>
            <dd className="font-medium">{inr.format(totals.taxableValue)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">
              {invoice.supplyType === "intra-state" ? "CGST (9%)" : "CGST"}
            </dt>
            <dd>{inr.format(totals.cgst)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">
              {invoice.supplyType === "intra-state" ? "SGST (9%)" : "SGST"}
            </dt>
            <dd>{inr.format(totals.sgst)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">
              {invoice.supplyType === "inter-state" ? "IGST (18%)" : "IGST"}
            </dt>
            <dd>{inr.format(totals.igst)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-slate-200 pt-3 text-base font-bold">
            <dt>Invoice total</dt>
            <dd>{inr.format(totals.total)}</dd>
          </div>
          <p className="rounded-lg bg-cyan-50 px-3 py-2 text-xs leading-5 text-cyan-950">
            GSTIN and company details on these sample invoices are fictional
            placeholders. These are demonstrations, not valid tax documents.
          </p>
        </dl>
      </div>
      <div className="mt-8 flex justify-end">
        <div className="min-w-56 border-t border-slate-300 pt-2 text-right text-xs text-slate-500">
          Authorised signatory · {invoice.seller.name}
        </div>
      </div>
    </article>
  );
}

export default function InvoiceSamplesPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div>
            <Link href="/" className="text-sm font-semibold text-cyan-800">
              ← FabWash home
            </Link>
            <h1 className="mt-3 text-2xl font-bold">GST invoice examples</h1>
            <p className="mt-1 text-sm text-slate-600">
              Two illustrative sample invoices with intra-state and inter-state
              GST.
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Print / Save as PDF
          </button>
        </div>

        <GstInvoice invoice={gstSampleInvoices[0]} />
        <details className="mt-5 rounded-xl border border-slate-300 bg-white print:mt-8 print:border-0">
          <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-cyan-900 print:hidden">
            Open second example · {gstSampleInvoices[1].invoiceNumber} ·{" "}
            {gstSampleInvoices[1].buyer.name} · inter-state IGST
          </summary>
          <div className="pb-5">
            <GstInvoice invoice={gstSampleInvoices[1]} />
          </div>
        </details>
      </div>
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 10mm;
        }

        @media print {
          body {
            background: white !important;
          }
          main {
            min-height: 0 !important;
            padding: 0 !important;
          }
          .print-invoice {
            box-sizing: border-box;
            width: 100%;
            max-width: none;
            min-height: 277mm;
            margin: 0;
            padding: 8mm;
            border: 0;
            box-shadow: none;
            break-inside: avoid;
          }
          .print-invoice table,
          .print-invoice tr,
          .print-invoice section {
            break-inside: avoid;
          }
          details[open] {
            break-before: page;
          }
          details[open] .print-invoice {
            min-height: 277mm;
          }
        }
      `}</style>
    </main>
  );
}
