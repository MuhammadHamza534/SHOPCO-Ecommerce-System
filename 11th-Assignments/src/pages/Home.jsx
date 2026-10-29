import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CustomerReviews from "../components/CustomerReviews";

const newArrivals = [
  {
    name: "T-shirt with Tape Details",
    price: "$120",
    oldPrice: "",
    rating: "4.5/5",
    image: "assets/new-1.jpg",
    discount: "",
  },
  {
    name: "Skinny Fit Jeans",
    price: "$240",
    oldPrice: "$260",
    rating: "3.5/5",
    image: "assets/new-2.jpg",
    discount: "-20%",
  },
  {
    name: "Checkered Shirt",
    price: "$180",
    oldPrice: "",
    rating: "4.5/5",
    image: "assets/new-3.jpg",
    discount: "",
  },
  {
    name: "Sleeve Striped T-shirt",
    price: "$130",
    oldPrice: "$160",
    rating: "4.5/5",
    image: "assets/new-4.jpg",
    discount: "-30%",
  },
];

const topSelling = [
  {
    name: "Vertical Striped Shirt",
    price: "$212",
    oldPrice: "$232",
    rating: "5.0/5",
    image: "assets/top-1.jpg",
    discount: "-20%",
  },
  {
    name: "Courage Graphic T-shirt",
    price: "$145",
    oldPrice: "",
    rating: "4.0/5",
    image: "assets/top-2.jpg",
    discount: "",
  },
  {
    name: "Loose Fit Bermuda Shorts",
    price: "$80",
    oldPrice: "",
    rating: "3.0/5",
    image: "assets/top-3.jpg",
    discount: "",
  },
  {
    name: "Faded Skinny Jeans",
    price: "$210",
    oldPrice: "",
    rating: "4.5/5",
    image: "assets/top-4.jpg",
    discount: "",
  },
];

function ProductRow({ title, products, id }) {
  return (
    <section className="product-section shell" id={id}>
      <h2>{title}</h2>

      <div className="product-grid">
        {products.map((product) => (
          <Link
            className="product-card"
            to="/product"
            key={product.name}
          >
            <img
              src={product.image}
              alt={product.name}
            />

            <h3>{product.name}</h3>

            <div className="rating">
              <span>★★★★★</span>
              <small>{product.rating}</small>
            </div>

            <div className="price">
              {product.price}

              {product.oldPrice && (
                <del>{product.oldPrice}</del>
              )}

              {product.discount && (
                <em>{product.discount}</em>
              )}
            </div>
          </Link>
        ))}
      </div>

      <Link className="view-all" to="/category">
        View All
      </Link>
    </section>
  );
}

function Home() {
  return (
    <main>
      <Header />

      <section className="hero" id="top">
        <div className="shell hero-inner">
          <div className="hero-copy">
            <h1>
              FIND CLOTHES
              <br />
              THAT MATCHES
              <br />
              YOUR STYLE
            </h1>

            <p>
              Browse through our diverse range of meticulously crafted
              garments, designed to bring out your individuality and cater
              to your sense of style.
            </p>

            <a className="shop-button" href="#new">
              Shop Now
            </a>

            <div className="stats">
              <div>
                <strong>200+</strong>
                <span>International Brands</span>
              </div>

              <div>
                <strong>2,000+</strong>
                <span>High-Quality Products</span>
              </div>

              <div>
                <strong>30,000+</strong>
                <span>Happy Customers</span>
              </div>
            </div>
          </div>

          <picture className="hero-picture">
            <source
              media="(max-width: 700px)"
              srcSet="assets/hero-mobile.jpg"
            />

            <img
              src="assets/hero-desktop.jpg"
              alt="Models wearing modern clothes"
            />
          </picture>
        </div>
      </section>

      <section className="brand-strip" id="brands">
        <div className="shell brands">
          <span>VERSACE</span>
          <span>ZARA</span>
          <span>GUCCI</span>
          <strong>PRADA</strong>
          <span>Calvin Klein</span>
        </div>
      </section>

      <ProductRow
        title="NEW ARRIVALS"
        products={newArrivals}
        id="new"
      />

      <div className="section-rule shell"></div>

      <ProductRow
        title="TOP SELLING"
        products={topSelling}
        id="sale"
      />

      <section className="styles shell" id="styles">
        <h2>BROWSE BY DRESS STYLE</h2>

        <div className="style-grid">
          <Link to="/category" className="style-card casual">
            <span>Casual</span>

            <img
              src="assets/style-casual.jpg"
              alt="Casual fashion"
            />
          </Link>

          <Link to="/category" className="style-card formal">
            <span>Formal</span>

            <img
              src="assets/style-formal.jpg"
              alt="Formal fashion"
            />
          </Link>

          <Link to="/category" className="style-card party">
            <span>Party</span>

            <img
              src="assets/style-party.jpg"
              alt="Party fashion"
            />
          </Link>

          <Link to="/category" className="style-card gym">
            <span>Gym</span>

            <img
              src="assets/style-gym.jpg"
              alt="Gym clothing"
            />
          </Link>
        </div>
      </section>

      <CustomerReviews />

      <Footer />
    </main>
  );
}

export default Home;