export type GstSampleInvoice = {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  status: "Paid" | "Payment due";
  seller: {
    name: string;
    address: string;
    gstin: string;
    state: string;
    stateCode: string;
    email: string;
    phone: string;
  };
  buyer: {
    name: string;
    address: string;
    gstin: string;
    state: string;
    stateCode: string;
  };
  placeOfSupply: string;
  supplyType: "intra-state" | "inter-state";
  reference: string;
  items: Array<{
    description: string;
    sac: string;
    quantity: number;
    unit: string;
    rate: number;
    taxableValue: number;
  }>;
  notes: string;
};

export const gstSampleInvoices: GstSampleInvoice[] = [
  {
    invoiceNumber: "FW/2026-27/0001",
    invoiceDate: "2026-10-08",
    dueDate: "2026-10-23",
    status: "Paid",
    seller: {
      name: "FabWash Demo Textile Services",
      address: "Plot 18, Peenya Industrial Area, Bengaluru, Karnataka 560058",
      gstin: "29AABCF1234G1Z5",
      state: "Karnataka",
      stateCode: "29",
      email: "billing@example.invalid",
      phone: "+91 80 4000 1234",
    },
    buyer: {
      name: "Sampada Textiles (Demo)",
      address: "42 Cotton Market Road, Bengaluru, Karnataka 560002",
      gstin: "29AABCS5678H1Z2",
      state: "Karnataka",
      stateCode: "29",
    },
    placeOfSupply: "Karnataka (29)",
    supplyType: "intra-state",
    reference: "Batch FW-B-1024, Delivery challan DC-0261",
    items: [
      {
        description: "Fabric washing and finishing service",
        sac: "9988",
        quantity: 1200,
        unit: "kg",
        rate: 10,
        taxableValue: 12000,
      },
    ],
    notes: "Payment received by bank transfer. Thank you for your business.",
  },
  {
    invoiceNumber: "FW/2026-27/0002",
    invoiceDate: "2026-10-09",
    dueDate: "2026-10-24",
    status: "Payment due",
    seller: {
      name: "FabWash Demo Textile Services",
      address: "Plot 18, Peenya Industrial Area, Bengaluru, Karnataka 560058",
      gstin: "29AABCF1234G1Z5",
      state: "Karnataka",
      stateCode: "29",
      email: "billing@example.invalid",
      phone: "+91 80 4000 1234",
    },
    buyer: {
      name: "Marudhar Fabrics (Demo)",
      address: "17 Textile Park, Jaipur, Rajasthan 302001",
      gstin: "08AABCM9012J1Z7",
      state: "Rajasthan",
      stateCode: "08",
    },
    placeOfSupply: "Rajasthan (08)",
    supplyType: "inter-state",
    reference: "Batch FW-B-1031, Delivery challan DC-0268",
    items: [
      {
        description: "Bulk fabric washing service",
        sac: "9988",
        quantity: 2000,
        unit: "kg",
        rate: 10,
        taxableValue: 20000,
      },
      {
        description: "Finishing and quality inspection",
        sac: "9988",
        quantity: 1,
        unit: "job",
        rate: 5000,
        taxableValue: 5000,
      },
    ],
    notes: "Please quote the invoice number with your payment reference.",
  },
];

export function invoiceAmounts(invoice: GstSampleInvoice) {
  const taxableValue = invoice.items.reduce(
    (total, item) => total + item.taxableValue,
    0,
  );
  const gst = Math.round(taxableValue * 0.18 * 100) / 100;
  const cgst = invoice.supplyType === "intra-state" ? gst / 2 : 0;
  const sgst = invoice.supplyType === "intra-state" ? gst / 2 : 0;
  const igst = invoice.supplyType === "inter-state" ? gst : 0;
  return {
    taxableValue,
    cgst,
    sgst,
    igst,
    total: taxableValue + cgst + sgst + igst,
  };
}
