import { useState } from "react";
import { storeApi } from "../lib/supabase";

function Newsletter() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await storeApi.subscribe(email.trim().toLowerCase());
      setSubscribed(true);
    } catch (error) {
      setMessage(error.message.includes("duplicate") ? "This email is already subscribed." : error.message);
    }
  }

  return (
    <section className="newsletter shell" id="newsletter">
      <h2>
        STAY UP TO DATE ABOUT
        <br />
        OUR LATEST OFFERS
      </h2>

      {subscribed ? (
        <p className="thanks">
          Thanks! You are on the list.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>
            <span>✉</span>

            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email address"
            />
          </label>

          <button type="submit">
            Subscribe to Newsletter
          </button>
          {message && <p className="thanks">{message}</p>}
        </form>
      )}
    </section>
  );
}

export default Newsletter;
