import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Box,
  CircleDollarSign,
  ShoppingCart,
  TrendingUp,
  UsersRound,
} from "lucide-react";

import {
  initialOrders,
  monthlySales,
  summaryCards,
  weeklyRevenue,
} from "../data/dashboardData";

const cardIcons = {
  revenue: CircleDollarSign,
  orders: ShoppingCart,
  customers: UsersRound,
  products: Box,
};

function Dashboard() {
  return (
    <div className="page dashboard-page">
      <div className="page-heading">
        <div>
          <h1>Dashboard</h1>

          <p>Here is what is happening with your shop today.</p>
        </div>

        <div className="dashboard-date">08 September 2026</div>
      </div>

      <section className="summary-grid">
        {summaryCards.map((card) => {
          const Icon = cardIcons[card.type];

          return (
            <article key={card.id} className={`summary-card ${card.type}`}>
              <div className="summary-icon">
                <Icon size={24} />
              </div>

              <div className="summary-information">
                <span>{card.title}</span>

                <strong>{card.value}</strong>

                <small>{card.description}</small>
              </div>
            </article>
          );
        })}
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-panel sales-panel">
          <div className="panel-heading">
            <div>
              <span>Sales Overview</span>
              <h2>$18,450.00</h2>
            </div>

            <span className="growth-badge">
              <TrendingUp size={15} />
              14.2%
            </span>
          </div>

          <div className="large-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlySales}
                barGap={5}
                margin={{
                  top: 15,
                  right: 5,
                  left: -20,
                  bottom: 0,
                }}
              >
                <CartesianGrid stroke="#34405f" vertical={false} />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#91a0c5",
                    fontSize: 12,
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "#91a0c5",
                    fontSize: 12,
                  }}
                />

                <Tooltip
                  cursor={{
                    fill: "rgba(115, 87, 245, 0.08)",
                  }}
                  contentStyle={{
                    backgroundColor: "#151d39",
                    border: "1px solid #354166",
                    borderRadius: "10px",
                    color: "#ffffff",
                  }}
                  labelStyle={{
                    color: "#ffffff",
                  }}
                />

                <Bar
                  dataKey="sales"
                  name="Sales"
                  fill="#7357f5"
                  radius={[5, 5, 0, 0]}
                />

                <Bar
                  dataKey="returns"
                  name="Returns"
                  fill="#2da9f8"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-legend">
            <span>
              <i className="legend-color sales-color" />
              Sales
            </span>

            <span>
              <i className="legend-color returns-color" />
              Returns
            </span>
          </div>
        </article>

        <div className="dashboard-side-panels">
          <article className="dashboard-panel revenue-panel">
            <div className="panel-heading">
              <div>
                <span>Weekly Revenue</span>
                <h2>$6,420</h2>
              </div>

              <span className="growth-badge">+8.4%</span>
            </div>

            <div className="small-chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={weeklyRevenue}
                  margin={{
                    top: 10,
                    right: 0,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="revenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#9a83ff" stopOpacity={0.6} />

                      <stop offset="100%" stopColor="#9a83ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#151d39",
                      border: "1px solid #354166",
                      borderRadius: "10px",
                      color: "#ffffff",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#9a83ff"
                    strokeWidth={3}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="revenue-days">
              {weeklyRevenue.map((item) => (
                <span key={item.day}>{item.day}</span>
              ))}
            </div>
          </article>

          <article className="dashboard-panel recent-panel">
            <div className="panel-heading">
              <h2>Recent Orders</h2>

              <span className="view-all">View all</span>
            </div>

            <div className="recent-orders">
              {initialOrders.slice(0, 4).map((order) => {
                const initials = order.customer
                  .split(" ")
                  .map((word) => word[0])
                  .join("");

                return (
                  <div className="recent-order" key={order.id}>
                    <span className="customer-avatar">{initials}</span>

                    <div className="recent-order-info">
                      <strong>{order.customer}</strong>
                      <small>#{order.id}</small>
                    </div>

                    <strong className="recent-price">
                      ${order.total.toFixed(2)}
                    </strong>
                  </div>
                );
              })}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
