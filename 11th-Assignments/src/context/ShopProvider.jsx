import { useEffect, useState } from "react";
import { ShopContext } from "./ShopContext";

const CART_STORAGE_KEY = "shopco-cart-items";

function getSavedCart() {
  try {
    const savedCart = localStorage.getItem(
      CART_STORAGE_KEY
    );

    if (!savedCart) {
      return [];
    }

    const parsedCart = JSON.parse(savedCart);

    return Array.isArray(parsedCart)
      ? parsedCart
      : [];
  } catch (error) {
    console.error(
      "Cart could not be loaded:",
      error
    );

    return [];
  }
}

function ShopProvider({ children }) {
  const [cartItems, setCartItems] =
    useState(getSavedCart);

  useEffect(() => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(cartItems)
    );
  }, [cartItems]);

  function addToCart(product) {
    if (!product || !product.id) {
      console.error("Invalid product:", product);
      return;
    }

    const normalizedProduct = {
      ...product,
      quantity: Number(product.quantity) || 1,
    };

    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) =>
          item.id === normalizedProduct.id &&
          item.size === normalizedProduct.size &&
          item.color === normalizedProduct.color
      );

      if (!existingItem) {
        return [
          ...currentItems,
          normalizedProduct,
        ];
      }

      return currentItems.map((item) => {
        const isSameItem =
          item.id === normalizedProduct.id &&
          item.size === normalizedProduct.size &&
          item.color === normalizedProduct.color;

        if (!isSameItem) {
          return item;
        }

        return {
          ...item,
          quantity:
            item.quantity +
            normalizedProduct.quantity,
        };
      });
    });
  }

  function increaseQuantity(id, size, color) {
    setCartItems((currentItems) =>
      currentItems.map((item) => {
        const isSameItem =
          item.id === id &&
          item.size === size &&
          item.color === color;

        if (!isSameItem) {
          return item;
        }

        return {
          ...item,
          quantity: item.quantity + 1,
        };
      })
    );
  }

  function decreaseQuantity(id, size, color) {
    setCartItems((currentItems) =>
      currentItems.map((item) => {
        const isSameItem =
          item.id === id &&
          item.size === size &&
          item.color === color;

        if (!isSameItem) {
          return item;
        }

        return {
          ...item,
          quantity: Math.max(
            1,
            item.quantity - 1
          ),
        };
      })
    );
  }

  function removeFromCart(id, size, color) {
    setCartItems((currentItems) =>
      currentItems.filter((item) => {
        const isSameItem =
          item.id === id &&
          item.size === size &&
          item.color === color;

        return !isSameItem;
      })
    );
  }

  function clearCart() {
    setCartItems([]);
  }

  const cartCount = cartItems.reduce(
    (total, item) =>
      total + Number(item.quantity),
    0
  );

  const cartSubtotal = cartItems.reduce(
    (total, item) =>
      total +
      Number(item.price) *
        Number(item.quantity),
    0
  );

  const contextValue = {
    cartItems,
    cartCount,
    cartSubtotal,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {children}
    </ShopContext.Provider>
  );
}

export default ShopProvider;
