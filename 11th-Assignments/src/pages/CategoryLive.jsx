import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import StorePage from "../components/StorePage";
import ProductCard from "../components/ProductCard";
import { storeApi } from "../lib/supabase";
import { price } from "../lib/catalog";

export default function CategoryLive() {
  const [params] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(() => params.get("category") || "");
  const [sort, setSort] = useState("featured");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const search = (params.get("search") || "").trim().toLowerCase();

  useEffect(() => {
    Promise.all([storeApi.products(), storeApi.categories()]).then(([productRows, categoryRows]) => {
      setProducts(productRows || []); setCategories(categoryRows || []);
    }).catch((loadError) => setError(loadError.message)).finally(() => setLoading(false));
  }, []);

  const shown = useMemo(() => products.filter((product) => (!category || product.category?.id === category) && (!search || product.name.toLowerCase().includes(search))).sort((left, right) => {
    if (sort === "price-low") return price(left) - price(right);
    if (sort === "price-high") return price(right) - price(left);
    if (sort === "rating") return Number(right.rating) - Number(left.rating);
    return Number(right.featured) - Number(left.featured);
  }), [products, category, search, sort]);

  return <StorePage className="catalog-page"><div className="store-shell catalog-page__content"><nav className="store-breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><span>›</span><span>Shop</span></nav><div className="catalog-page__layout"><aside className="catalog-filters" aria-label="Catalog filters"><h2>Categories</h2><button type="button" className={!category ? "is-selected" : ""} onClick={() => setCategory("")}>All products <span>{products.length}</span></button>{categories.map((item) => <button type="button" className={category === item.id ? "is-selected" : ""} onClick={() => setCategory(item.id)} key={item.id}>{item.name}</button>)}</aside><section className="catalog-results" aria-live="polite"><div className="catalog-results__heading"><div><p>{search ? "Search results" : "Curated collection"}</p><h1>{search ? `“${params.get("search") || ""}”` : "Shop all"}</h1></div><label>Sort <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="rating">Rating</option></select></label></div>{loading && <div className="store-state">Loading the collection…</div>}{error && <div className="store-state store-state--error">{error}</div>}{!loading && !error && shown.length > 0 && <div className="catalog-product-grid">{shown.map((product) => <ProductCard key={product.id} product={product} allowQuickAdd />)}</div>}{!loading && !error && shown.length === 0 && <div className="store-state"><h2>No products found</h2><p>Try another category or return later for new arrivals.</p></div>}</section></div></div></StorePage>;
}
