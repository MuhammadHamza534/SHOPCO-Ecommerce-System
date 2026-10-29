import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useShop } from "../context/ShopContext";

function Cart() {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useShop();

  const [promoCode, setPromoCode] = useState("");
  const [promoStatus, setPromoStatus] = useState("");
  const [checkoutClicked, setCheckoutClicked] = useState(false);

  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [cartItems]);

  const discountPercentage = 20;
  const discount = Math.round(
    subtotal * (discountPercentage / 100)
  );

  const deliveryFee = cartItems.length > 0 ? 15 : 0;
  const total = Math.max(0, subtotal - discount + deliveryFee);

  function handlePromoSubmit(event) {
    event.preventDefault();

    const enteredCode = promoCode.trim().toUpperCase();

    if (!enteredCode) {
      setPromoStatus("empty");
      return;
    }

    if (enteredCode === "SAVE20") {
      setPromoStatus("applied");
    } else {
      setPromoStatus("invalid");
    }
  }

  function handleCheckout() {
    if (cartItems.length === 0) {
      return;
    }

    setCheckoutClicked(true);
  }

  return (
    <main className="cart-page">
      <Header />

      <div className="shell cart-container">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>›</span>
          <span>Cart</span>
        </div>

        <h1 className="cart-title">YOUR CART</h1>

        {cartItems.length > 0 ? (
          <div className="cart-layout">
            <section className="cart-items">
              {cartItems.map((item) => (
                <article
                  className="cart-item"
                  key={`${item.id}-${item.size}-${item.color}`}
                >
                  <div className="cart-item-image">
                    <img src={item.image} alt={item.name} />
                  </div>

                  <div className="cart-item-information">
                    <h2>{item.name}</h2>

                    <p>
                      Size: <span>{item.size}</span>
                    </p>

                    <p>
                      Color: <span>{item.color}</span>
                    </p>

                    <strong>${item.price}</strong>
                  </div>

                  <button
                    type="button"
                    className="remove-cart-item"
                    aria-label={`Remove ${item.name}`}
                    onClick={() =>
                      removeFromCart(
                        item.id,
                        item.size,
                        item.color
                      )
                    }
                  >
                    🗑
                  </button>

                  <div className="cart-quantity">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      disabled={item.quantity === 1}
                      onClick={() =>
                        decreaseQuantity(
                          item.id,
                          item.size,
                          item.color
                        )
                      }
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() =>
                        increaseQuantity(
                          item.id,
                          item.size,
                          item.color
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                </article>
              ))}
            </section>

            <aside className="order-summary">
              <h2>Order Summary</h2>

              <div className="summary-line">
                <span>Subtotal</span>
                <strong>${subtotal}</strong>
              </div>

              <div className="summary-line">
                <span>Discount (-20%)</span>
                <strong className="summary-discount">
                  -${discount}
                </strong>
              </div>

              <div className="summary-line">
                <span>Delivery Fee</span>
                <strong>${deliveryFee}</strong>
              </div>

              <div className="summary-total">
                <span>Total</span>
                <strong>${total}</strong>
              </div>

              <form
                className={`promo-form ${promoStatus}`}
                onSubmit={handlePromoSubmit}
              >
                <label>
                  <span>◇</span>

                  <input
                    type="text"
                    value={promoCode}
                    onChange={(event) => {
                      setPromoCode(event.target.value);
                      setPromoStatus("");
                    }}
                    placeholder={
                      promoStatus === "invalid"
                        ? "Invalid promo code"
                        : "Add promo code"
                    }
                    aria-label="Promo code"
                  />
                </label>

                <button type="submit">
                  {promoStatus === "applied"
                    ? "Applied ✓"
                    : "Apply"}
                </button>
              </form>

              <button
                type="button"
                className="checkout-button"
                onClick={handleCheckout}
              >
                {checkoutClicked
                  ? "Checkout Ready ✓"
                  : "Go to Checkout →"}
              </button>
            </aside>
          </div>
        ) : (
          <section className="empty-cart">
            <h2>Your cart is empty</h2>

            <p>Add a product before proceeding to checkout.</p>

            <Link to="/category">Continue Shopping</Link>
          </section>
        )}
      </div>

      <Footer />
    </main>
  );
}

export default Cart;