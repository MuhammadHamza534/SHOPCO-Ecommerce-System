import { useMemo, useState } from "react";
import {
  CalendarDays,
  Package,
  ShoppingBag,
  X,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { initialOrders } from "../data/dashboardData";

const orderStatuses = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

function Orders() {
  const [orders, setOrders] = useState(initialOrders);
  const [searchParams, setSearchParams] =
    useSearchParams();

  const searchText =
    searchParams.get("search")?.trim() || "";

  const normalizedSearch =
    searchText.toLowerCase();

  const filteredOrders = useMemo(() => {
    if (!normalizedSearch) {
      return orders;
    }

    return orders.filter((order) => {
      return (
        order.customer
          .toLowerCase()
          .includes(normalizedSearch) ||
        order.email
          .toLowerCase()
          .includes(normalizedSearch) ||
        order.id
          .toLowerCase()
          .includes(normalizedSearch) ||
        order.status
          .toLowerCase()
          .includes(normalizedSearch)
      );
    });
  }, [orders, normalizedSearch]);

  function changeOrderStatus(orderId, newStatus) {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: newStatus,
            }
          : order
      )
    );
  }

  function clearSearch() {
    setSearchParams({});
  }

  function getInitials(name) {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("");
  }

  return (
    <div className="page orders-page">
      <div className="page-heading">
        <div>
          <h1>Orders</h1>

          <p>
            Review every order and update its delivery
            status.
          </p>
        </div>

        <div className="page-count">
          <ShoppingBag size={18} />
          {filteredOrders.length} Orders
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
          <table className="dashboard-table orders-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const statusClass =
                    order.status.toLowerCase();

                  return (
                    <tr key={order.id}>
                      <td>
                        <strong className="order-number">
                          #{order.id}
                        </strong>
                      </td>

                      <td>
                        <div className="customer-cell">
                          <span className="customer-avatar">
                            {getInitials(
                              order.customer
                            )}
                          </span>

                          <div>
                            <strong>
                              {order.customer}
                            </strong>

                            <small>
                              {order.email}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>{order.date}</td>

                      <td>{order.items}</td>

                      <td>
                        <strong className="order-total">
                          ${order.total.toFixed(2)}
                        </strong>
                      </td>

                      <td>
                        <select
                          value={order.status}
                          className={`order-status status-${statusClass}`}
                          aria-label={`Change status for order ${order.id}`}
                          onChange={(event) =>
                            changeOrderStatus(
                              order.id,
                              event.target.value
                            )
                          }
                        >
                          {orderStatuses.map(
                            (status) => (
                              <option
                                value={status}
                                key={status}
                              >
                                {status}
                              </option>
                            )
                          )}
                        </select>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="table-not-found"
                  >
                    <ShoppingBag size={37} />

                    <strong>No order found</strong>

                    <span>
                      No order matches “{searchText}”.
                    </span>

                    <button
                      type="button"
                      onClick={clearSearch}
                    >
                      Show all orders
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Mobile order cards */}

      <section className="mobile-data-list">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const statusClass =
              order.status.toLowerCase();

            return (
              <article
                className="mobile-data-card order-mobile-card"
                key={order.id}
              >
                <div className="mobile-card-heading">
                  <div>
                    <span>Order number</span>

                    <strong className="order-number">
                      #{order.id}
                    </strong>
                  </div>

                  <strong className="mobile-order-total">
                    ${order.total.toFixed(2)}
                  </strong>
                </div>

                <div className="mobile-customer">
                  <span className="customer-avatar">
                    {getInitials(order.customer)}
                  </span>

                  <div>
                    <strong>{order.customer}</strong>
                    <small>{order.email}</small>
                  </div>
                </div>

                <div className="mobile-info-grid">
                  <div className="mobile-info-item">
                    <span>
                      <CalendarDays size={15} />
                      Order date
                    </span>

                    <strong>{order.date}</strong>
                  </div>

                  <div className="mobile-info-item">
                    <span>
                      <Package size={15} />
                      Items
                    </span>

                    <strong>
                      {order.items}{" "}
                      {order.items === 1
                        ? "item"
                        : "items"}
                    </strong>
                  </div>
                </div>

                <div className="mobile-status-row">
                  <span>Order Status</span>

                  <select
                    value={order.status}
                    className={`order-status status-${statusClass}`}
                    aria-label={`Change status for order ${order.id}`}
                    onChange={(event) =>
                      changeOrderStatus(
                        order.id,
                        event.target.value
                      )
                    }
                  >
                    {orderStatuses.map((status) => (
                      <option
                        value={status}
                        key={status}
                      >
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </article>
            );
          })
        ) : (
          <div className="mobile-empty-state">
            <ShoppingBag size={42} />

            <strong>No order found</strong>

            <span>
              No order matches “{searchText}”.
            </span>

            <button
              type="button"
              onClick={clearSearch}
            >
              Show all orders
            </button>
          </div>
        )}
      </section>

      <p className="frontend-notice">
        Order status changes are temporary and will
        reset when the page is refreshed.
      </p>
    </div>
  );
}

export default Orders;