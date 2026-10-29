import { Link, Navigate } from "react-router-dom";
import StorePage from "../components/StorePage";
import { formatMoney } from "../lib/catalog";

export default function OrderConfirmation() {
  const confirmation = (() => { try { return JSON.parse(sessionStorage.getItem("shopco-order-confirmation") || "null"); } catch { return null; } })();
  if (!confirmation) return <Navigate to="/" replace />;
  return <StorePage className="confirmation-page"><section className="store-shell confirmation-card"><span className="confirmation-card__icon">✓</span><p>Cash on delivery</p><h1>Order placed successfully</h1><p className="confirmation-card__intro">Thank you. We’ll contact you to confirm delivery for order <strong>#{confirmation.order_number}</strong>.</p><div className="confirmation-card__summary"><span>Order total</span><strong>{formatMoney(confirmation.total, confirmation.currency)}</strong></div><div className="confirmation-card__items">{confirmation.items.map((item) => <p key={`${item.id}-${item.variant_id || "standard"}`}>{item.name} <span>× {item.quantity}</span></p>)}</div><div className="confirmation-card__actions"><Link className="store-primary-button" to="/category">Continue shopping</Link><Link className="store-secondary-button" to="/account/orders">View my orders</Link></div></section></StorePage>;
}
