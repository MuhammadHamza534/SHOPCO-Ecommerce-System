import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const products = [
  {
    id: 1,
    name: "Gradient Graphic T-shirt",
    price: 145,
    oldPrice: 242,
    discount: 20,
    rating: 3.5,
    popularity: 92,
    image: "assets/related-2.jpg",
    category: "T-shirts",
    color: "White",
    sizes: ["Small", "Medium", "Large"],
    style: "Casual",
  },
  {
    id: 2,
    name: "Polo with Tipping Details",
    price: 180,
    oldPrice: 242,
    discount: 20,
    rating: 4.5,
    popularity: 98,
    image: "assets/related-3.jpg",
    category: "T-shirts",
    color: "Red",
    sizes: ["Medium", "Large", "X-Large"],
    style: "Formal",
  },
  {
    id: 3,
    name: "Black Striped T-shirt",
    price: 120,
    oldPrice: 150,
    discount: 30,
    rating: 5,
    popularity: 96,
    image: "assets/related-4.jpg",
    category: "T-shirts",
    color: "Black",
    sizes: ["Small", "Medium", "Large"],
    style: "Casual",
  },
  {
    id: 4,
    name: "Skinny Fit Jeans",
    price: 240,
    oldPrice: 260,
    discount: 20,
    rating: 3.5,
    popularity: 88,
    image: "assets/new-2.jpg",
    category: "Jeans",
    color: "Blue",
    sizes: ["Medium", "Large", "X-Large"],
    style: "Casual",
  },
  {
    id: 5,
    name: "Checkered Shirt",
    price: 180,
    rating: 4.5,
    popularity: 90,
    image: "assets/new-3.jpg",
    category: "Shirts",
    color: "Red",
    sizes: ["Small", "Medium", "Large"],
    style: "Casual",
  },
  {
    id: 6,
    name: "Sleeve Striped T-shirt",
    price: 130,
    oldPrice: 160,
    discount: 30,
    rating: 4.5,
    popularity: 86,
    image: "assets/new-4.jpg",
    category: "T-shirts",
    color: "Orange",
    sizes: ["Small", "Medium", "Large"],
    style: "Gym",
  },
  {
    id: 7,
    name: "Vertical Striped Shirt",
    price: 212,
    oldPrice: 232,
    discount: 20,
    rating: 5,
    popularity: 84,
    image: "assets/top-1.jpg",
    category: "Shirts",
    color: "Green",
    sizes: ["Medium", "Large", "X-Large"],
    style: "Formal",
  },
  {
    id: 8,
    name: "Courage Graphic T-shirt",
    price: 145,
    rating: 4,
    popularity: 82,
    image: "assets/top-2.jpg",
    category: "T-shirts",
    color: "Orange",
    sizes: ["Small", "Medium", "Large"],
    style: "Casual",
  },
  {
    id: 9,
    name: "Loose Fit Bermuda Shorts",
    price: 80,
    rating: 3,
    popularity: 78,
    image: "assets/top-3.jpg",
    category: "Shorts",
    color: "Blue",
    sizes: ["Small", "Medium", "Large"],
    style: "Gym",
  },
  {
    id: 10,
    name: "Faded Skinny Jeans",
    price: 210,
    rating: 4.5,
    popularity: 80,
    image: "assets/top-4.jpg",
    category: "Jeans",
    color: "Black",
    sizes: ["Medium", "Large", "X-Large"],
    style: "Party",
  },
  {
    id: 11,
    name: "One Life Graphic T-shirt",
    price: 260,
    oldPrice: 300,
    discount: 40,
    rating: 4.5,
    popularity: 99,
    image: "assets/product-main.jpg",
    category: "T-shirts",
    color: "Green",
    sizes: ["Small", "Medium", "Large", "X-Large"],
    style: "Casual",
  },
  {
    id: 12,
    name: "Polo with Contrast Trims",
    price: 212,
    oldPrice: 242,
    discount: 20,
    rating: 4,
    popularity: 85,
    image: "assets/related-1.jpg",
    category: "T-shirts",
    color: "Blue",
    sizes: ["Medium", "Large"],
    style: "Formal",
  },
];

const categories = [
  "T-shirts",
  "Shorts",
  "Shirts",
  "Hoodie",
  "Jeans",
];

const colors = [
  { name: "Green", value: "#00c12b" },
  { name: "Red", value: "#f50606" },
  { name: "Yellow", value: "#f5dd06" },
  { name: "Orange", value: "#f57906" },
  { name: "Blue", value: "#06caf5" },
  { name: "Navy", value: "#063af5" },
  { name: "Purple", value: "#7d06f5" },
  { name: "Pink", value: "#f506a4" },
  { name: "White", value: "#ffffff" },
  { name: "Black", value: "#000000" },
];

const sizes = [
  "XX-Small",
  "X-Small",
  "Small",
  "Medium",
  "Large",
  "X-Large",
  "XX-Large",
  "3X-Large",
  "4X-Large",
];

const dressStyles = ["Casual", "Formal", "Party", "Gym"];

function ProductCard({ product }) {
  return (
    <article className="category-product">
      <Link to="/product">
        <div className="product-image">
          <img src={product.image} alt={product.name} />
        </div>

        <h3>{product.name}</h3>
      </Link>

      <div className="rating">
        <span>★★★★★</span>
        <small>{product.rating}/5</small>
      </div>

      <div className="price-row">
        <strong>${product.price}</strong>

        {product.oldPrice && (
          <del>${product.oldPrice}</del>
        )}

        {product.discount && (
          <span className="discount">
            -{product.discount}%
          </span>
        )}
      </div>
    </article>
  );
}

function Filters({
  selectedCategory,
  setSelectedCategory,
  selectedColor,
  setSelectedColor,
  selectedSize,
  setSelectedSize,
  selectedStyle,
  setSelectedStyle,
  maximumPrice,
  setMaximumPrice,
  onApply,
  mobile,
}) {
  return (
    <div className="filters-content">
      <div className="filters-title">
        <h2>Filters</h2>
        <span>☷</span>
      </div>

      <div className="filter-group category-filter">
        {categories.map((category) => (
          <button
            type="button"
            key={category}
            className={
              selectedCategory === category
                ? "filter-selected"
                : ""
            }
            onClick={() =>
              setSelectedCategory(
                selectedCategory === category
                  ? ""
                  : category
              )
            }
          >
            <span>{category}</span>
            <span>›</span>
          </button>
        ))}
      </div>

      <div className="filter-group">
        <div className="filter-heading">
          <h3>Price</h3>
          <span>⌃</span>
        </div>

        <input
          className="price-slider"
          type="range"
          min="50"
          max="300"
          step="5"
          value={maximumPrice}
          onChange={(event) =>
            setMaximumPrice(Number(event.target.value))
          }
        />

        <div className="price-labels">
          <span>$50</span>
          <span>${maximumPrice}</span>
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-heading">
          <h3>Colors</h3>
          <span>⌃</span>
        </div>

        <div className="color-options">
          {colors.map((color) => (
            <button
              type="button"
              key={color.name}
              title={color.name}
              aria-label={`Select ${color.name}`}
              className={
                selectedColor === color.name
                  ? "color-option selected"
                  : "color-option"
              }
              style={{
                backgroundColor: color.value,
              }}
              onClick={() =>
                setSelectedColor(
                  selectedColor === color.name
                    ? ""
                    : color.name
                )
              }
            >
              {selectedColor === color.name ? "✓" : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-heading">
          <h3>Size</h3>
          <span>⌃</span>
        </div>

        <div className="size-options">
          {sizes.map((size) => (
            <button
              type="button"
              key={size}
              className={
                selectedSize === size ? "selected" : ""
              }
              onClick={() =>
                setSelectedSize(
                  selectedSize === size ? "" : size
                )
              }
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-heading">
          <h3>Dress Style</h3>
          <span>⌃</span>
        </div>

        <div className="dress-options">
          {dressStyles.map((style) => (
            <button
              type="button"
              key={style}
              className={
                selectedStyle === style
                  ? "filter-selected"
                  : ""
              }
              onClick={() =>
                setSelectedStyle(
                  selectedStyle === style ? "" : style
                )
              }
            >
              <span>{style}</span>
              <span>›</span>
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="apply-filter"
        onClick={onApply}
      >
        Apply Filter
      </button>

      {mobile && (
        <p className="mobile-filter-note">
          Filters will be applied to the products.
        </p>
      )}
    </div>
  );
}

function Category() {
  const [searchParams] = useSearchParams();

  const searchText =
    searchParams
      .get("search")
      ?.trim()
      .toLowerCase() || "";

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState("");
  const [selectedColor, setSelectedColor] =
    useState("");
  const [selectedSize, setSelectedSize] =
    useState("");
  const [selectedStyle, setSelectedStyle] =
    useState("");
  const [maximumPrice, setMaximumPrice] =
    useState(300);
  const [sortBy, setSortBy] = useState("popular");
  const [currentPage, setCurrentPage] = useState(1);

  const productsPerPage = 9;

  const filteredProducts = useMemo(() => {
    const result = products.filter((product) => {
      const matchesSearch =
        !searchText ||
        product.name
          .toLowerCase()
          .includes(searchText);

      const matchesCategory =
        !selectedCategory ||
        product.category === selectedCategory;

      const matchesColor =
        !selectedColor ||
        product.color === selectedColor;

      const matchesSize =
        !selectedSize ||
        product.sizes.includes(selectedSize);

      const matchesStyle =
        !selectedStyle ||
        product.style === selectedStyle;

      const matchesPrice =
        product.price <= maximumPrice;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesColor &&
        matchesSize &&
        matchesStyle &&
        matchesPrice
      );
    });

    return [...result].sort((first, second) => {
      if (sortBy === "price-low") {
        return first.price - second.price;
      }

      if (sortBy === "price-high") {
        return second.price - first.price;
      }

      if (sortBy === "rating") {
        return second.rating - first.rating;
      }

      return first.id - second.id;
    });
  }, [
    searchText,
    selectedCategory,
    selectedColor,
    selectedSize,
    selectedStyle,
    maximumPrice,
    sortBy,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredProducts.length / productsPerPage
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const firstProductIndex =
    (safeCurrentPage - 1) * productsPerPage;

  const displayedProducts = filteredProducts.slice(
    firstProductIndex,
    firstProductIndex + productsPerPage
  );

  function applyFilters() {
    setCurrentPage(1);
    setFiltersOpen(false);
  }

  function handleSortChange(event) {
    setSortBy(event.target.value);
    setCurrentPage(1);
  }

  function goToPage(page) {
    const safePage = Math.min(
      Math.max(page, 1),
      totalPages
    );

    setCurrentPage(safePage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const filterProps = {
    selectedCategory,
    setSelectedCategory,
    selectedColor,
    setSelectedColor,
    selectedSize,
    setSelectedSize,
    selectedStyle,
    setSelectedStyle,
    maximumPrice,
    setMaximumPrice,
    onApply: applyFilters,
  };

  return (
    <main className="category-page">
      <Header />

      <div className="shell">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>›</span>
          <span>Casual</span>
        </div>

        <div className="category-layout">
          <aside className="filters-sidebar">
            <Filters {...filterProps} />
          </aside>

          <section className="category-content">
            <div className="category-heading">
              <h1>
                {searchText
                  ? `Search: ${searchText}`
                  : "Casual"}
              </h1>

              <div className="category-controls">
                <p>
                  Showing{" "}
                  {filteredProducts.length === 0
                    ? 0
                    : firstProductIndex + 1}
                  -
                  {Math.min(
                    firstProductIndex +
                      productsPerPage,
                    filteredProducts.length
                  )}{" "}
                  of {filteredProducts.length} Products
                </p>

                <label>
                  <span>Sort by:</span>

                  <select
                    value={sortBy}
                    onChange={handleSortChange}
                  >
                    <option value="popular">
                      Most Popular
                    </option>

                    <option value="rating">
                      Highest Rating
                    </option>

                    <option value="price-low">
                      Price: Low to High
                    </option>

                    <option value="price-high">
                      Price: High to Low
                    </option>
                  </select>
                </label>

                <button
                  type="button"
                  className="mobile-filter-button"
                  aria-label="Open filters"
                  onClick={() => setFiltersOpen(true)}
                >
                  ☷
                </button>
              </div>
            </div>

            {displayedProducts.length > 0 ? (
              <div className="products-grid category-products">
                {displayedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <div className="no-products">
                <h2>No products found</h2>

                <p>
                  Try changing your search or filters.
                </p>
              </div>
            )}

            {filteredProducts.length >
              productsPerPage && (
              <div className="pagination">
                <button
                  type="button"
                  disabled={safeCurrentPage === 1}
                  onClick={() =>
                    goToPage(safeCurrentPage - 1)
                  }
                >
                  ← Previous
                </button>

                <div>
                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  ).map((page) => (
                    <button
                      type="button"
                      key={page}
                      className={
                        safeCurrentPage === page
                          ? "active"
                          : ""
                      }
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={
                    safeCurrentPage === totalPages
                  }
                  onClick={() =>
                    goToPage(safeCurrentPage + 1)
                  }
                >
                  Next →
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      {filtersOpen && (
        <div
          className="filter-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Product filters"
          onClick={() => setFiltersOpen(false)}
        >
          <div
            className="filter-modal-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="filter-close"
              aria-label="Close filters"
              onClick={() => setFiltersOpen(false)}
            >
              ×
            </button>

            <Filters {...filterProps} mobile />
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}

export default Category;