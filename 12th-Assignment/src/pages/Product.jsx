import { useState } from "react";
import { Package, Pencil, Plus, Trash2, X } from "lucide-react";

import { initialProducts } from "../data/dashboardData";

const emptyProduct = {
  name: "",
  category: "",
  price: "",
  stock: "",
  color: "#7257f5",
};

function Product() {
  const [products, setProducts] = useState(initialProducts);

  const [formData, setFormData] = useState(emptyProduct);

  const [editingProductId, setEditingProductId] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  function openAddProductModal() {
    setEditingProductId(null);
    setFormData(emptyProduct);
    setIsModalOpen(true);
  }

  function openEditProductModal(product) {
    setEditingProductId(product.id);

    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      color: product.color,
    });

    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingProductId(null);
    setFormData(emptyProduct);
  }

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function handleFormSubmit(event) {
    event.preventDefault();

    const preparedProduct = {
      name: formData.name.trim(),
      category: formData.category.trim(),
      price: Number(formData.price),
      stock: Number(formData.stock),
      color: formData.color,
    };

    if (editingProductId !== null) {
      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === editingProductId
            ? {
                ...product,
                ...preparedProduct,
              }
            : product,
        ),
      );
    } else {
      const nextProductId =
        products.length > 0
          ? Math.max(...products.map((product) => product.id)) + 1
          : 1;

      const newProduct = {
        id: nextProductId,
        ...preparedProduct,
      };

      setProducts((currentProducts) => [...currentProducts, newProduct]);
    }

    closeModal();
  }

  function deleteProduct(productId) {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!shouldDelete) {
      return;
    }

    setProducts((currentProducts) =>
      currentProducts.filter((product) => product.id !== productId),
    );
  }

  return (
    <div className="page products-page">
      <div className="page-heading">
        <div>
          <h1>Products</h1>

          <p>Add products and keep prices or stock up to date.</p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={openAddProductModal}
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {products.length > 0 ? (
        <section className="products-grid">
          {products.map((product) => (
            <article className="product-card" key={product.id}>
              <div
                className="product-image"
                style={{
                  background: `linear-gradient(
                    145deg,
                    ${product.color}40,
                    ${product.color}10
                  )`,
                }}
              >
                <Package
                  size={62}
                  strokeWidth={1.4}
                  style={{
                    color: product.color,
                  }}
                />
              </div>

              <div className="product-content">
                <span className="product-category">{product.category}</span>

                <h2>{product.name}</h2>

                <div className="product-details">
                  <strong>${product.price.toFixed(2)}</strong>

                  <small className={product.stock < 10 ? "low-stock" : ""}>
                    {product.stock} in stock
                  </small>
                </div>
              </div>

              <div className="product-actions">
                <button
                  type="button"
                  onClick={() => openEditProductModal(product)}
                >
                  <Pencil size={16} />
                  Edit
                </button>

                <button
                  type="button"
                  className="delete-button"
                  onClick={() => deleteProduct(product.id)}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className="empty-products">
          <Package size={48} />

          <h2>No products available</h2>

          <p>Add your first product to display it here.</p>

          <button
            type="button"
            className="primary-button"
            onClick={openAddProductModal}
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>
      )}

      {isModalOpen && (
        <div
          className="modal-overlay"
          role="presentation"
          onMouseDown={closeModal}
        >
          <div
            className="product-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2 id="product-modal-title">
                  {editingProductId !== null ? "Edit Product" : "Add Product"}
                </h2>

                <p>Enter the product information below.</p>
              </div>

              <button
                type="button"
                className="modal-close"
                aria-label="Close modal"
                onClick={closeModal}
              >
                <X size={21} />
              </button>
            </div>

            <form className="product-form" onSubmit={handleFormSubmit}>
              <label className="full-field">
                <span>Product Name</span>

                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  placeholder="Classic Cotton Hoodie"
                  onChange={handleInputChange}
                />
              </label>

              <label>
                <span>Category</span>

                <input
                  required
                  type="text"
                  name="category"
                  value={formData.category}
                  placeholder="Hoodies"
                  onChange={handleInputChange}
                />
              </label>

              <label>
                <span>Price ($)</span>

                <input
                  required
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  placeholder="68"
                  onChange={handleInputChange}
                />
              </label>

              <label>
                <span>Stock</span>

                <input
                  required
                  type="number"
                  name="stock"
                  min="0"
                  step="1"
                  value={formData.stock}
                  placeholder="42"
                  onChange={handleInputChange}
                />
              </label>

              <label>
                <span>Card Color</span>

                <input
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                />
              </label>

              <div className="form-actions full-field">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button type="submit" className="primary-button">
                  {editingProductId !== null ? "Save Changes" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <p className="frontend-notice">
        Product changes are temporary and will reset when the page is refreshed.
      </p>
    </div>
  );
}

export default Product;
