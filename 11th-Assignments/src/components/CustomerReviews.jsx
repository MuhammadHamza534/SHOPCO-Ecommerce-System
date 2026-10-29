import { useRef } from "react";

const reviews = [
  {
    id: 1,
    name: "Sarah M.",
    rating: 5,
    text: "I'm blown away by the quality and style of the clothes I received from Shop.co. From casual wear to elegant dresses, every piece I've bought has exceeded my expectations.",
  },
  {
    id: 2,
    name: "Alex K.",
    rating: 5,
    text: "Finding clothes that align with my personal style used to be a challenge until I discovered Shop.co. The range of options they offer is truly remarkable.",
  },
  {
    id: 3,
    name: "James L.",
    rating: 5,
    text: "As someone who's always on the lookout for unique fashion pieces, I'm thrilled to have discovered Shop.co. The selection is both diverse and on-point.",
  },
  {
    id: 4,
    name: "Mia R.",
    rating: 5,
    text: "The clothes look exactly like the pictures and the quality is excellent. My order also arrived earlier than expected.",
  },
  {
    id: 5,
    name: "Noah B.",
    rating: 4,
    text: "Shop.co has become my first choice for everyday clothing. The website is easy to use and the sizes have always been accurate.",
  },
  {
    id: 6,
    name: "Olivia S.",
    rating: 5,
    text: "I love how comfortable and stylish everything feels. The materials are soft, and the designs work perfectly with my wardrobe.",
  },
  {
    id: 7,
    name: "Ethan D.",
    rating: 5,
    text: "The product quality is better than I expected. The colors remain bright after washing and the fitting is excellent.",
  },
  {
    id: 8,
    name: "Emma W.",
    rating: 4,
    text: "I found several outfits that match my style perfectly. Shopping was simple and every item arrived in great condition.",
  },
  {
    id: 9,
    name: "Liam T.",
    rating: 5,
    text: "Excellent collection, comfortable fabric and reliable delivery. I will definitely order from Shop.co again.",
  },
  {
    id: 10,
    name: "Sophia A.",
    rating: 5,
    text: "Every piece feels thoughtfully designed. I especially love the casual collection because it is stylish and easy to wear.",
  },
];

function CustomerReviews() {
  const reviewsTrack = useRef(null);

  function moveReviews(direction) {
    const track = reviewsTrack.current;

    if (!track) {
      return;
    }

    const firstCard = track.querySelector(
      ".customer-reviews__card"
    );

    if (!firstCard) {
      return;
    }

    const cardGap = 20;
    const movement = firstCard.offsetWidth + cardGap;

    const reachedStart = track.scrollLeft <= 5;

    const reachedEnd =
      Math.ceil(track.scrollLeft + track.clientWidth) >=
      track.scrollWidth - 5;

    if (direction === "next") {
      if (reachedEnd) {
        track.scrollTo({
          left: 0,
          behavior: "smooth",
        });
      } else {
        track.scrollBy({
          left: movement,
          behavior: "smooth",
        });
      }
    }

    if (direction === "previous") {
      if (reachedStart) {
        track.scrollTo({
          left: track.scrollWidth,
          behavior: "smooth",
        });
      } else {
        track.scrollBy({
          left: -movement,
          behavior: "smooth",
        });
      }
    }
  }

  function createStars(rating) {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  }

  return (
    <section className="customer-reviews">
      <div className="customer-reviews__header shell">
        <h2>OUR HAPPY CUSTOMERS</h2>

        <div className="customer-reviews__buttons">
          <button
            type="button"
            aria-label="Previous reviews"
            onClick={() => moveReviews("previous")}
          >
            ←
          </button>

          <button
            type="button"
            aria-label="Next reviews"
            onClick={() => moveReviews("next")}
          >
            →
          </button>
        </div>
      </div>

      <div className="customer-reviews__viewport shell">
        <div
          className="customer-reviews__track"
          ref={reviewsTrack}
        >
          {reviews.map((review) => (
            <article
              className="customer-reviews__card"
              key={review.id}
            >
              <div className="customer-reviews__stars">
                {createStars(review.rating)}
              </div>

              <h3>
                {review.name}
                <span
                  className="customer-reviews__verified"
                  title="Verified customer"
                >
                  ✓
                </span>
              </h3>

              <p>&quot;{review.text}&quot;</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CustomerReviews;