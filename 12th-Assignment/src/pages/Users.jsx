import { useMemo } from "react";
import {
  CalendarDays,
  Mail,
  Phone,
  ShoppingBag,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { users } from "../data/dashboardData";

function Users() {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const searchText =
    searchParams.get("search")?.trim() || "";

  const normalizedSearch =
    searchText.toLowerCase();

  const filteredUsers = useMemo(() => {
    if (!normalizedSearch) {
      return users;
    }

    return users.filter((user) => {
      return (
        user.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        user.email
          .toLowerCase()
          .includes(normalizedSearch) ||
        user.phone
          .toLowerCase()
          .includes(normalizedSearch) ||
        user.id
          .toLowerCase()
          .includes(normalizedSearch)
      );
    });
  }, [normalizedSearch]);

  function clearSearch() {
    setSearchParams({});
  }

  return (
    <div className="page users-page">
      <div className="page-heading">
        <div>
          <h1>Users</h1>

          <p>
            View customer profiles and their shopping
            activity.
          </p>
        </div>

        <div className="page-count">
          <UsersRound size={18} />
          {filteredUsers.length} Users
        </div>
      </div>

      {searchText && (
        <div className="active-search">
          <span>
            Search results for:
            <strong>{searchText}</strong>
          </span>

          <button
            type="button"
            onClick={clearSearch}
          >
            <X size={16} />
            Clear
          </button>
        </div>
      )}

      {/* Desktop and tablet table */}

      <section className="data-panel desktop-data-table">
        <div className="table-scroll">
          <table className="dashboard-table users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Contact</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Joined</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="customer-cell">
                        <span
                          className={`customer-avatar avatar-${user.color}`}
                        >
                          {user.initials}
                        </span>

                        <div>
                          <strong>
                            {user.name}
                          </strong>

                          <small>{user.id}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="user-contact">
                        <span>
                          <Mail size={14} />
                          {user.email}
                        </span>

                        <small>
                          <Phone size={13} />
                          {user.phone}
                        </small>
                      </div>
                    </td>

                    <td>
                      <strong className="user-orders">
                        {user.orders}
                      </strong>
                    </td>

                    <td>
                      <strong className="user-spent">
                        ${user.spent.toFixed(2)}
                      </strong>
                    </td>

                    <td>{user.joined}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="table-not-found"
                  >
                    <UsersRound size={38} />

                    <strong>No user found</strong>

                    <span>
                      No user matches “{searchText}”.
                    </span>

                    <button
                      type="button"
                      onClick={clearSearch}
                    >
                      Show all users
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Mobile user cards */}

      <section className="mobile-data-list">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <article
              className="mobile-data-card user-mobile-card"
              key={user.id}
            >
              <div className="mobile-user-heading">
                <span
                  className={`customer-avatar mobile-user-avatar avatar-${user.color}`}
                >
                  {user.initials}
                </span>

                <div>
                  <h2>{user.name}</h2>
                  <span>{user.id}</span>
                </div>
              </div>

              <div className="mobile-contact-list">
                <a href={`mailto:${user.email}`}>
                  <span>
                    <Mail size={16} />
                  </span>

                  <div>
                    <small>Email address</small>
                    <strong>{user.email}</strong>
                  </div>
                </a>

                <a href={`tel:${user.phone}`}>
                  <span>
                    <Phone size={16} />
                  </span>

                  <div>
                    <small>Phone number</small>
                    <strong>{user.phone}</strong>
                  </div>
                </a>
              </div>

              <div className="mobile-user-statistics">
                <div>
                  <span>
                    <ShoppingBag size={15} />
                    Orders
                  </span>

                  <strong>{user.orders}</strong>
                </div>

                <div>
                  <span>
                    <WalletCards size={15} />
                    Total spent
                  </span>

                  <strong>
                    ${user.spent.toFixed(2)}
                  </strong>
                </div>

                <div>
                  <span>
                    <CalendarDays size={15} />
                    Joined
                  </span>

                  <strong>{user.joined}</strong>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="mobile-empty-state">
            <UsersRound size={44} />

            <strong>No user found</strong>

            <span>
              No user matches “{searchText}”.
            </span>

            <button
              type="button"
              onClick={clearSearch}
            >
              Show all users
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default Users;