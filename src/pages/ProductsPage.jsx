import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import { useT } from "../LanguageContext.jsx";

function formatPrice(n, currency) {
  if (n == null) return "—";
  return `${Number(n).toLocaleString("az")} ${currency || "AZN"}`;
}

function AddEditModal({ product, onClose, onSave }) {
  const tr = useT();
  const [mode, setMode] = useState("manual");
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product?.price ?? "");
  const [currency, setCurrency] = useState(product?.currency || "AZN");
  const [sku, setSku] = useState(product?.sku || "");
  const [tags, setTags] = useState((product?.tags || []).join(", "));
  const [status, setStatus] = useState(product?.status || "ACTIVE");
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [csvText, setCsvText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setError(""); setSaving(true);
    try {
      if (mode === "manual") {
        if (!name.trim()) throw new Error(tr("productNameRequired", "Product name is required"));
        const body = { name: name.trim(), description: description.trim(), price: price ? parseFloat(price) : null, currency: currency.trim() || "AZN", sku: sku.trim() || null, tags: tags.split(",").map(t => t.trim()).filter(Boolean), status };
        const saved = product ? await api.updateProduct(product.id, body) : await api.createProduct(body);
        onSave(saved);
      } else if (mode === "url") {
        if (!scrapeUrl.trim()) throw new Error(tr("urlRequired", "URL is required"));
        const saved = await api.scrapeProductUrl(scrapeUrl.trim());
        onSave(saved);
      } else if (mode === "csv") {
        if (!csvText.trim()) throw new Error(tr("csvEmpty", "CSV is empty"));
        const result = await api.importProductsCsv(csvText);
        onSave(result);
      }
    } catch (e) { setError(e.message || tr("error", "Error")); } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-[700px] rounded-[16px] bg-white p-6 shadow-xl">
        <button onClick={onClose} className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#334155] shadow">✕</button>
        <div className="text-[18px] font-semibold">{product ? tr("editProduct", "Edit") : tr("addProduct", "Add product")}</div>
        {!product && (
          <div className="mt-4 flex gap-2">
            <button onClick={() => setMode("manual")} className={`rounded-[10px] border px-3 py-1.5 text-[12px] ${mode === "manual" ? "border-[#2563eb] bg-[#eff6ff] text-[#2563eb]" : "border-[#dfe5ee] bg-white text-[#64748b]"}`}>✍ {tr("productManual", "Manual")}</button>
            <button onClick={() => setMode("url")} className={`rounded-[10px] border px-3 py-1.5 text-[12px] ${mode === "url" ? "border-[#2563eb] bg-[#eff6ff] text-[#2563eb]" : "border-[#dfe5ee] bg-white text-[#64748b]"}`}>🌐 {tr("productUrl", "URL")}</button>
            <button onClick={() => setMode("csv")} className={`rounded-[10px] border px-3 py-1.5 text-[12px] ${mode === "csv" ? "border-[#2563eb] bg-[#eff6ff] text-[#2563eb]" : "border-[#dfe5ee] bg-white text-[#64748b]"}`}>📄 {tr("productCsv", "CSV")}</button>
          </div>
        )}
        {error && <div className="mt-3 rounded-[8px] bg-[#fef2f2] px-3 py-2 text-[12px] text-[#b91c1c]">{error}</div>}
        {mode === "manual" && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("name", "Name")}</label><input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-[10px] border border-[#e5eaf1] px-3 py-2 text-[13px] focus:border-[#2563eb] focus:outline-none" /></div>
            <div className="col-span-2"><label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("description", "Description")}</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full rounded-[10px] border border-[#e5eaf1] px-3 py-2 text-[13px] focus:border-[#2563eb] focus:outline-none" /></div>
            <div><label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("price", "Price")}</label><input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full rounded-[10px] border border-[#e5eaf1] px-3 py-2 text-[13px] focus:border-[#2563eb] focus:outline-none" /></div>
            <div><label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("currency", "Currency")}</label><select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full rounded-[10px] border border-[#e5eaf1] px-3 py-2 text-[13px] focus:border-[#2563eb] focus:outline-none"><option>AZN</option><option>USD</option><option>EUR</option></select></div>
            <div><label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("sku", "SKU")}</label><input value={sku} onChange={e => setSku(e.target.value)} className="w-full rounded-[10px] border border-[#e5eaf1] px-3 py-2 text-[13px] focus:border-[#2563eb] focus:outline-none" /></div>
            <div><label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("tags", "Tags")}</label><input value={tags} onChange={e => setTags(e.target.value)} placeholder="tag1, tag2..." className="w-full rounded-[10px] border border-[#e5eaf1] px-3 py-2 text-[13px] focus:border-[#2563eb] focus:outline-none" /></div>
            <div className="col-span-2"><label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("status", "Status")}</label><select value={status} onChange={e => setStatus(e.target.value)} className="w-full rounded-[10px] border border-[#e5eaf1] px-3 py-2 text-[13px] focus:border-[#2563eb] focus:outline-none"><option value="ACTIVE">{tr("productStatusActive", "Active")}</option><option value="DRAFT">{tr("productStatusDraft", "Draft")}</option><option value="ARCHIVED">{tr("productStatusArchived", "Archived")}</option></select></div>
          </div>
        )}
        {mode === "url" && (
          <div className="mt-4"><label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("productUrlLabel", "Product page URL")}</label><input value={scrapeUrl} onChange={e => setScrapeUrl(e.target.value)} placeholder="https://example.com/products/..." className="w-full rounded-[10px] border border-[#e5eaf1] px-3 py-2 text-[13px] focus:border-[#2563eb] focus:outline-none" /></div>
        )}
        {mode === "csv" && (
          <div className="mt-4"><label className="mb-1 block text-[12px] font-medium text-[#334155]">{tr("productCsvLabel", "CSV data")}</label><textarea value={csvText} onChange={e => setCsvText(e.target.value)} rows={6} placeholder={`name,description,price,currency,sku,tags
Product A,Description,199,AZN,SKU001,tag1`} className="w-full rounded-[10px] border border-[#e5eaf1] px-3 py-2 text-[13px] focus:border-[#2563eb] focus:outline-none" /></div>
        )}
        <div className="mt-5 flex items-center justify-end gap-2">
          <button onClick={onClose} className="rounded-[10px] border border-[#e5eaf1] bg-white px-4 py-2 text-[13px] font-medium text-[#334155] hover:bg-[#f8fafc]">{tr("cancel", "Cancel")}</button>
          <button disabled={saving} onClick={handleSave} className="rounded-[10px] bg-[#2563eb] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#1d4ed8]">{saving ? tr("saving", "Saving...") : tr("save", "Save")}</button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const tr = useT();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    try { setLoading(true); const list = await api.listProducts(); setProducts(list); } catch (e) { console.error(e); } finally { setLoading(false); }
  }
  async function handleDelete(id) {
    if (!confirm(tr("confirmDelete", "Delete?"))) return;
    try { await api.deleteProduct(id); setProducts(p => p.filter(x => x.id !== id)); } catch (e) { alert(e.message); }
  }

  const filtered = useMemo(() => {
    if (!q.trim()) return products;
    const term = q.toLowerCase();
    return products.filter(p => (p.name || "").toLowerCase().includes(term));
  }, [products, q]);

  return (
    <div className="flex min-h-0 flex-1 bg-[#f6f8fb]">
      <div className="min-h-0 flex-1 overflow-auto p-4">
        <div className="mx-auto max-w-[900px]">
          <div className="flex items-center justify-between">
            <h1 className="text-[20px] font-semibold text-[#111827]">{tr("pageProducts", "Products")}</h1>
            <button onClick={() => setShowAdd(true)} className="rounded-[10px] bg-[#2563eb] px-4 py-2 text-[13px] font-medium text-white">+ {tr("addProduct", "Add product")}</button>
          </div>
          <div className="mt-4">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder={tr("searchProducts", "Search products...")} className="w-full rounded-[10px] border border-[#e5eaf1] bg-white px-3 py-2 text-[13px]" />
          </div>
          <div className="mt-4 rounded-[12px] border border-[#e5eaf1] bg-white">
            <div className="grid grid-cols-12 gap-3 border-b border-[#e5eaf1] px-4 py-3 text-[12px] font-medium text-[#64748b]">
              <div className="col-span-4">{tr("product", "Product")}</div>
              <div className="col-span-2">{tr("price", "Price")}</div>
              <div className="col-span-3">{tr("skuOrTags", "SKU / Tags")}</div>
              <div className="col-span-2">{tr("status", "Status")}</div>
              <div className="col-span-1"></div>
            </div>
            {loading ? <div className="px-4 py-8 text-center text-[13px] text-[#64748b]">{tr("loading", "Loading...")}</div> :
             filtered.length === 0 ? <div className="px-4 py-8 text-center text-[13px] text-[#64748b]">{tr("noProducts", "No products")}</div> :
             filtered.map(p => (
              <div key={p.id} className="grid grid-cols-12 items-center gap-3 border-b border-[#f1f5f9] px-4 py-3 hover:bg-[#f8fafc]">
                <div className="col-span-4">
                  <div className="text-[13px] font-medium text-[#111827]">{p.name}</div>
                  <div className="text-[12px] text-[#64748b] line-clamp-1">{p.description}</div>
                </div>
                <div className="col-span-2 text-[13px]">{formatPrice(p.price, p.currency)}</div>
                <div className="col-span-3 text-[12px] text-[#64748b]">{p.sku}</div>
                <div className="col-span-2"><span className={`rounded-full px-2 py-0.5 text-[11px] ${p.status === "ACTIVE" ? "bg-[#dcfce7] text-[#166534]" : "bg-[#f1f5f9] text-[#475569]"}`}>{tr("productStatus" + p.status.charAt(0).toUpperCase() + p.status.slice(1).toLowerCase(), p.status)}</span></div>
                <div className="col-span-1 text-right"><button onClick={() => setEditing(p)} className="text-[12px] text-[#2563eb] mr-2">{tr("edit", "Edit")}</button><button onClick={() => handleDelete(p.id)} className="text-[12px] text-[#ef4444]">{tr("del", "Del")}</button></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showAdd && <AddEditModal onClose={() => setShowAdd(false)} onSave={() => { setShowAdd(false); loadProducts(); }} />}
      {editing && <AddEditModal product={editing} onClose={() => setEditing(null)} onSave={() => { setEditing(null); loadProducts(); }} />}
    </div>
  );
}
