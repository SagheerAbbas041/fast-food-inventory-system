import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import api from "../api";
import { Button, Status } from "../components/UI";
import titleLogo from "./titlelogo.png";
// =====================================================
// RESTAURANT INFORMATION
// =====================================================
const RESTAURANT_NAME = "CRAVE CORNER";
const RESTAURANT_ADDRESS =
  "Old Rasool Road, Near Al-Noor Public Secondary School, Mandi Bahauddin";
const RESTAURANT_PHONE_1 = "0340-4724113";
const RESTAURANT_PHONE_2 = "0315-7477514";
// =====================================================
// FORMAT PKR
// =====================================================
const formatPKR = (value) => {
  return `PKR ${Number(value || 0).toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};
// =====================================================
// GET PRODUCT DISPLAY TEXT
// =====================================================
const getProductDisplayText = (item) => {
  const variant = String(
    item?.variant || ""
  ).trim();
  const size = String(
    item?.size || ""
  ).trim();
  const productName = String(
    item?.name || ""
  ).trim();
  // =================================================
  // VARIANT + SIZE
  // =================================================
  if (variant && size) {
    return `${variant} - ${size}`;
  }
  // =================================================
  // VARIANT ONLY
  // =================================================
  if (variant) {
    return variant;
  }
  // =================================================
  // PRODUCT NAME + SIZE
  // =================================================
  if (productName && size) {
    return `${productName} - ${size}`;
  }
  // =================================================
  // PRODUCT NAME
  // =================================================
  if (productName) {
    return productName;
  }
  return "Product";
};
// =====================================================
// LOAD LOGO FOR PDF
// =====================================================
const loadLogoForPDF = () => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      resolve(image);
    };
    image.onerror = () => {
      reject(
        new Error(
          "Unable to load invoice logo"
        )
      );
    };
    image.src = titleLogo;
  });
};
// =====================================================
// GENERATE INVOICE PDF
// =====================================================
const generateInvoicePDF = async (invoice) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
  const pageWidth =
    doc.internal.pageSize.getWidth();
  const pageHeight =
    doc.internal.pageSize.getHeight();
  const left = 15;
  const right = pageWidth - 15;
  let y = 18;
  // ===================================================
  // LOAD LOGO
  // ===================================================
  let logo = null;
  try {
    logo = await loadLogoForPDF();
  } catch (error) {
    console.error(
      "Invoice logo loading error:",
      error
    );
  }
  // ===================================================
  // HELPER - DRAW TABLE HEADER
  // ===================================================
  const drawTableHeader = () => {
    const tableX = left;
    const tableWidth = right - left;
    const headerHeight = 9;
    const colProduct = tableX;
    const colPrice = tableX + 105;
    const colQuantity = tableX + 135;
    const colTotal = right;
    doc.setFillColor(240, 240, 240);
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.3);
    doc.rect(
      tableX,
      y,
      tableWidth,
      headerHeight,
      "FD"
    );
    doc.setFont(
      "helvetica",
      "bold"
    );
    doc.setFontSize(10);
    doc.text(
      "Product",
      colProduct + 3,
      y + 6
    );
    doc.text(
      "Price",
      colPrice,
      y + 6,
      {
        align: "right",
      }
    );
    doc.text(
      "Quantity",
      colQuantity,
      y + 6,
      {
        align: "right",
      }
    );
    doc.text(
      "Total",
      colTotal - 3,
      y + 6,
      {
        align: "right",
      }
    );
    y += headerHeight;
  };
  // ===================================================
  // HEADER
  // LOGO - LEFT
  // NAME + ADDRESS - RIGHT
  // ===================================================
  const logoSize = 28;
  if (logo) {
    doc.addImage(
      logo,
      "PNG",
      left,
      y - 5,
      logoSize,
      logoSize
    );
  }
  const headerRightX = right;
  doc.setFont(
    "helvetica",
    "bold"
  );
  doc.setFontSize(22);
  doc.text(
    RESTAURANT_NAME,
    headerRightX,
    y + 3,
    {
      align: "right",
    }
  );
  doc.setFont(
    "helvetica",
    "normal"
  );
  doc.setFontSize(9);
  const addressLines =
    doc.splitTextToSize(
      RESTAURANT_ADDRESS,
      105
    );
  doc.text(
    addressLines,
    headerRightX,
    y + 10,
    {
      align: "right",
    }
  );
  const addressHeight =
    addressLines.length * 4;
  y += Math.max(
    logoSize,
    14 + addressHeight
  );
  y += 5;
  // ===================================================
  // HEADER LINE
  // ===================================================
  doc.setLineWidth(0.5);
  doc.line(
    left,
    y,
    right,
    y
  );
  y += 8;
  // ===================================================
  // INVOICE INFORMATION
  // ===================================================
  const invoiceNo =
    invoice?.invoiceNo || "-";
  const orderNo =
    invoice?.order?.orderNo || "-";
  const invoiceDate =
    invoice?.issuedAt ||
    invoice?.createdAt ||
    invoice?.updatedAt;
  const formattedDate =
    invoiceDate
      ? new Date(
          invoiceDate
        ).toLocaleString(
          "en-PK",
          {
            dateStyle: "medium",
            timeStyle: "short",
          }
        )
      : "-";
  // ===================================================
  // INVOICE NUMBER - LEFT
  // PHONE NUMBERS - RIGHT
  // ===================================================
  doc.setFont(
    "helvetica",
    "bold"
  );
  doc.setFontSize(10);
  doc.text(
    "Invoice No:",
    left,
    y
  );
  doc.setFont(
    "helvetica",
    "normal"
  );
  doc.text(
    invoiceNo,
    left + 25,
    y
  );
  doc.setFont(
    "helvetica",
    "bold"
  );
  doc.text(
    "Phone:",
    right - 45,
    y
  );
  doc.setFont(
    "helvetica",
    "normal"
  );
  doc.text(
    RESTAURANT_PHONE_1,
    right,
    y,
    {
      align: "right",
    }
  );
  doc.text(
    RESTAURANT_PHONE_2,
    right,
    y + 5,
    {
      align: "right",
    }
  );
  y += 10;
  // ===================================================
  // DATE - LEFT
  // ORDER NUMBER - RIGHT
  // ===================================================
  doc.setFont(
    "helvetica",
    "bold"
  );
  doc.text(
    "Date:",
    left,
    y
  );
  doc.setFont(
    "helvetica",
    "normal"
  );
  doc.text(
    formattedDate,
    left + 25,
    y
  );
  doc.setFont(
    "helvetica",
    "bold"
  );
  doc.text(
    "Order No:",
    right - 45,
    y
  );
  doc.setFont(
    "helvetica",
    "normal"
  );
  doc.text(
    orderNo,
    right,
    y,
    {
      align: "right",
    }
  );
  y += 7;
  // ===================================================
  // CUSTOMER - LEFT
  // TABLE - RIGHT
  // ===================================================
  doc.setFont(
    "helvetica",
    "bold"
  );
  doc.text(
    "Customer:",
    left,
    y
  );
  doc.setFont(
    "helvetica",
    "normal"
  );
  doc.text(
    invoice?.customerName ||
      "Walk-in",
    left + 25,
    y
  );
  doc.setFont(
    "helvetica",
    "bold"
  );
  doc.text(
    "Table:",
    right - 45,
    y
  );
  doc.setFont(
    "helvetica",
    "normal"
  );
  doc.text(
    invoice?.tableName ||
      "-",
    right,
    y,
    {
      align: "right",
    }
  );
  y += 8;
  // ===================================================
  // ITEMS TABLE
  // ===================================================
  const tableX = left;
  const tableWidth = right - left;
  const colProduct = tableX;
  const colPrice = tableX + 105;
  const colQuantity = tableX + 135;
  const colTotal = right;
  const rowHeight = 8;
  drawTableHeader();
  // ===================================================
  // ITEMS
  // ===================================================
  const items = Array.isArray(
    invoice?.items
  )
    ? invoice.items
    : [];
  if (items.length === 0) {
    doc.setFont(
      "helvetica",
      "normal"
    );
    doc.setFontSize(9);
    doc.rect(
      tableX,
      y,
      tableWidth,
      rowHeight
    );
    doc.text(
      "No item details available.",
      tableX + 3,
      y + 5.5
    );
    y += rowHeight;
  } else {
    items.forEach((item) => {
      // ===============================================
      // NEW PAGE IF NEEDED
      // ===============================================
      if (y > pageHeight - 50) {
        doc.addPage();
        y = 20;
        drawTableHeader();
      }
      // ===============================================
      // PRODUCT DISPLAY
      // ===============================================
      const displayName =
        getProductDisplayText(item);
      // ===============================================
      // QUANTITY
      // ===============================================
      const quantity =
        Number(
          item?.quantity || 0
        );
      // ===============================================
      // UNIT PRICE
      // ===============================================
      const price =
        Number(
          item?.unitPrice ??
            item?.price ??
            0
        );
      // ===============================================
      // TOTAL
      // ===============================================
      const total =
        Number(
          item?.total ??
            price * quantity
        );
      // ===============================================
      // ROW BORDER
      // ===============================================
      doc.setDrawColor(
        100,
        100,
        100
      );
      doc.setLineWidth(0.3);
      doc.rect(
        tableX,
        y,
        tableWidth,
        rowHeight
      );
      // ===============================================
      // PRODUCT
      // ===============================================
      doc.setFont(
        "helvetica",
        "normal"
      );
      doc.setFontSize(9);
      const maxProductWidth = 92;
      let productLines =
        doc.splitTextToSize(
          displayName,
          maxProductWidth
        );
      if (productLines.length > 1) {
        productLines = [
          productLines[0],
        ];
      }
      doc.text(
        productLines,
        colProduct + 3,
        y + 5.5
      );
      // ===============================================
      // PRICE
      // ===============================================
      doc.text(
        formatPKR(price),
        colPrice,
        y + 5.5,
        {
          align: "right",
        }
      );
      // ===============================================
      // QUANTITY
      // ===============================================
      doc.text(
        String(quantity),
        colQuantity,
        y + 5.5,
        {
          align: "right",
        }
      );
      // ===============================================
      // TOTAL
      // ===============================================
      doc.text(
        formatPKR(total),
        colTotal - 3,
        y + 5.5,
        {
          align: "right",
        }
      );
      y += rowHeight;
    });
  }
  // ===================================================
  // SPACE AFTER TABLE
  // ===================================================
  y += 8;
  // ===================================================
  // TOTALS
  // RIGHT SIDE
  // ===================================================
  const totalsLabelX =
    right - 55;
  const totalsValueX =
    right;
  doc.setFontSize(10);
  // ===================================================
  // SUBTOTAL
  // ===================================================
  doc.setFont(
    "helvetica",
    "bold"
  );
  doc.text(
    "Subtotal:",
    totalsLabelX,
    y
  );
  doc.text(
    formatPKR(
      invoice?.subtotal
    ),
    totalsValueX,
    y,
    {
      align: "right",
    }
  );
  y += 7;
  // ===================================================
  // TAX
  // ===================================================
  doc.setFont(
    "helvetica",
    "bold"
  );
  doc.text(
    "Tax:",
    totalsLabelX,
    y
  );
  doc.text(
    formatPKR(
      invoice?.tax
    ),
    totalsValueX,
    y,
    {
      align: "right",
    }
  );
  y += 7;
  // ===================================================
  // DISCOUNT
  // ===================================================
  const discount =
    Number(
      invoice?.discount || 0
    );
  if (discount > 0) {
    doc.setFont(
      "helvetica",
      "bold"
    );
    doc.text(
      "Discount:",
      totalsLabelX,
      y
    );
    doc.text(
      `- ${formatPKR(
        discount
      )}`,
      totalsValueX,
      y,
      {
        align: "right",
      }
    );
    y += 7;
  }
  // ===================================================
  // TOTAL LINE
  // ===================================================
  doc.setLineWidth(0.5);
  doc.line(
    totalsLabelX,
    y,
    totalsValueX,
    y
  );
  y += 8;
  // ===================================================
  // GRAND TOTAL
  // ===================================================
  doc.setFont(
    "helvetica",
    "bold"
  );
  doc.setFontSize(13);
  doc.text(
    "Total:",
    totalsLabelX,
    y
  );
  doc.text(
    formatPKR(
      invoice?.total
    ),
    totalsValueX,
    y,
    {
      align: "right",
    }
  );
  y += 12;
  // ===================================================
  // PAYMENT METHOD
  // ===================================================
  doc.setFont(
    "helvetica",
    "bold"
  );
  doc.setFontSize(9);
  doc.text(
    "Payment Method:",
    right - 50,
    y
  );
  doc.setFont(
    "helvetica",
    "normal"
  );
  doc.text(
    invoice?.paymentMethod ||
      "-",
    right,
    y,
    {
      align: "right",
    }
  );
  y += 12;
  // ===================================================
  // FOOTER
  // ===================================================
  doc.setFont(
    "helvetica",
    "bold"
  );
  doc.setFontSize(11);
  doc.text(
    "Thank you for visiting!",
    pageWidth / 2,
    y,
    {
      align: "center",
    }
  );
  y += 5;
  doc.setFont(
    "helvetica",
    "normal"
  );
  doc.setFontSize(8);
  doc.text(
    RESTAURANT_NAME,
    pageWidth / 2,
    y,
    {
      align: "center",
    }
  );
  // ===================================================
  // SAVE PDF
  // ===================================================
  doc.save(
    `${
      invoice?.invoiceNo ||
      "invoice"
    }.pdf`
  );
};
// =====================================================
// PRINT A SINGLE INVOICE RECEIPT
// =====================================================
const escapePrintHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });

const printInvoice = (invoice) => {
  if (!invoice) return;

  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const itemRows = items.map((item) => {
    const quantity = Number(item?.quantity || 0);
    const unitPrice = Number(item?.unitPrice || 0);
    const total = Number(item?.total ?? unitPrice * quantity);
    return `<tr>
      <td>${escapePrintHtml(getProductDisplayText(item))}</td>
      <td class="number">${escapePrintHtml(formatPKR(unitPrice))}</td>
      <td class="number">${escapePrintHtml(quantity)}</td>
      <td class="number">${escapePrintHtml(formatPKR(total))}</td>
    </tr>`;
  }).join("");

  // Keep date formatting local to this function. The component-level
  // formatInvoiceDate helper is not accessible from this module-level function.
  const rawInvoiceDate =
    invoice?.issuedAt || invoice?.createdAt || invoice?.updatedAt;
  const invoiceDate = rawInvoiceDate
    ? new Date(rawInvoiceDate).toLocaleString("en-PK", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "-";
  const subtotal = Number(invoice.subtotal ?? invoice.total ?? 0);
  const discount = Number(invoice.discount || 0);
  const tax = Number(invoice.tax || 0);
  const grandTotal = Number(invoice.total ?? invoice.grandTotal ?? 0);
  const printWindow = window.open("", "_blank", "width=420,height=720");

  if (!printWindow) {
    alert("Please allow pop-ups for this site to print the receipt.");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Receipt ${escapePrintHtml(invoice.invoiceNo || "")}</title>
<style>
  * { box-sizing: border-box; }
  html, body { width: 100%; margin: 0; padding: 0; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    color: #111;
    width: 72mm;
    margin: 0 auto;
    padding: 2mm;
    font-size: 10px;
    line-height: 1.3;
    background: #fff;
  }
  .center { text-align: center; }
  h1 { font-size: 18px; line-height: 1.2; margin: 0 0 4px; overflow-wrap: anywhere; }
  p { margin: 3px 0; line-height: 1.3; overflow-wrap: anywhere; }
  .rule { border-top: 1px dashed #333; margin: 7px 0; }
  .meta { display: flex; justify-content: space-between; align-items: flex-start; gap: 5px; margin: 4px 0; }
  .meta > :last-child { text-align: right; overflow-wrap: anywhere; }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 9px; }
  th, td { padding: 4px 1px; border-bottom: 1px dotted #aaa; overflow-wrap: anywhere; vertical-align: top; }
  th { text-align: left; }
  .number { text-align: right; white-space: nowrap; }
  th:nth-child(1), td:nth-child(1) { width: 38%; }
  th:nth-child(2), td:nth-child(2) { width: 22%; }
  th:nth-child(3), td:nth-child(3) { width: 10%; }
  th:nth-child(4), td:nth-child(4) { width: 30%; }
  .total-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin: 5px 0; }
  .total-row > :last-child { text-align: right; overflow-wrap: anywhere; }
  .grand { font-size: 14px; font-weight: bold; border-top: 1px dashed #333; padding-top: 6px; }
  @page { size: 80mm auto; margin: 0; }
  @media print {
    html, body { width: 72mm; margin: 0; padding: 0; }
    body { width: 72mm; padding: 2mm; }
    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    thead { display: table-header-group; }
    tr, .total-row, .meta { break-inside: avoid; page-break-inside: avoid; }
  }
</style>
</head>
<body>
  <header class="center">
    <h1>${escapePrintHtml(RESTAURANT_NAME)}</h1>
    <p>${escapePrintHtml(RESTAURANT_ADDRESS)}</p>
    <p>${escapePrintHtml(RESTAURANT_PHONE_1)} | ${escapePrintHtml(RESTAURANT_PHONE_2)}</p>
    <p><strong>INVOICE / RECEIPT</strong></p>
  </header>
  <div class="rule"></div>
  <div class="meta"><span>Invoice:</span><strong>${escapePrintHtml(invoice.invoiceNo || "-")}</strong></div>
  <div class="meta"><span>Order:</span><span>${escapePrintHtml(invoice.order?.orderNo || invoice.orderNo || "-")}</span></div>
  <div class="meta"><span>Date:</span><span>${escapePrintHtml(invoiceDate || "-")}</span></div>
  <div class="meta"><span>Table:</span><span>${escapePrintHtml(invoice.tableName || invoice.table?.name || "-")}</span></div>
  <div class="meta"><span>Customer:</span><span>${escapePrintHtml(invoice.customerName || invoice.customer?.name || "Walk-in")}</span></div>
  <div class="rule"></div>
  <table>
    <thead><tr><th>Product</th><th class="number">Price</th><th class="number">Qty</th><th class="number">Total</th></tr></thead>
    <tbody>${itemRows || '<tr><td colspan="4">No items</td></tr>'}</tbody>
  </table>
  <div class="rule"></div>
  <div class="total-row"><span>Subtotal</span><span>${escapePrintHtml(formatPKR(subtotal))}</span></div>
  ${discount ? `<div class="total-row"><span>Discount</span><span>-${escapePrintHtml(formatPKR(discount))}</span></div>` : ""}
  ${tax ? `<div class="total-row"><span>Tax</span><span>${escapePrintHtml(formatPKR(tax))}</span></div>` : ""}
  <div class="total-row grand"><span>Grand Total</span><span>${escapePrintHtml(formatPKR(grandTotal))}</span></div>
  <div class="meta"><span>Payment:</span><span>${escapePrintHtml(invoice.paymentMethod || "-")}</span></div>
  <div class="rule"></div>
  <p class="center">Thank you for visiting ${escapePrintHtml(RESTAURANT_NAME)}!</p>
  <script>
    window.addEventListener("load", () => {
      window.focus();
      setTimeout(() => window.print(), 250);
    });
    window.addEventListener("afterprint", () => window.close());
  </script>
</body>
</html>`);
  printWindow.document.close();
};

// =====================================================
// INVOICES PAGE
// =====================================================
export default function Invoices() {
  const [rows, setRows] =
    useState([]);
  const [loading, setLoading] =
    useState(true);
  // ===================================================
  // VIEW INVOICE
  // ===================================================
  const [selectedInvoice, setSelectedInvoice] =
    useState(null);
  // ===================================================
  // DELETE INVOICE
  // ===================================================
  const [deletingInvoiceId, setDeletingInvoiceId] =
    useState(null);
  // ===================================================
  // LOAD INVOICES
  // ===================================================
  const loadInvoices =
    async () => {
      try {
        setLoading(true);
        const response =
          await api.get(
            "/invoices"
          );
        setRows(
          Array.isArray(
            response.data
          )
            ? response.data
            : []
        );
      } catch (error) {
        console.error(
          "Invoices loading error:",
          error
        );
        alert(
          error.response?.data
            ?.message ||
            "Unable to load invoices."
        );
      } finally {
        setLoading(false);
      }
    };
  // ===================================================
  // INITIAL LOAD
  // ===================================================
  useEffect(() => {
    loadInvoices();
  }, []);
  // ===================================================
  // CLOSE VIEW MODAL
  // ===================================================
  const closeInvoiceView = () => {
    setSelectedInvoice(null);
  };
  // ===================================================
  // DELETE INVOICE
  // ===================================================
  const deleteInvoice =
    async (invoice) => {
      if (!invoice?._id) {
        return;
      }
      const invoiceNumber =
        invoice.invoiceNo ||
        "this invoice";
      const confirmed =
        window.confirm(
          `Are you sure you want to delete ${invoiceNumber}?\n\nThis invoice will be permanently removed from the database.`
        );
      if (!confirmed) {
        return;
      }
      try {
        setDeletingInvoiceId(
          invoice._id
        );
        await api.delete(
          `/invoices/${invoice._id}`
        );
        // Close modal if the same invoice
        // is currently open.
        if (
          selectedInvoice?._id ===
          invoice._id
        ) {
          setSelectedInvoice(null);
        }
        // Remove immediately from UI.
        setRows((currentRows) =>
          currentRows.filter(
            (row) =>
              row._id !==
              invoice._id
          )
        );
        alert(
          "Invoice deleted successfully."
        );
      } catch (error) {
        console.error(
          "Invoice delete error:",
          error
        );
        alert(
          error.response?.data
            ?.message ||
            "Unable to delete invoice."
        );
      } finally {
        setDeletingInvoiceId(null);
      }
    };
  // ===================================================
  // FORMAT DATE
  // ===================================================
  const formatInvoiceDate = (
    invoice
  ) => {
    const date =
      invoice?.issuedAt ||
      invoice?.createdAt ||
      invoice?.updatedAt;
    if (!date) {
      return "-";
    }
    return new Date(
      date
    ).toLocaleString(
      "en-PK",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };
  // ===================================================
  // UI
  // ===================================================
  return (
    <>
      <div className="page-heading invoices-page-heading">
        <div>
          <h1>
            Invoices
          </h1>
          <p>
            Generated bills and payments
          </p>
        </div>
        <div className="invoices-header-action">
          <Button
            variant="secondary"
            onClick={
              loadInvoices
            }
          >
            Refresh
          </Button>
        </div>
      </div>
      {/* =================================================
          INVOICE TABLE
      ================================================= */}
      <div className="card table-wrap invoices-table-card">
        <div className="responsive-table invoices-responsive-table">
          <table>
            <thead>
              <tr>
                <th>
                  Invoice #
                </th>
                <th>
                  Order #
                </th>
                <th>
                  Table
                </th>
                <th>
                  Customer
                </th>
                <th>
                  Total
                </th>
                <th>
                  Payment
                </th>
                <th>
                  Date
                </th>
                <th>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      textAlign:
                        "center",
                      padding: 30,
                    }}
                  >
                    Loading invoices...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      textAlign:
                        "center",
                      padding: 30,
                    }}
                  >
                    No invoices generated yet.
                  </td>
                </tr>
              ) : (
                rows.map(
                  (invoice) => (
                    <tr
                      key={
                        invoice._id
                      }
                    >
                      <td>
                        {
                          invoice.invoiceNo
                        }
                      </td>
                      <td>
                        {
                          invoice
                            .order
                            ?.orderNo ||
                          "-"
                        }
                      </td>
                      <td>
                        {
                          invoice.tableName ||
                          "-"
                        }
                      </td>
                      <td>
                        {
                          invoice.customerName ||
                          "Walk-in"
                        }
                      </td>
                      <td>
                        {formatPKR(
                          invoice.total
                        )}
                      </td>
                      <td>
                        <Status
                          value={
                            invoice.paymentMethod ||
                            "paid"
                          }
                        />
                      </td>
                      <td>
                        {
                          formatInvoiceDate(
                            invoice
                          )
                        }
                      </td>
                      {/* =================================
                          ACTION BUTTONS
                      ================================= */}
                      <td>
                        <div
                          className="invoice-action"
                          style={{
                            display:
                              "flex",
                            gap: "8px",
                            alignItems:
                              "center",
                            flexWrap:
                              "wrap",
                          }}
                        >
                          {/* VIEW */}
                          <Button
                            variant="secondary"
                            onClick={() =>
                              setSelectedInvoice(
                                invoice
                              )
                            }
                          >
                            View
                          </Button>
                          {/* PDF */}
                          <Button
                            variant="secondary"
                            onClick={() =>
                              generateInvoicePDF(
                                invoice
                              )
                            }
                          >
                            PDF
                          </Button>
                          {/* PRINT RECEIPT */}
                          <Button
                            variant="secondary"
                            onClick={() => printInvoice(invoice)}
                          >
                            Print
                          </Button>
                          {/* DELETE */}
                          <Button
                            variant="danger"
                            disabled={
                              deletingInvoiceId ===
                              invoice._id
                            }
                            onClick={() =>
                              deleteInvoice(
                                invoice
                              )
                            }
                          >
                            {deletingInvoiceId ===
                            invoice._id
                              ? "Deleting..."
                              : "Delete"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* =================================================
          INVOICE VIEW MODAL
      ================================================= */}
      {selectedInvoice && (
        <div
          onClick={
            closeInvoiceView
          }
          style={{
            position:
              "fixed",
            inset: 0,
            background:
              "rgba(0, 0, 0, 0.55)",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            padding:
              "20px",
            zIndex: 9999,
            overflowY:
              "auto",
          }}
        >
          {/* =============================================
              INVOICE CARD
          ============================================= */}
          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            style={{
              width:
                "100%",
              maxWidth:
                "850px",
              maxHeight:
                "90vh",
              overflowY:
                "auto",
              background:
                "#ffffff",
              borderRadius:
                "12px",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.25)",
              padding:
                "30px",
              position:
                "relative",
              color:
                "#111827",
            }}
          >
            {/* =========================================
                CLOSE BUTTON
            ========================================= */}
            <button
              type="button"
              onClick={
                closeInvoiceView
              }
              style={{
                position:
                  "absolute",
                top:
                  "15px",
                right:
                  "15px",
                width:
                  "34px",
                height:
                  "34px",
                border:
                  "none",
                borderRadius:
                  "50%",
                background:
                  "#f3f4f6",
                cursor:
                  "pointer",
                fontSize:
                  "20px",
                lineHeight:
                  "34px",
              }}
              aria-label="Close invoice"
            >
              ×
            </button>
            {/* =========================================
                RESTAURANT HEADER
            ========================================= */}
            <div
              style={{
                textAlign:
                  "center",
                borderBottom:
                  "1px solid #e5e7eb",
                paddingBottom:
                  "20px",
                marginBottom:
                  "20px",
              }}
            >
              <img
                src={titleLogo}
                alt={
                  RESTAURANT_NAME
                }
                style={{
                  width:
                    "75px",
                  height:
                    "75px",
                  objectFit:
                    "contain",
                  marginBottom:
                    "8px",
                }}
              />
              <h2
                style={{
                  margin:
                    "0 0 6px",
                  fontSize:
                    "25px",
                  fontWeight:
                    "700",
                }}
              >
                {
                  RESTAURANT_NAME
                }
              </h2>
              <p
                style={{
                  margin:
                    "0 auto 5px",
                  maxWidth:
                    "600px",
                  fontSize:
                    "13px",
                  color:
                    "#6b7280",
                }}
              >
                {
                  RESTAURANT_ADDRESS
                }
              </p>
              <p
                style={{
                  margin:
                    "0",
                  fontSize:
                    "13px",
                  color:
                    "#6b7280",
                }}
              >
                {
                  RESTAURANT_PHONE_1
                }
                {"  |  "}
                {
                  RESTAURANT_PHONE_2
                }
              </p>
            </div>
            {/* =========================================
                INVOICE INFORMATION
            ========================================= */}
            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap:
                  "12px 30px",
                marginBottom:
                  "25px",
              }}
            >
              <div>
                <strong>
                  Invoice No:
                </strong>{" "}
                {
                  selectedInvoice.invoiceNo ||
                  "-"
                }
              </div>
              <div>
                <strong>
                  Order No:
                </strong>{" "}
                {
                  selectedInvoice
                    .order
                    ?.orderNo ||
                  "-"
                }
              </div>
              <div>
                <strong>
                  Customer:
                </strong>{" "}
                {
                  selectedInvoice.customerName ||
                  "Walk-in"
                }
              </div>
              <div>
                <strong>
                  Table:
                </strong>{" "}
                {
                  selectedInvoice.tableName ||
                  "-"
                }
              </div>
              <div>
                <strong>
                  Date:
                </strong>{" "}
                {
                  formatInvoiceDate(
                    selectedInvoice
                  )
                }
              </div>
              <div>
                <strong>
                  Payment:
                </strong>{" "}
                {
                  selectedInvoice.paymentMethod ||
                  "-"
                }
              </div>
            </div>
            {/* =========================================
                ITEMS
            ========================================= */}
            <div
              style={{
                overflowX:
                  "auto",
              }}
            >
              <table
                style={{
                  width:
                    "100%",
                  borderCollapse:
                    "collapse",
                  marginBottom:
                    "20px",
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        textAlign:
                          "left",
                        padding:
                          "11px 10px",
                        borderBottom:
                          "2px solid #d1d5db",
                        fontSize:
                          "13px",
                      }}
                    >
                      Product
                    </th>
                    <th
                      style={{
                        textAlign:
                          "right",
                        padding:
                          "11px 10px",
                        borderBottom:
                          "2px solid #d1d5db",
                        fontSize:
                          "13px",
                      }}
                    >
                      Price
                    </th>
                    <th
                      style={{
                        textAlign:
                          "center",
                        padding:
                          "11px 10px",
                        borderBottom:
                          "2px solid #d1d5db",
                        fontSize:
                          "13px",
                      }}
                    >
                      Qty
                    </th>
                    <th
                      style={{
                        textAlign:
                          "right",
                        padding:
                          "11px 10px",
                        borderBottom:
                          "2px solid #d1d5db",
                        fontSize:
                          "13px",
                      }}
                    >
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(
                    selectedInvoice.items
                  ) &&
                  selectedInvoice.items.length >
                    0 ? (
                    selectedInvoice.items.map(
                      (
                        item,
                        index
                      ) => (
                        <tr
                          key={
                            `${selectedInvoice._id}-${index}`
                          }
                        >
                          <td
                            style={{
                              padding:
                                "12px 10px",
                              borderBottom:
                                "1px solid #e5e7eb",
                            }}
                          >
                            <div
                              style={{
                                fontWeight:
                                  "600",
                              }}
                            >
                              {
                                getProductDisplayText(
                                  item
                                )
                              }
                            </div>
                            {/* Optional base product name */}
                            {item?.name &&
                              item?.variant &&
                              item.name !==
                                item.variant && (
                                <div
                                  style={{
                                    fontSize:
                                      "12px",
                                    color:
                                      "#6b7280",
                                    marginTop:
                                      "3px",
                                  }}
                                >
                                  {
                                    item.name
                                  }
                                </div>
                              )}
                          </td>
                          <td
                            style={{
                              textAlign:
                                "right",
                              padding:
                                "12px 10px",
                              borderBottom:
                                "1px solid #e5e7eb",
                            }}
                          >
                            {formatPKR(
                              item?.unitPrice
                            )}
                          </td>
                          <td
                            style={{
                              textAlign:
                                "center",
                              padding:
                                "12px 10px",
                              borderBottom:
                                "1px solid #e5e7eb",
                            }}
                          >
                            {
                              item?.quantity
                            }
                          </td>
                          <td
                            style={{
                              textAlign:
                                "right",
                              padding:
                                "12px 10px",
                              borderBottom:
                                "1px solid #e5e7eb",
                              fontWeight:
                                "600",
                            }}
                          >
                            {formatPKR(
                              item?.total
                            )}
                          </td>
                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        style={{
                          textAlign:
                            "center",
                          padding:
                            "25px",
                          color:
                            "#6b7280",
                        }}
                      >
                        No item details available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* =========================================
                TOTALS
            ========================================= */}
            <div
              style={{
                marginLeft:
                  "auto",
                width:
                  "100%",
                maxWidth:
                  "350px",
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  padding:
                    "7px 0",
                }}
              >
                <strong>
                  Subtotal:
                </strong>
                <span>
                  {formatPKR(
                    selectedInvoice.subtotal
                  )}
                </span>
              </div>
              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  padding:
                    "7px 0",
                }}
              >
                <strong>
                  Tax:
                </strong>
                <span>
                  {formatPKR(
                    selectedInvoice.tax
                  )}
                </span>
              </div>
              {Number(
                selectedInvoice.discount ||
                  0
              ) > 0 && (
                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    padding:
                      "7px 0",
                  }}
                >
                  <strong>
                    Discount:
                  </strong>
                  <span>
                    -{" "}
                    {formatPKR(
                      selectedInvoice.discount
                    )}
                  </span>
                </div>
              )}
              <div
                style={{
                  borderTop:
                    "2px solid #111827",
                  marginTop:
                    "8px",
                  paddingTop:
                    "12px",
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  fontSize:
                    "18px",
                }}
              >
                <strong>
                  Total:
                </strong>
                <strong>
                  {formatPKR(
                    selectedInvoice.total
                  )}
                </strong>
              </div>
            </div>
            {/* =========================================
                FOOTER / ACTIONS
            ========================================= */}
            <div
              style={{
                marginTop:
                  "30px",
                paddingTop:
                  "20px",
                borderTop:
                  "1px solid #e5e7eb",
                display:
                  "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                gap:
                  "12px",
                flexWrap:
                  "wrap",
              }}
            >
              <div
                style={{
                  fontSize:
                    "13px",
                  color:
                    "#6b7280",
                }}
              >
                Thank you for visiting!
              </div>
              <div
                style={{
                  display:
                    "flex",
                  gap:
                    "8px",
                  flexWrap:
                    "wrap",
                }}
              >
                <Button
                  variant="secondary"
                  onClick={() =>
                    generateInvoicePDF(
                      selectedInvoice
                    )
                  }
                >
                  PDF
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => printInvoice(selectedInvoice)}
                >
                  Print
                </Button>
                <Button
                  variant="danger"
                  disabled={
                    deletingInvoiceId ===
                    selectedInvoice._id
                  }
                  onClick={() =>
                    deleteInvoice(
                      selectedInvoice
                    )
                  }
                >
                  {deletingInvoiceId ===
                  selectedInvoice._id
                    ? "Deleting..."
                    : "Delete"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={
                    closeInvoiceView
                  }
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
