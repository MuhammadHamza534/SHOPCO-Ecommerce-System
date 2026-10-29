import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useShop } from "../context/ShopContext";

const reviews = [
  {
    name: "Samantha D.",
    stars: "★★★★★",
    text: "I absolutely love this t-shirt! The design is unique and the fabric feels so comfortable. As a fellow designer, I appreciate the attention to detail. It has become my favorite go-to shirt.",
    date: "August 14, 2023",
  },
  {
    name: "Alex M.",
    stars: "★★★★★",
    text: "The t-shirt exceeded my expectations! The colors are vibrant and the print quality is top-notch. Being a UI/UX designer myself, I am quite picky about aesthetics.",
    date: "August 15, 2023",
  },
  {
    name: "Ethan R.",
    stars: "★★★★☆",
    text: "This t-shirt is a must-have for anyone who appreciates good design. The minimalistic yet stylish pattern caught my eye, and the fit is perfect.",
    date: "August 16, 2023",
  },
  {
    name: "Olivia P.",
    stars: "★★★★★",
    text: "As a UI/UX enthusiast, I value simplicity and functionality. This t-shirt represents those principles and also feels great to wear.",
    date: "August 17, 2023",
  },
  {
    name: "Liam K.",
    stars: "★★★★☆",
    text: "This t-shirt is a fusion of comfort and creativity. The fabric is soft, and the design speaks volumes about the designer's skill.",
    date: "August 18, 2023",
  },
  {
    name: "Ava H.",
    stars: "★★★★☆",
    text: "I am not just wearing a t-shirt; I am wearing a piece of design philosophy. The intricate details make this shirt a conversation starter.",
    date: "August 19, 2023",
  },
];

const relatedProducts = [
  {
    name: "Polo with Contrast Trims",
    price: "$212",
    oldPrice: "$242",
    rating: "4.0/5",
    image: "assets/related-1.jpg",
    discount: "-20%",
  },
  {
    name: "Gradient Graphic T-shirt",
    price: "$145",
    oldPrice: "",
    rating: "3.5/5",
    image: "assets/related-2.jpg",
    discount: "",
  },
  {
    name: "Polo with Tipping Details",
    price: "$180",
    oldPrice: "",
    rating: "4.5/5",
    image: "assets/related-3.jpg",
    discount: "",
  },
  {
    name: "Black Striped T-shirt",
    price: "$120",
    oldPrice: "$150",
    rating: "5.0/5",
    image: "assets/related-4.jpg",
    discount: "-30%",
  },
];

const productImages = [
  "assets/product-main.jpg",
  "assets/product-thumb-2.jpg",
  "assets/product-thumb-3.jpg",
];

function Product() {
  const { addToCart } = useShop();
  const [selectedImage, setSelectedImage] = useState(productImages[0]);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState("Large");
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [reviewsExpanded, setReviewsExpanded] = useState(false);

  function decreaseQuantity() {
    setQuantity((currentQuantity) => Math.max(1, currentQuantity - 1));
  }

  function increaseQuantity() {
    setQuantity((currentQuantity) => currentQuantity + 1);
  }

  function handleAddToCart() {
    addToCart({
      id: 11,
      name: "One Life Graphic T-shirt",
      image: selectedImage,
      price: 260,
      size: selectedSize,
      color: selectedColor.name,
      quantity: quantity,
    });

    setAddedToCart(true);

    window.setTimeout(() => {
      setAddedToCart(false);
    }, 1500);
  }

  return (
    <main className="product-page">
      <Header />

      <div className="product-shell shell">
        <div className="breadcrumbs">
          <Link to="/">Home</Link>
          <span>›</span>
          <Link to="/category">Shop</Link>
          <span>›</span>
          <Link to="/category">Men</Link>
          <span>›</span>
          <b>T-shirts</b>
        </div>

        <section className="product-overview">
          <div className="gallery">
            <div className="thumbs">
              {productImages.map((image, index) => (
                <button
                  type="button"
                  className={selectedImage === image ? "selected" : ""}
                  onClick={() => setSelectedImage(image)}
                  key={image}
                >
                  <img src={image} alt={`Product view ${index + 1}`} />
                </button>
              ))}
            </div>

            <img
              className="main-product-image"
              src={selectedImage}
              alt="One Life Graphic T-shirt"
            />
          </div>

          <div className="product-info">
            <h1>ONE LIFE GRAPHIC T-SHIRT</h1>

            <div className="product-rating">
              <span>★★★★½</span>
              <b>4.5/5</b>
            </div>

            <div className="product-price">
              $260
              <del>$300</del>
              <em>-40%</em>
            </div>

            <p>
              This graphic t-shirt is perfect for any occasion. Crafted from a
              soft and breathable fabric, it offers superior comfort and style.
            </p>

            <div className="option-block">
              <label>Select Colors</label>

              <div className="color-options">
                {["#4f4a32", "#315a55", "#313850"].map((color, index) => (
                  <button
                    type="button"
                    aria-label={`Select color ${index + 1}`}
                    className={selectedColor === index ? "active" : ""}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(index)}
                    key={color}
                  >
                    {selectedColor === index ? "✓" : ""}
                  </button>
                ))}
              </div>
            </div>

            <div className="option-block">
              <label>Choose Size</label>

              <div className="size-options">
                {["Small", "Medium", "Large", "X-Large"].map((size) => (
                  <button
                    type="button"
                    className={selectedSize === size ? "active" : ""}
                    onClick={() => setSelectedSize(size)}
                    key={size}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="cart-row">
              <div className="quantity">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={decreaseQuantity}
                >
                  −
                </button>

                <span>{quantity}</span>

                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={increaseQuantity}
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className="add-cart"
                onClick={handleAddToCart}
              >
                {addedToCart ? `Added ${quantity} to Cart ✓` : "Add to Cart"}
              </button>
            </div>
          </div>
        </section>

        <div className="product-tabs">
          <button type="button">Product Details</button>

          <button type="button" className="active">
            Rating &amp; Reviews
          </button>

          <button type="button">FAQs</button>
        </div>

        <section className="all-reviews">
          <div className="reviews-toolbar">
            <h2>
              All Reviews <small>(451)</small>
            </h2>

            <div>
              <button
                type="button"
                className="filter"
                aria-label="Filter reviews"
              >
                ☷
              </button>

              <button type="button" className="latest">
                Latest⌄
              </button>

              <button type="button" className="write">
                Write a Review
              </button>
            </div>
          </div>

          <div
            className={reviewsExpanded ? "review-grid expanded" : "review-grid"}
          >
            {reviews.map((review, index) => (
              <article
                className={index > 2 ? "extra-review" : ""}
                key={review.name}
              >
                <div className="review-card-top">
                  <span>{review.stars}</span>

                  <button type="button" aria-label="Review options">
                    •••
                  </button>
                </div>

                <h3>
                  {review.name} <b>✓</b>
                </h3>

                <p>“{review.text}”</p>

                <small>Posted on {review.date}</small>
              </article>
            ))}
          </div>

          <button
            type="button"
            className="load-reviews"
            onClick={() => setReviewsExpanded(!reviewsExpanded)}
          >
            {reviewsExpanded ? "Show Fewer Reviews" : "Load More Reviews"}
          </button>
        </section>

        <section className="related-section">
          <h2>YOU MIGHT ALSO LIKE</h2>

          <div className="related-grid">
            {relatedProducts.map((product) => (
              <Link to="/product" className="related-card" key={product.name}>
                <img src={product.image} alt={product.name} />

                <h3>{product.name}</h3>

                <div className="rating">
                  <span>★★★★★</span>
                  <small>{product.rating}</small>
                </div>

                <div className="price">
                  {product.price}

                  {product.oldPrice && <del>{product.oldPrice}</del>}

                  {product.discount && <em>{product.discount}</em>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}

export default Product;
