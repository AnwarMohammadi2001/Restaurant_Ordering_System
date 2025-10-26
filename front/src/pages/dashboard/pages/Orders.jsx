import React, { useEffect, useState } from "react";
import { getMenuItems } from "../services/MenuService";
import { createOrder } from "../services/ServiceManager";
import OrderList from "./OrderList";

const Orders = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [orders, setOrders] = useState([
    {
      category: "",
      menuItemId: "",
      menuItem: "",
      amount: "",
      price: "",
      note: "",
    },
  ]);
  const [refreshOrders, setRefreshOrders] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("create");

  // Fetch all menu items
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const data = await getMenuItems();
        setMenuItems(data);

        const uniqueCategories = [
          ...new Set(data.map((item) => item.category)),
        ];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Failed to load menu items:", err);
      }
    };
    fetchMenu();
  }, []);

  // Handle order changes
  const handleOrderChange = (index, e) => {
    const { name, value } = e.target;
    const updatedOrders = [...orders];
    updatedOrders[index][name] = value;

    if (name === "category") {
      updatedOrders[index].menuItem = "";
      updatedOrders[index].price = "";
    }

    setOrders(updatedOrders);
  };

  // Add order line
  const handleAddOrder = () => {
    setOrders([
      ...orders,
      {
        category: "",
        menuItemId: "",
        menuItem: "",
        amount: "",
        price: "",
        note: "",
      },
    ]);
  };

  // Remove order line
  const handleRemoveOrder = (index) => {
    if (orders.length > 1) {
      setOrders(orders.filter((_, i) => i !== index));
    }
  };

  // Submit order
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = { customerName, orders };
      await createOrder(payload);

      // Success state
      setCustomerName("");
      setOrders([
        {
          category: "",
          menuItemId: "",
          menuItem: "",
          amount: "",
          price: "",
          note: "",
        },
      ]);

      setRefreshOrders((prev) => !prev);
      setActiveTab("orders");

      // Show success message
      const submitBtn = e.target.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "✓ Order Created!";
      submitBtn.classList.add("bg-emerald-600");

      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.classList.remove("bg-emerald-600");
      }, 2000);
    } catch (err) {
      console.error(err);
      const submitBtn = e.target.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "❌ Failed - Try Again";
      submitBtn.classList.add("bg-rose-600");

      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.classList.remove("bg-rose-600");
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total
  const calculateTotal = () => {
    return orders
      .reduce((total, order) => {
        const price = parseFloat(order.price) || 0;
        const amount = parseInt(order.amount) || 0;
        return total + price * amount;
      }, 0)
      .toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-sm border border-white/20 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">🍽️</span>
            </div>
            <div className="text-left">
              <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Restaurant Dashboard
              </h1>
              <p className="text-slate-600 text-sm">
                Manage orders efficiently
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="lg:hidden mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-sm border border-white/20">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveTab("create")}
                className={`py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === "create"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-200"
                    : "text-slate-600 hover:bg-white/50"
                }`}
              >
                New Order
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === "orders"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-200"
                    : "text-slate-600 hover:bg-white/50"
                }`}
              >
                Orders
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Order Creation Card - Hidden on mobile when viewing orders */}
          <div
            className={`bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20 backdrop-blur-sm transform transition-all duration-500 ${
              activeTab === "create" ? "block" : "hidden lg:block"
            } ${
              activeTab === "create"
                ? "lg:translate-x-0 lg:opacity-100"
                : "lg:translate-x-4 lg:opacity-100"
            }`}
          >
            {/* Card Header */}
            <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-6 md:p-8">
              <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/10 rounded-full"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <span className="text-2xl">📝</span>
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                      Create Order
                    </h2>
                    <p className="text-blue-100">Add new customer order</p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
              {/* Customer Name */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Customer Name
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    className="w-full border border-slate-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 bg-white/50 backdrop-blur-sm group-hover:border-blue-300"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <span className="text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      👤
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Order Items
                  </h3>
                  <span className="text-sm font-medium bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                    {orders.length} item{orders.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {orders.map((order, index) => {
                  const filteredMenuItems = menuItems.filter(
                    (item) => item.category === order.category
                  );

                  return (
                    <div
                      key={index}
                      className="border border-slate-200 rounded-2xl p-5 space-y-5 bg-gradient-to-br from-white to-slate-50/50 relative transition-all duration-300 hover:shadow-lg hover:border-slate-300 group"
                    >
                      {/* Remove button */}
                      {orders.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOrder(index)}
                          className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-all duration-300 shadow-lg hover:scale-110 z-10"
                        >
                          ✕
                        </button>
                      )}

                      {/* Item Badge */}
                      <div className="absolute -top-3 left-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Item {index + 1}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Category */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-700">
                            Category
                          </label>
                          <select
                            name="category"
                            value={order.category}
                            onChange={(e) => handleOrderChange(index, e)}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 bg-white"
                            required
                          >
                            <option value="">Select Category</option>
                            {categories.map((cat, i) => (
                              <option key={i} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Menu Item */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-700">
                            Menu Item
                          </label>
                          <select
                            name="menuItem"
                            value={order.menuItemId || ""}
                            onChange={(e) => {
                              const id = e.target.value;
                              const selected = menuItems.find(
                                (item) => item.id.toString() === id
                              );
                              const updatedOrders = [...orders];
                              updatedOrders[index].menuItem = selected.name;
                              updatedOrders[index].price = selected.price;
                              updatedOrders[index].menuItemId = selected.id;
                              setOrders(updatedOrders);
                            }}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
                            required
                            disabled={!order.category}
                          >
                            <option value="">Select Item</option>
                            {filteredMenuItems.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name} — ${item.price}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Price */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-700">
                            Price ($)
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              name="price"
                              value={order.price}
                              onChange={(e) => handleOrderChange(index, e)}
                              placeholder="0.00"
                              className="w-full border border-slate-200 rounded-xl pl-4 pr-10 py-3 focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 bg-white"
                              step="0.01"
                              min="0"
                              required
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <span className="text-slate-400 text-sm font-medium">
                                $
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-700">
                            Quantity
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              name="amount"
                              value={order.amount}
                              onChange={(e) => handleOrderChange(index, e)}
                              placeholder="0"
                              className="w-full border border-slate-200 rounded-xl pl-4 pr-10 py-3 focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 bg-white"
                              min="1"
                              required
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <span className="text-slate-400 text-sm font-medium">
                                #
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Line Total */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-700">
                            Line Total
                          </label>
                          <div className="w-full border-2 border-emerald-200 bg-emerald-50 rounded-xl px-4 py-3 text-emerald-700 font-bold text-center">
                            $
                            {(
                              (parseFloat(order.price) || 0) *
                              (parseInt(order.amount) || 0)
                            ).toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Note */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                          Special Instructions
                        </label>
                        <textarea
                          name="note"
                          value={order.note}
                          onChange={(e) => handleOrderChange(index, e)}
                          placeholder="Any special requests or notes..."
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 bg-white resize-none"
                          rows="2"
                        ></textarea>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border-2 border-blue-200/50">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-lg font-bold text-slate-800">
                      Order Total:
                    </span>
                    <p className="text-sm text-slate-600">
                      {orders.length} items
                    </p>
                  </div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ${calculateTotal()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleAddOrder}
                  className="w-full flex items-center justify-center gap-3 border-2 border-dashed border-blue-300 text-blue-600 py-4 rounded-2xl hover:bg-blue-50 hover:border-blue-400 hover:shadow-lg transition-all duration-300 font-semibold group"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">
                    +
                  </span>
                  Add Another Item
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-bold hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing Order...
                    </div>
                  ) : (
                    "Submit Order"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Order List - Hidden on mobile when creating order */}
          <div
            className={`bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20 backdrop-blur-sm transform transition-all duration-500 ${
              activeTab === "orders" ? "block" : "hidden lg:block"
            } ${
              activeTab === "orders"
                ? "lg:translate-x-0 lg:opacity-100"
                : "lg:-translate-x-4 lg:opacity-100"
            }`}
          >
            {/* Card Header */}
            <div className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700 p-6 md:p-8">
              <div className="absolute top-4 left-4 w-16 h-16 bg-white/10 rounded-full"></div>
              <div className="absolute bottom-6 right-6 w-10 h-10 bg-white/10 rounded-full"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <span className="text-2xl">📋</span>
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                      Recent Orders
                    </h2>
                    <p className="text-emerald-100">View all customer orders</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <OrderList refresh={refreshOrders} />
            </div>
          </div>
        </div>

        {/* Mobile Navigation Hint */}
        <div className="lg:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg border border-white/20">
          <p className="text-sm text-slate-600 font-medium">
            Switch between <span className="text-blue-600">New Order</span> and{" "}
            <span className="text-emerald-600">Orders</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Orders;
