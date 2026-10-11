"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  api,
  Button,
  CreateFabWashGstInvoice,
  FabWashGstInvoice,
  GstInvoiceParty,
  parseApiError,
} from "@nexora/shared";

const emptyParty: GstInvoiceParty = {
  name: "",
  address: "",
  gstin: "",
  state: "",
  state_code: "",
  email: "",
  phone: "",
};

const today = () => new Date().toISOString().slice(0, 10);

function initialInvoice(): CreateFabWashGstInvoice {
  return {
    invoice_date: today(),
    due_date: today(),
    seller: { ...emptyParty },
    buyer: { ...emptyParty },
    place_of_supply: "",
    place_of_supply_code: "",
    line_items: [
      {
        description: "",
        sac: "",
        quantity: 1,
        unit: "kg",
        rate: 0,
        gst_rate: 18,
      },
    ],
  };
}

const inr = (value: string | number) =>
  Number(value).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
  });

function PartyFields({
  title,
  party,
  update,
}: {
  title: string;
  party: GstInvoiceParty;
  update: (party: GstInvoiceParty) => void;
}) {
  const field = (key: keyof GstInvoiceParty, label: string) => (
    <label className="block text-sm font-medium text-slate-700" key={key}>
      {label}
      <input
        required={
          key !== "email" &&
          key !== "phone" &&
          !(title === "Recipient" && key === "gstin")
        }
        value={party[key] ?? ""}
        onChange={(event) => update({ ...party, [key]: event.target.value })}
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal"
      />
    </label>
  );

  return (
    <fieldset className="space-y-3 rounded-xl border border-slate-200 p-4">
      <legend className="px-2 font-semibold text-slate-900">{title}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {field("name", "Legal name")}
        {field("gstin", "GSTIN")}
        {field("state", "State")}
        {field("state_code", "GST state code (2 digits)")}
      </div>
      {field("address", "Full address")}
      <div className="grid gap-3 sm:grid-cols-2">
        {field("email", "Email (optional)")}
        {field("phone", "Phone (optional)")}
      </div>
    </fieldset>
  );
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<FabWashGstInvoice[]>([]);
  const [selected, setSelected] = useState<FabWashGstInvoice | null>(null);
  const [draft, setDraft] = useState<CreateFabWashGstInvoice>(initialInvoice);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.fabwashInvoices.list();
      setInvoices(response.data);
      setError("");
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInvoices();
  }, [loadInvoices]);

  const updateLine = (
    lineIndex: number,
    key: keyof CreateFabWashGstInvoice["line_items"][number],
    value: string,
  ) => {
    const numeric = key === "quantity" || key === "rate" || key === "gst_rate";
    setDraft((current) => ({
      ...current,
      line_items: current.line_items.map((item, index) =>
        index === lineIndex
          ? { ...item, [key]: numeric ? Number(value) : value }
          : item,
      ),
    }));
  };

  const addLine = () =>
    setDraft((current) => ({
      ...current,
      line_items: [
        ...current.line_items,
        { description: "", sac: "", quantity: 1, unit: "kg", rate: 0, gst_rate: 18 },
      ],
    }));

  const issueInvoice = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await api.fabwashInvoices.create(draft);
      const invoice = response.data;
      setInvoices((current) => [invoice, ...current]);
      setSelected(invoice);
      setShowForm(false);
      setDraft(initialInvoice());
    } catch (err) {
      setError(parseApiError(err).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="no-print mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">GST Invoices</h1>
            <p className="mt-1 text-slate-600">
              Issue and print tenant-specific GST invoices in INR.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/invoice-samples"
              className="rounded-md border border-cyan-700 px-4 py-2 font-semibold text-cyan-900 hover:bg-cyan-50"
            >
              View illustrative examples
            </Link>
            <Button
              variant="primary"
              onClick={() => {
                setSelected(null);
                setError("");
                setDraft(initialInvoice());
                setShowForm(true);
              }}
            >
              Create GST invoice
            </Button>
          </div>
        </header>

        {error && (
          <div role="alert" className="no-print mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            {error}
          </div>
        )}

        {selected && (
          <section className="invoice-paper mb-7 rounded-xl bg-white p-8 shadow-sm">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-cyan-800">
                  Tax invoice
                </p>
                <h2 className="mt-1 text-2xl font-bold">{selected.invoice_number}</h2>
                <p className="text-sm text-slate-600">
                  Invoice date {selected.invoice_date} · Due {selected.due_date}
                </p>
              </div>
              <Button variant="secondary" onClick={() => window.print()}>
                Print / Save PDF
              </Button>
            </div>
            <div className="grid gap-6 border-y border-slate-200 py-5 sm:grid-cols-2">
              {[
                ["Supplier", selected.seller],
                ["Bill to", selected.buyer],
              ].map(([label, party]) => {
                const details = party as GstInvoiceParty;
                return (
                  <section key={String(label)}>
                    <h3 className="mb-2 font-semibold">{String(label)}</h3>
                    <p className="font-medium">{details.name}</p>
                    <p className="whitespace-pre-line text-sm text-slate-600">{details.address}</p>
                    {details.gstin && <p className="text-sm">GSTIN: {details.gstin}</p>}
                    <p className="text-sm">{details.state} ({details.state_code})</p>
                  </section>
                );
              })}
            </div>
            <p className="my-4 text-sm text-slate-700">
              Place of supply: {selected.place_of_supply} ({selected.place_of_supply_code}) ·{" "}
            {selected.supply_type} · Reverse charge: {selected.reverse_charge}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-300">
                    <th className="py-3 pr-3">Description / SAC</th>
                    <th className="py-3 pr-3">Qty</th>
                    <th className="py-3 pr-3">Rate</th>
                    <th className="py-3 pr-3">Taxable</th>
                    <th className="py-3 pr-3">GST</th>
                    <th className="py-3 text-right">Line total</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.line_items.map((item, index) => (
                    <tr key={`${item.sac}-${index}`} className="border-b border-slate-100">
                      <td className="py-3 pr-3">{item.description}<br />SAC {item.sac}</td>
                      <td className="py-3 pr-3">{item.quantity} {item.unit}</td>
                      <td className="py-3 pr-3">{inr(item.rate)}</td>
                      <td className="py-3 pr-3">{inr(item.taxable_value)}</td>
                      <td className="py-3 pr-3">{item.gst_rate}%</td>
                      <td className="py-3 text-right">
                        {inr(Number(item.taxable_value) + Number(item.cgst_amount) + Number(item.sgst_amount) + Number(item.igst_amount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <dl className="ml-auto mt-5 grid max-w-sm grid-cols-2 gap-2 text-sm">
              <dt>Taxable value</dt><dd className="text-right">{inr(selected.taxable_value)}</dd>
              {selected.supply_type === "intra-state" ? (
                <>
                  <dt>CGST</dt><dd className="text-right">{inr(selected.cgst_amount)}</dd>
                  <dt>SGST</dt><dd className="text-right">{inr(selected.sgst_amount)}</dd>
                </>
              ) : (
                <><dt>IGST</dt><dd className="text-right">{inr(selected.igst_amount)}</dd></>
              )}
              <dt className="border-t border-slate-300 pt-2 font-bold">Invoice total</dt>
              <dd className="border-t border-slate-300 pt-2 text-right font-bold">{inr(selected.invoice_total)}</dd>
            </dl>
            {selected.notes && <p className="mt-5 text-sm">{selected.notes}</p>}
          </section>
        )}

        <section className="no-print overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold">Issued invoices</h2>
          </div>
          {loading ? (
            <p className="p-6 text-slate-600">Loading invoices…</p>
          ) : invoices.length === 0 ? (
            <p className="p-6 text-slate-600">No GST invoices have been issued.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-5 py-3">Invoice</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Total</th>
                    <th className="px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-t border-slate-100">
                      <td className="px-5 py-3 font-mono">{invoice.invoice_number}</td>
                      <td className="px-5 py-3">{invoice.buyer.name}</td>
                      <td className="px-5 py-3">{invoice.invoice_date}</td>
                      <td className="px-5 py-3 font-semibold">{inr(invoice.invoice_total)}</td>
                      <td className="px-5 py-3">
                        <button
                          className="font-semibold text-cyan-800 hover:underline"
                          onClick={() => setSelected(invoice)}
                        >
                          View / print
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {showForm && (
          <div className="no-print fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4">
            <form
              onSubmit={issueInvoice}
              className="mx-auto my-6 max-w-3xl space-y-5 rounded-2xl bg-white p-6 shadow-xl"
            >
              <header>
                <h2 className="text-2xl font-bold">Issue GST invoice</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Enter verified supplier and recipient details. Confirm the SAC, GST rate, place of supply, and reverse-charge treatment with your tax adviser; the app does not determine these.
                </p>
              </header>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-medium">Invoice date<input required type="date" value={draft.invoice_date} onChange={(e) => setDraft({ ...draft, invoice_date: e.target.value })} className="mt-1 w-full rounded-md border p-2" /></label>
                <label className="text-sm font-medium">Due date<input required type="date" value={draft.due_date} onChange={(e) => setDraft({ ...draft, due_date: e.target.value })} className="mt-1 w-full rounded-md border p-2" /></label>
              </div>
              <PartyFields title="Supplier" party={draft.seller} update={(seller) => setDraft({ ...draft, seller })} />
              <PartyFields title="Recipient" party={draft.buyer} update={(buyer) => setDraft({ ...draft, buyer, place_of_supply: buyer.state, place_of_supply_code: buyer.state_code })} />
              <div className="space-y-4">
                {draft.line_items.map((line, index) => (
                  <fieldset key={index} className="space-y-3 rounded-xl border border-slate-200 p-4">
                    <legend className="px-2 font-semibold">Service line {index + 1}</legend>
                    <label className="block text-sm font-medium">Description<input required value={line.description} onChange={(e) => updateLine(index, "description", e.target.value)} className="mt-1 w-full rounded-md border p-2" /></label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="text-sm font-medium">SAC<input required pattern="\d{4,8}" value={line.sac} onChange={(e) => updateLine(index, "sac", e.target.value)} className="mt-1 w-full rounded-md border p-2" /></label>
                      <label className="text-sm font-medium">Unit<input required value={line.unit} onChange={(e) => updateLine(index, "unit", e.target.value)} className="mt-1 w-full rounded-md border p-2" /></label>
                      <label className="text-sm font-medium">Quantity<input required type="number" min="0.001" step="0.001" value={line.quantity} onChange={(e) => updateLine(index, "quantity", e.target.value)} className="mt-1 w-full rounded-md border p-2" /></label>
                      <label className="text-sm font-medium">Rate per unit (₹)<input required type="number" min="0" step="0.01" value={line.rate} onChange={(e) => updateLine(index, "rate", e.target.value)} className="mt-1 w-full rounded-md border p-2" /></label>
                      <label className="text-sm font-medium">GST rate (%)<input required type="number" min="0" max="100" step="0.01" value={line.gst_rate} onChange={(e) => updateLine(index, "gst_rate", e.target.value)} className="mt-1 w-full rounded-md border p-2" /></label>
                    </div>
                    {draft.line_items.length > 1 && (
                      <button type="button" className="text-sm font-semibold text-red-700" onClick={() => setDraft((current) => ({ ...current, line_items: current.line_items.filter((_, lineIndex) => lineIndex !== index) }))}>
                        Remove line
                      </button>
                    )}
                  </fieldset>
                ))}
                <Button type="button" variant="secondary" onClick={addLine}>Add service line</Button>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={draft.reverse_charge ?? false} onChange={(e) => setDraft({ ...draft, reverse_charge: e.target.checked })} />
                Reverse charge applies (confirm with your tax adviser)
              </label>
              <label className="block text-sm font-medium">Reference (optional)<input value={draft.reference ?? ""} onChange={(e) => setDraft({ ...draft, reference: e.target.value })} className="mt-1 w-full rounded-md border p-2" /></label>
              <label className="block text-sm font-medium">Notes (optional)<textarea value={draft.notes ?? ""} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} className="mt-1 w-full rounded-md border p-2" /></label>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button variant="primary" type="submit" disabled={saving}>{saving ? "Issuing…" : "Issue invoice"}</Button>
              </div>
            </form>
          </div>
        )}
      </div>
      <style jsx global>{`
        @media print {
          @page { size: A4 portrait; margin: 12mm; }
          body { background: white !important; }
          .no-print { display: none !important; }
          .invoice-paper { display: block !important; box-shadow: none !important; padding: 0 !important; }
          .invoice-paper button { display: none !important; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; }
        }
      `}</style>
    </main>
  );
}
