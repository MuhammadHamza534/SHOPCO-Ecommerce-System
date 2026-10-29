import Header from "./Header";
import Footer from "./Footer";

export default function StorePage({ children, className = "" }) {
  return <main className={`store-page ${className}`.trim()}><Header />{children}<Footer /></main>;
}
