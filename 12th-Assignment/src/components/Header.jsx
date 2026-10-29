import { useMemo, useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Bell,
  Menu,
  Search,
  Settings,
  ShoppingCart,
  UserRound,
} from "lucide-react";

import {
  initialOrders,
  users,
} from "../data/dashboardData";

const pageTitles = {
  "/": "Dashboard",
  "/orders": "Orders",
  "/users": "Users",
  "/products": "Products",
};

function Header({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [searchText, setSearchText] =
    useState("");

  const currentPageTitle =
    pageTitles[location.pathname] || "Dashboard";

  const normalizedSearch = searchText
    .trim()
    .toLowerCase();

  const searchResults = useMemo(() => {
    if (!normalizedSearch) {
      return {
        orders: [],
        users: [],
      };
    }

    const matchedOrders = initialOrders.filter(
      (order) => {
        const customerName =
          order.customer.toLowerCase();

        const customerEmail =
          order.email.toLowerCase();

        const orderId = order.id.toLowerCase();

        const orderStatus =
          order.status.toLowerCase();

        return (
          customerName.includes(normalizedSearch) ||
          customerEmail.includes(normalizedSearch) ||
          orderId.includes(normalizedSearch) ||
          orderStatus.includes(normalizedSearch)
        );
      }
    );

    const matchedUsers = users.filter((user) => {
      const userName = user.name.toLowerCase();
      const userEmail = user.email.toLowerCase();
      const userId = user.id.toLowerCase();
      const userPhone = user.phone.toLowerCase();

      return (
        userName.includes(normalizedSearch) ||
        userEmail.includes(normalizedSearch) ||
        userId.includes(normalizedSearch) ||
        userPhone.includes(normalizedSearch)
      );
    });

    return {
      orders: matchedOrders.slice(0, 4),
      users: matchedUsers.slice(0, 4),
    };
  }, [normalizedSearch]);

  const hasResults =
    searchResults.orders.length > 0 ||
    searchResults.users.length > 0;

  function clearSearch() {
    setSearchText("");
  }

  function openOrderResult(order) {
    const searchValue = encodeURIComponent(
      order.customer
    );

    navigate(`/orders?search=${searchValue}`);

    clearSearch();
  }

  function openUserResult(user) {
    const searchValue = encodeURIComponent(
      user.name
    );

    navigate(`/users?search=${searchValue}`);

    clearSearch();
  }

  function handleSearchSubmit(event) {
    event.preventDefault();

    if (!normalizedSearch) {
      return;
    }

    if (searchResults.orders.length > 0) {
      openOrderResult(searchResults.orders[0]);
      return;
    }

    if (searchResults.users.length > 0) {
      openUserResult(searchResults.users[0]);
    }
  }

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button
          type="button"
          className="header-icon-button menu-toggle"
          aria-label="Toggle navigation"
          onClick={onMenuClick}
        >
          <Menu size={22} />
        </button>

        <form
          className="header-search"
          onSubmit={handleSearchSubmit}
        >
          <Search size={20} />

          <input
            type="search"
            value={searchText}
            placeholder="Search users or orders"
            aria-label="Search users or orders"
            autoComplete="off"
            onChange={(event) =>
              setSearchText(event.target.value)
            }
          />

          {normalizedSearch && (
            <div className="search-results">
              {hasResults ? (
                <>
                  {searchResults.orders.length >
                    0 && (
                    <div className="search-section">
                      <p>Orders</p>

                      {searchResults.orders.map(
                        (order) => (
                          <button
                            type="button"
                            className="search-result-item"
                            key={order.id}
                            onClick={() =>
                              openOrderResult(order)
                            }
                          >
                            <span className="result-icon order-result">
                              <ShoppingCart
                                size={17}
                              />
                            </span>

                            <span className="result-information">
                              <strong>
                                {order.customer}
                              </strong>

                              <small>
                                #{order.id} · $
                                {order.total.toFixed(
                                  2
                                )}
                              </small>
                            </span>
                          </button>
                        )
                      )}
                    </div>
                  )}

                  {searchResults.users.length >
                    0 && (
                    <div className="search-section">
                      <p>Users</p>

                      {searchResults.users.map(
                        (user) => (
                          <button
                            type="button"
                            className="search-result-item"
                            key={user.id}
                            onClick={() =>
                              openUserResult(user)
                            }
                          >
                            <span className="result-icon user-result">
                              <UserRound size={17} />
                            </span>

                            <span className="result-information">
                              <strong>
                                {user.name}
                              </strong>

                              <small>
                                {user.id} ·{" "}
                                {user.email}
                              </small>
                            </span>
                          </button>
                        )
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="no-search-results">
                  <Search size={27} />

                  <strong>
                    No matching user or order found
                  </strong>

                  <span>
                    No result found for “
                    {searchText.trim()}”
                  </span>
                </div>
              )}
            </div>
          )}
        </form>

        <h2 className="mobile-page-title">
          {currentPageTitle}
        </h2>
      </div>

      <div className="header-actions">
        <button
          type="button"
          className="header-icon-button"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={20} />

          <span className="notification-dot" />
        </button>

        <button
          type="button"
          className="header-icon-button settings-button"
          aria-label="Settings"
          title="Settings"
        >
          <Settings size={20} />
        </button>

        <div className="header-profile">
          <span className="profile-avatar">
            HM
          </span>

          <div>
            <strong>Hamza</strong>
            <small>Administrator</small>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;