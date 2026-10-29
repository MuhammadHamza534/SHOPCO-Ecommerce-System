/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { AlertTriangle, Package, Pencil, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { adminApi } from "../lib/supabase";
import ProductImagesField, { validateImageFiles } from "../components/ProductImagesField";

const emptyProduct = {
  name: "", slug: "", sku: "", category_id: "", description: "", regular_price: "", sale_price: "",
  stock_quantity: "", low_stock_threshold: 5, status: "draft", visibility: true,
};
const emptyCategory = { name: "", slug: "", description: "", parent_id: null, is_active: true, display_order: 0 };

function toSlug(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function messageFor(error, field) {
  const message = error?.message || "Unable to save product.";
  if (/products_slug_key|duplicate key.*slug/i.test(message)) return "That product slug is already in use. Choose a different URL slug.";
  if (/products_sku_key|duplicate key.*sku/i.test(message)) return "That SKU is already in use. Choose a different SKU.";
  return field ? `${field}: ${message}` : message;
}

function ProductsManager() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [editingId, setEditingId] = useState(null);
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [images, setImages] = useState([]);
  const [pendingImages, setPendingImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState("");
  const [primaryPendingPreview, setPrimaryPendingPreview] = useState("");
  const [productFilter, setProductFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function loadCategories() {
    setCategoriesLoading(true);
    try {
      const rows = await adminApi.categories();
      setCategories((Array.isArray(rows) ? rows : []).filter((category) => category.is_active));
      return rows;
    } catch (loadError) {
      setError(messageFor(loadError, "Categories could not load"));
      return [];
    } finally {
      setCategoriesLoading(false);
    }
  }

  async function loadProducts() {
    setLoading(true);
    try {
      const rows = await adminApi.products();
      setProducts(Array.isArray(rows) ? rows : []);
    } catch (loadError) {
      setError(messageFor(loadError, "Products could not load"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  function openProduct(product = null) {
    setError("");
    setSuccess("");
    setEditingId(product?.id || null);
    setSlugEdited(Boolean(product));
    setForm(product ? {
      ...emptyProduct,
      ...product,
      category_id: product.category_id || "",
      regular_price: product.regular_price ?? "",
      sale_price: product.sale_price ?? "",
      stock_quantity: product.stock_quantity ?? "",
    } : emptyProduct);
    setImages([]);
    setPendingImages([]);
    setUploadProgress("");
    setPrimaryPendingPreview("");
    if (product?.id) adminApi.images(product.id).then((rows) => setImages(Array.isArray(rows) ? rows : [])).catch((loadError) => setError(messageFor(loadError, "Product images could not load")));
    setProductModalOpen(true);
  }

  function closeProduct() {
    setProductModalOpen(false);
    setEditingId(null);
    pendingImages.forEach((image) => URL.revokeObjectURL(image.preview));
    setPendingImages([]);
    setPrimaryPendingPreview("");
  }

  function addImages(files) {
    const accepted = validateImageFiles(files);
    if (accepted.length !== files.length) setError("Only JPG, PNG, WebP, or GIF files up to 5 MB can be added.");
    setPendingImages((current) => [...current, ...accepted.map((file) => ({ file, preview: URL.createObjectURL(file) }))]);
  }

  async function removeExistingImage(image) {
    setError("");
    try { await adminApi.removeProductImage(image); setImages((current) => current.filter((item) => item.id !== image.id)); }
    catch (removeError) { setError(messageFor(removeError, "Image could not be removed")); }
  }

  async function replaceExistingImage(image, file) {
    setError("");
    try { const updated = await adminApi.replaceProductImage(image, file); setImages((current) => current.map((item) => item.id === image.id ? { ...item, ...updated } : item)); setSuccess("Product image replaced."); }
    catch (replaceError) { setError(messageFor(replaceError, "Image could not be replaced")); }
  }

  function removePendingImage(image) { URL.revokeObjectURL(image.preview); if (primaryPendingPreview === image.preview) setPrimaryPendingPreview(""); setPendingImages((current) => current.filter((item) => item.preview !== image.preview)); }

  async function makePrimary(image) {
    const ordered = image.existing ? [image, ...images.filter((item) => item.id !== image.id)] : images;
    if (!image.existing) { setPrimaryPendingPreview(image.preview); return; }
    setImages(ordered);
    try { await Promise.all(ordered.map((item, position) => adminApi.updateImage(item.id, { position }))); }
    catch (updateError) { setError(messageFor(updateError, "Image order could not be saved")); }
  }

  async function moveImage(image, direction) {
    if (!image.existing) {
      setPendingImages((current) => { const index = current.findIndex((item) => item.preview === image.preview); const next = index + direction; if (index < 0 || next < 0 || next >= current.length) return current; const copy = [...current]; [copy[index], copy[next]] = [copy[next], copy[index]]; return copy; });
      return;
    }
    const index = images.findIndex((item) => item.id === image.id); const next = index + direction;
    if (index < 0 || next < 0 || next >= images.length) return;
    const reordered = [...images]; [reordered[index], reordered[next]] = [reordered[next], reordered[index]]; setImages(reordered);
    try { await Promise.all(reordered.map((item, position) => adminApi.updateImage(item.id, { position }))); } catch (moveError) { setError(messageFor(moveError, "Image order could not be saved")); }
  }

  function changeProduct(event) {
    const { name, value, type, checked } = event.target;
    if (name === "name") {
      setForm((current) => ({ ...current, name: value, slug: slugEdited ? current.slug : toSlug(value) }));
      return;
    }
    if (name === "slug") setSlugEdited(true);
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  async function validateUnique(field, value) {
    const rows = await adminApi.findProducts(field, value);
    return !rows.some((row) => row.id !== editingId);
  }

  async function saveProduct(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    const slug = toSlug(form.slug);
    const regularPrice = Number(form.regular_price);
    const salePrice = form.sale_price === "" ? null : Number(form.sale_price);
    const stock = Number(form.stock_quantity);
    const threshold = Number(form.low_stock_threshold);

    if (!form.name.trim()) return setError("Product name is required.");
    if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return setError("Slug must contain lowercase letters, numbers, and single hyphens only.");
    if (!form.sku.trim()) return setError("SKU is required.");
    if (!form.category_id) return setError("Choose a category before saving this product.");
    if (!Number.isFinite(regularPrice) || regularPrice < 0) return setError("Regular price must be zero or greater.");
    if (salePrice !== null && (!Number.isFinite(salePrice) || salePrice < 0 || salePrice > regularPrice)) return setError("Sale price must be zero or greater and cannot exceed the regular price.");
    if (!Number.isInteger(stock) || stock < 0) return setError("Stock quantity must be a whole number of zero or greater.");
    if (!Number.isInteger(threshold) || threshold < 0) return setError("Low-stock threshold must be a whole number of zero or greater.");

    setSaving(true);
    try {
      const [slugAvailable, skuAvailable] = await Promise.all([
        validateUnique("slug", slug),
        validateUnique("sku", form.sku.trim()),
      ]);
      if (!slugAvailable) throw new Error("That product slug is already in use. Choose a different URL slug.");
      if (!skuAvailable) throw new Error("That SKU is already in use. Choose a different SKU.");
      const savedRows = await adminApi.saveProduct({
        ...form,
        slug,
        sku: form.sku.trim(),
        name: form.name.trim(),
        description: form.description.trim(),
        regular_price: regularPrice,
        sale_price: salePrice,
        stock_quantity: stock,
        low_stock_threshold: threshold,
      });
      const savedProduct = Array.isArray(savedRows) ? savedRows[0] : savedRows;
      const productId = savedProduct?.id || editingId;
      if (!productId) throw new Error("Product was saved, but its ID was not returned for image upload.");
      const pendingQueue = primaryPendingPreview ? [...pendingImages.filter((image) => image.preview === primaryPendingPreview), ...pendingImages.filter((image) => image.preview !== primaryPendingPreview)] : pendingImages;
      const uploadedImages = [];
      for (const [index, image] of pendingQueue.entries()) {
        setUploadProgress(`Uploading image ${index + 1} of ${pendingImages.length}…`);
        const uploaded = await adminApi.uploadProductImage(productId, image.file, primaryPendingPreview ? index : images.length + index);
        uploadedImages.push(Array.isArray(uploaded) ? uploaded[0] : uploaded);
        URL.revokeObjectURL(image.preview);
      }
      if (primaryPendingPreview && uploadedImages.length) await Promise.all([...uploadedImages.slice(0, 1), ...images, ...uploadedImages.slice(1)].filter(Boolean).map((image, position) => adminApi.updateImage(image.id, { position })));
      setPendingImages([]);
      setUploadProgress("");
      setPrimaryPendingPreview("");
      closeProduct();
      setSuccess(editingId ? "Product changes and images were saved." : "Product and selected images were created and saved.");
      await loadProducts();
    } catch (saveError) {
      setError(messageFor(saveError, pendingImages.length ? "Product details were saved if no earlier validation failed; queued image upload can be retried" : undefined));
    } finally {
      setSaving(false);
    }
  }

  async function saveCategory(event) {
    event.preventDefault();
    const name = categoryForm.name.trim();
    const slug = toSlug(categoryForm.slug || name);
    if (!name || !slug) return setError("Category name and slug are required.");
    setSavingCategory(true);
    try {
      const saved = await adminApi.saveCategory({ ...categoryForm, name, slug });
      const category = Array.isArray(saved) ? saved[0] : saved;
      await loadCategories();
      if (category?.id) setForm((current) => ({ ...current, category_id: category.id }));
      setCategoryForm(emptyCategory);
      setCategoryModalOpen(false);
      setSuccess(`Category “${name}” was created and selected.`);
    } catch (saveError) {
      setError(messageFor(saveError, "Category could not be saved"));
    } finally {
      setSavingCategory(false);
    }
  }

  async function archiveProduct(id) {
    if (!window.confirm("Archive this product? It will be hidden from customers but preserved for order history.")) return;
    setError("");
    try {
      await adminApi.archiveProduct(id);
      setSuccess("Product archived.");
      await loadProducts();
    } catch (archiveError) {
      setError(messageFor(archiveError));
    }
  }

  async function restoreProduct(id) {
    setError("");
    try { await adminApi.restoreProduct(id); setSuccess("Product restored as a draft. Review it before publishing."); await loadProducts(); }
    catch (restoreError) { setError(messageFor(restoreError)); }
  }

  async function deleteProduct() {
    if (!deleteTarget) return;
    setSaving(true); setError("");
    try { const result = await adminApi.deleteProduct(deleteTarget.id); setDeleteTarget(null); setSuccess(result.cleanupErrors?.length ? "Product was deleted. Some unreferenced storage objects need manual cleanup." : "Product permanently deleted."); await loadProducts(); }
    catch (deleteError) { setError(messageFor(deleteError)); }
    finally { setSaving(false); }
  }

  const visibleProducts = products.filter((product) => productFilter === "all" || product.status === productFilter);

  return (
    <div className="page products-page">
      <div className="page-heading">
        <div><h1>Products</h1><p>Manage the live SHOP.CO catalog.</p></div>
        <div className="product-toolbar"><select value={productFilter} onChange={(event) => setProductFilter(event.target.value)}><option value="all">All Products</option><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option></select><button type="button" className="primary-button" onClick={() => openProduct()}><Plus size={18} />Add Product</button></div>
      </div>
      {error && <p className="auth-message error">{error}</p>}
      {success && <p className="auth-message">{success}</p>}
      {loading ? <p>Loading products…</p> : visibleProducts.length ? (
        <section className="products-grid">
          {visibleProducts.map((product) => {
            const image = product.product_images?.slice().sort((a, b) => a.position - b.position)[0]?.url;
            const amount = Number(product.sale_price ?? product.regular_price);
            return <article className="product-card" key={product.id}>
              <div className="product-image">{image ? <img src={image} alt="" /> : <Package size={62} strokeWidth={1.4} />}</div>
              <div className="product-content"><span className="product-category">{product.category?.name || "Uncategorized"}</span><h2>{product.name}</h2><div className="product-details"><strong>${amount.toFixed(2)}</strong><small className={product.stock_quantity <= product.low_stock_threshold ? "low-stock" : ""}>{product.stock_quantity} in stock</small></div><small>{product.status} · {product.sku}</small></div>
              <div className="product-actions"><button type="button" onClick={() => openProduct(product)}><Pencil size={16} />Edit</button><Link to={`/products/${product.id}/images`}>Images</Link>{product.status === "archived" ? <button type="button" onClick={() => restoreProduct(product.id)}><RotateCcw size={16} />Restore</button> : <button type="button" className="delete-button" onClick={() => archiveProduct(product.id)}><Trash2 size={16} />Archive</button>}<button type="button" className="delete-button product-hard-delete" onClick={() => setDeleteTarget(product)}><Trash2 size={16} />Delete</button></div>
            </article>;
          })}
        </section>
      ) : <div className="empty-products"><Package size={48} /><h2>No products available</h2><p>Create a category, then add your first product.</p></div>}

      {isProductModalOpen && <div className="modal-overlay" onMouseDown={closeProduct}>
        <div className="product-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title" onMouseDown={(event) => event.stopPropagation()}>
          <div className="modal-header"><div><h2 id="product-modal-title">{editingId ? "Edit Product" : "Add Product"}</h2><p>Required catalog data is saved to Supabase.</p></div><button type="button" className="modal-close" aria-label="Close" onClick={closeProduct}><X size={21} /></button></div>
          <form className="product-form" onSubmit={saveProduct}>
            <label className="full-field"><span>Product Name</span><input required name="name" value={form.name} onChange={changeProduct} /></label>
            <label><span>Slug</span><input required name="slug" value={form.slug} onChange={changeProduct} /><small>Generated from the name until you edit it.</small></label>
            <label><span>SKU</span><input required name="sku" value={form.sku} onChange={changeProduct} /></label>
            <label className="full-field"><span>Description</span><textarea name="description" value={form.description || ""} onChange={changeProduct} /></label>
            <label><span>Category</span><select required name="category_id" value={form.category_id} onChange={changeProduct} disabled={categoriesLoading}><option value="">{categoriesLoading ? "Loading categories…" : "Choose category"}</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select>{!categoriesLoading && categories.length === 0 && <small>No categories available. Create a category first.</small>}</label>
            <div className="category-shortcut"><span>Need a category?</span><button type="button" className="secondary-button" onClick={() => { setCategoryForm(emptyCategory); setCategoryModalOpen(true); }}><Plus size={15} />Add Category</button></div>
            <label><span>Regular Price</span><input required min="0" step="0.01" type="number" name="regular_price" value={form.regular_price} onChange={changeProduct} /></label>
            <label><span>Sale Price</span><input min="0" step="0.01" type="number" name="sale_price" value={form.sale_price ?? ""} onChange={changeProduct} /></label>
            <label><span>Stock Quantity</span><input required min="0" step="1" type="number" name="stock_quantity" value={form.stock_quantity} onChange={changeProduct} /></label>
            <label><span>Low-Stock Threshold</span><input required min="0" step="1" type="number" name="low_stock_threshold" value={form.low_stock_threshold} onChange={changeProduct} /></label>
            <label><span>Publishing Status</span><select name="status" value={form.status} onChange={changeProduct}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
            <label><span>Visible to Customers</span><input type="checkbox" name="visibility" checked={form.visibility} onChange={changeProduct} /></label>
            <ProductImagesField images={images} pendingImages={pendingImages} primaryPendingPreview={primaryPendingPreview} onAdd={addImages} onRemoveExisting={removeExistingImage} onReplaceExisting={replaceExistingImage} onRemovePending={removePendingImage} onMakePrimary={makePrimary} onMove={moveImage} busy={saving} progress={uploadProgress} />
            {error && <p className="auth-message error full-field" role="alert">{error}</p>}
            {success && <p className="auth-message full-field" role="status">{success}</p>}
            <div className="form-actions full-field"><button type="button" className="secondary-button" onClick={closeProduct}>Cancel</button><button type="submit" className="primary-button" disabled={saving}>{saving ? "Saving…" : "Save Product"}</button></div>
          </form>
        </div>
      </div>}

      {isCategoryModalOpen && <div className="modal-overlay" onMouseDown={() => setCategoryModalOpen(false)}>
        <div className="product-modal" role="dialog" aria-modal="true" aria-labelledby="quick-category-title" onMouseDown={(event) => event.stopPropagation()}>
          <div className="modal-header"><div><h2 id="quick-category-title">Add Category</h2><p>Your product draft will remain open.</p></div><button type="button" className="modal-close" aria-label="Close" onClick={() => setCategoryModalOpen(false)}><X size={21} /></button></div>
          <form className="product-form" onSubmit={saveCategory}>
            <label className="full-field"><span>Category Name</span><input required value={categoryForm.name} onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value, slug: toSlug(event.target.value) }))} /></label>
            <label className="full-field"><span>Slug</span><input required value={categoryForm.slug} onChange={(event) => setCategoryForm((current) => ({ ...current, slug: event.target.value }))} /></label>
            <label className="full-field"><span>Description</span><textarea value={categoryForm.description} onChange={(event) => setCategoryForm((current) => ({ ...current, description: event.target.value }))} /></label>
            <div className="form-actions full-field"><button type="button" className="secondary-button" onClick={() => setCategoryModalOpen(false)}>Cancel</button><button type="submit" className="primary-button" disabled={savingCategory}>{savingCategory ? "Creating…" : "Create & Select Category"}</button></div>
          </form>
        </div>
      </div>}

      {deleteTarget && <div className="modal-overlay" onMouseDown={() => !saving && setDeleteTarget(null)}><div className="product-modal danger-modal" role="dialog" aria-modal="true" aria-labelledby="delete-product-title" onMouseDown={(event) => event.stopPropagation()}><div className="modal-header"><div><h2 id="delete-product-title"><AlertTriangle size={20}/>Delete product permanently?</h2><p>This cannot be undone. Products with order or inventory history are protected and must be archived instead.</p></div><button type="button" className="modal-close" disabled={saving} onClick={() => setDeleteTarget(null)}><X size={21}/></button></div><div className="delete-product-preview">{deleteTarget.product_images?.[0]?.url ? <img src={deleteTarget.product_images[0].url} alt=""/> : <Package size={34}/>}<div><strong>{deleteTarget.name}</strong><small>SKU: {deleteTarget.sku}</small></div></div><p className="danger-copy">Deleting removes the product, its variants, and its database image records. Historical orders are never removed.</p><div className="form-actions"><button type="button" className="secondary-button" disabled={saving} onClick={() => setDeleteTarget(null)}>Cancel</button><button type="button" className="danger-button" disabled={saving} onClick={deleteProduct}>{saving ? "Deleting…" : "Delete Permanently"}</button></div></div></div>}
    </div>
  );
}

export default ProductsManager;
