import Newsletter from "./Newsletter";
import { useEffect, useState } from "react";
import { storeApi } from "../lib/supabase";

const socialLinks = [
  {
    name: "Twitter",
    icon: "assets/footer/twitter.svg",
    url: "https://twitter.com/",
    type: "twitter",
  },
  {
    name: "Facebook",
    icon: "assets/footer/facebook.svg",
    url: "https://facebook.com/",
    type: "facebook",
  },
  {
    name: "Instagram",
    icon: "assets/footer/instagram.svg",
    url: "https://instagram.com/",
    type: "instagram",
  },
  {
    name: "GitHub",
    icon: "assets/footer/github.svg",
    url: "https://github.com/",
    type: "github",
  },
];

const paymentMethods = [
  {
    name: "Visa",
    icon: "assets/footer/visa.svg",
  },
  {
    name: "Mastercard",
    icon: "assets/footer/mastercard.svg",
  },
  {
    name: "PayPal",
    icon: "assets/footer/paypal.svg",
  },
  {
    name: "Apple Pay",
    icon: "assets/footer/apple-pay.svg",
  },
  {
    name: "Google Pay",
    icon: "assets/footer/google-pay.svg",
  },
];

const navigationColumns = [
  {
    title: "COMPANY",
    links: ["About", "Features", "Works", "Career"],
  },
  {
    title: "HELP",
    links: [
      "Customer Support",
      "Delivery Details",
      "Terms & Conditions",
      "Privacy Policy",
    ],
  },
  {
    title: "FAQ",
    links: [
      "Account",
      "Manage Deliveries",
      "Orders",
      "Payments",
    ],
  },
  {
    title: "RESOURCES",
    links: [
      "Free eBooks",
      "Development Tutorial",
      "How to - Blog",
      "Youtube Playlist",
    ],
  },
];

function Footer() {
  const [settings, setSettings] = useState({});
  useEffect(() => { storeApi.settings().then(setSettings).catch(() => {}); }, []);
  const links = settings.social_links && typeof settings.social_links === "object" ? socialLinks.map((link) => ({ ...link, url: settings.social_links[link.type] || link.url })) : socialLinks;
  return (
    <footer className="shop-footer">
      <Newsletter />

      <div className="shop-footer__inner">
        <div className="shop-footer__top">
          <section className="shop-footer__about">
            <a className="shop-footer__logo" href="/">
              {settings.store_name || "SHOP.CO"}
            </a>

            <p className="shop-footer__description">
              {settings.footer_description || "We have clothes that suits your style and which you’re proud to wear. From women to men."}
              {settings.store_email && <><br/>{settings.store_email}</>}
              {settings.store_phone && <><br/>{settings.store_phone}</>}
            </p>

            <div className="shop-footer__socials">
              {links.map((social) => (
                <a
                  key={social.name}
                  className={`shop-footer__social shop-footer__social--${social.type}`}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.name}
                >
                  <img src={social.icon} alt="" />
                </a>
              ))}
            </div>
          </section>

          <nav
            className="shop-footer__navigation"
            aria-label="Footer navigation"
          >
            {navigationColumns.map((column) => (
              <section
                className="shop-footer__column"
                key={column.title}
              >
                <h3>{column.title}</h3>

                <ul>
                  {column.links.map((link) => (
                    <li key={link}>
                      <a href="/#">{link}</a>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>
        </div>

        <div className="shop-footer__bottom">
          <p>{settings.store_name || "Shop.co"} © {new Date().getFullYear()}, All Rights Reserved</p>

          <div className="shop-footer__payments">
            {paymentMethods.map((payment) => (
              <div
                className="shop-footer__payment"
                key={payment.name}
                title={payment.name}
              >
                <img
                  src={payment.icon}
                  alt={payment.name}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
