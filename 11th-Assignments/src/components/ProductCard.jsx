import { Link } from "react-router-dom";
import { discountPercent, formatMoney, oldPrice, price, productImage } from "../lib/catalog";
import { useShop } from "../context/ShopContext";

function Rating({ rating }) {
  const numeric = Number(rating || 0);
  if (!numeric) return <span className="product-new-badge">New</span>;
  return <span className="product-card-rating" aria-label={`${numeric} out of 5 stars`}>★ {numeric.toFixed(1)}</span>;
}

export default function ProductCard({ product, allowQuickAdd = false }) {
  const { addToCart } = useShop();
  const image = productImage(product);
  const discount = discountPercent(product);
  const variants = product.product_variants || [];
  const canQuickAdd = !variants.length && Number(product.stock_quantity) > 0;

  function quickAdd(event) {
    event.preventDefault();
    event.stopPropagation();
    const variant = variants.find((item) => Number(item.stock_quantity) > 0);
    addToCart({
      id: product.id,
      variant_id: variant?.id || null,
      name: product.name,
      image,
      price: Number(variant?.price_override ?? price(product)),
      currency: product.currency || "USD",
      size: variant?.size || "Standard",
      color: variant?.color || "Default",
      quantity: 1,
    });
  }

  return <article className="shop-product-card">
    <Link className="shop-product-card__link" to={`/product/${product.slug}`}>
      <div className="shop-product-card__image-wrap">
        {image ? <img src={image} alt={product.name} loading="lazy" /> : <span className="shop-product-card__placeholder" aria-label="No product image available">SHOP.CO</span>}
        {discount > 0 && <span className="shop-product-card__discount">-{discount}%</span>}
      </div>
      <h3>{product.name}</h3>
      <Rating rating={product.rating} />
      <div className="shop-product-card__price">
        <strong>{formatMoney(price(product), product.currency)}</strong>
        {oldPrice(product) && <del>{formatMoney(oldPrice(product), product.currency)}</del>}
      </div>
    </Link>
    {allowQuickAdd && (variants.length ? <Link className="shop-product-card__quick-add shop-product-card__quick-add--link" to={`/product/${product.slug}`}>Choose options</Link> : <button type="button" className="shop-product-card__quick-add" disabled={!canQuickAdd} onClick={quickAdd}>{canQuickAdd ? "Quick add" : "Out of stock"}</button>)}
  </article>;
}
