import { useEffect, useState } from "react";
import { getSession, storeApi } from "../lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";

function Header() {
  const navigate = useNavigate();
  const { cartCount } = useShop();
  const signedIn = Boolean(getSession()?.access_token);

  const [bannerVisible, setBannerVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [settings, setSettings] = useState({});

  useEffect(() => {
    storeApi.settings().then(setSettings).catch(() => {});
  }, []);

  function handleSearch(event) {
    event.preventDefault();

    const cleanedSearch = searchText.trim();

    if (!cleanedSearch) {
      return;
    }

    navigate(`/category?search=${encodeURIComponent(cleanedSearch)}`);
    setMenuOpen(false);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      {bannerVisible && (
        <div className="offer-bar">
          <span>
            {settings.announcement || "Sign up and get 20% off your first order."}{" "}
            <a href="#newsletter">Sign Up Now</a>
          </span>

          <button
            type="button"
            aria-label="Close announcement"
            onClick={() => setBannerVisible(false)}
          >
            ×
          </button>
        </div>
      )}

      <header className="site-header shell">
        <button
          type="button"
          className="menu-button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          {menuOpen ? "×" : "☰"}
        </button>

        <Link className="logo" to="/" onClick={closeMenu}>
          {settings.store_name || "SHOP.CO"}
        </Link>

        <nav className={menuOpen ? "nav open" : "nav"}>
          <Link to="/category" onClick={closeMenu}>
            Shop⌄
          </Link>

          <Link to="/#sale" onClick={closeMenu}>
            On Sale
          </Link>

          <Link to="/#new" onClick={closeMenu}>
            New Arrivals
          </Link>

          <Link to="/#brands" onClick={closeMenu}>
            Brands
          </Link>
        </nav>

        <form className="search" onSubmit={handleSearch}>
          <button type="submit" aria-label="Search">
            ⌕
          </button>

          <input
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search for products..."
            aria-label="Search products"
          />
        </form>

        <div className="header-actions">
          <button
            type="button"
            className="mobile-search-button"
            aria-label="Search"
            onClick={() => {
              const searchInput = document.querySelector(".search input");

              if (searchInput) {
                searchInput.focus();
              }
            }}
          >
            ⌕
          </button>

          <Link className="cart-link" to="/cart" aria-label="Open cart">
            <span aria-hidden="true">🛒</span>

            {cartCount > 0 && (
              <span className="cart-count">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          <Link
            to="/account"
            className="account-button"
            aria-label={signedIn ? "My account" : "Sign in"}
          >
            {signedIn ? "Account" : "◎"}
          </Link>
        </div>
      </header>
    </>
  );
}

export default Header;
