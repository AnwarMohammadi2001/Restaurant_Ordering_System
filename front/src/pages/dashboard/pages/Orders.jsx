import React, { useEffect, useState } from "react";
import { getMenuItems } from "../services/MenuService";
import { createOrder, updateOrder } from "../services/ServiceManager"; // Added updateOrder import
import OrderList from "./OrderList";

const Orders = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [orders, setOrders] = useState([
    {
      id: Date.now(),
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
  const [editingOrderId, setEditingOrderId] = useState(null); // Track which order is being edited
  const [isEditMode, setIsEditMode] = useState(false); // Track if we're in edit mode

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

    setOrders((prevOrders) => {
      const updatedOrders = [...prevOrders];
      updatedOrders[index] = {
        ...updatedOrders[index],
        [name]: value,
      };

      if (name === "category") {
        updatedOrders[index].menuItem = "";
        updatedOrders[index].price = "";
        updatedOrders[index].menuItemId = "";
      }

      return updatedOrders;
    });
  };

  // Add order line
  const handleAddOrder = () => {
    setOrders((prevOrders) => [
      ...prevOrders,
      {
        id: Date.now(),
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
      setOrders((prevOrders) => prevOrders.filter((_, i) => i !== index));
    }
  };

  // Submit order (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = { customerName, orders };

      if (isEditMode && editingOrderId) {
        // Update existing order
        await updateOrder(editingOrderId, payload);
      } else {
        // Create new order
        await createOrder(payload);
      }

      // Reset form after successful submission
      resetForm();

      setRefreshOrders((prev) => !prev);
      setActiveTab("orders");

      // Show success message
      const submitBtn = e.target.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = isEditMode
        ? "✓ سفارش بروز شد!"
        : "✓ سفارش ایجاد شد!";
      submitBtn.classList.add("bg-emerald-600");

      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.classList.remove("bg-emerald-600");
      }, 2000);
    } catch (err) {
      console.error(err);
      const submitBtn = e.target.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "❌ خطا - دوباره تلاش کنید";
      submitBtn.classList.add("bg-rose-600");

      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.classList.remove("bg-rose-600");
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setCustomerName("");
    setOrders([
      {
        id: Date.now(),
        category: "",
        menuItemId: "",
        menuItem: "",
        amount: "",
        price: "",
        note: "",
      },
    ]);
    setEditingOrderId(null);
    setIsEditMode(false);
  };

  // Cancel editing and reset form
  const handleCancelEdit = () => {
    resetForm();
  };

  // Load order data for editing
  // In your Orders component, replace the handleEditOrder function with this:

  // Load order data for editing
  const handleEditOrder = (orderData) => {
    setEditingOrderId(orderData.id);
    setIsEditMode(true);
    setCustomerName(orderData.customerName);

    // Check if order items are in orderData.orders or orderData.items
    const orderItems = (orderData.orders || orderData.items || []).map(
      (item, index) => ({
        id: Date.now() + index, // Generate new unique IDs for form items
        category: item.category || "",
        menuItemId: item.menuItemId || item.id?.toString() || "",
        menuItem: item.menuItem || item.name || "",
        amount: item.amount?.toString() || item.quantity?.toString() || "",
        price: item.price?.toString() || "",
        note: item.note || "",
      })
    );

    setOrders(orderItems);
    setActiveTab("create");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="">
        {/* Mobile Tabs */}
        <div className="lg:hidden mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-sm border border-white/20">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setActiveTab("create");
                  if (activeTab === "create" && isEditMode) {
                    resetForm();
                  }
                }}
                className={`py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === "create"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-200"
                    : "text-slate-600 hover:bg-white/50"
                }`}
              >
                {isEditMode ? "ویرایش سفارش" : "سفارش جدید"}
              </button>
              <button
                onClick={() => {
                  setActiveTab("orders");
                  if (isEditMode) {
                    resetForm();
                  }
                }}
                className={`py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === "orders"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-200"
                    : "text-slate-600 hover:bg-white/50"
                }`}
              >
                لیست سفارش‌ها
              </button>
            </div>
          </div>
        </div>

        <div className="">
          {/* Order Creation/Editing Card */}
          <div
            className={`bg-white overflow-hidden border border-white/20 backdrop-blur-sm transform transition-all duration-500 ${
              activeTab === "create" ? "block" : "hidden lg:block"
            } ${
              activeTab === "create"
                ? "lg:translate-x-0 lg:opacity-100"
                : "lg:translate-x-4 lg:opacity-100"
            }`}
          >
            {/* Card Header */}
            <div
              className={`relative p-6 md:p-4 ${
                isEditMode ? "bg-amber-600" : "bg-cyan-800"
              }`}
            >
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <span className="text-2xl">{isEditMode ? "✏️" : "📝"}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                      {isEditMode ? "ویرایش سفارش" : "ایجاد سفارش"}
                    </h2>
                    <p className="text-blue-100">
                      {isEditMode
                        ? "سفارش انتخاب شده را ویرایش کنید"
                        : "سفارش جدید مشتری را اضافه کنید"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
              {/* Customer Name */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isEditMode ? "bg-amber-500" : "bg-blue-500"
                    }`}
                  ></span>
                  نام مشتری
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="نام مشتری را وارد کنید"
                    className="w-full border border-slate-200 rounded-sm focus:outline-none px-5 py-4 focus:ring-1 focus:ring-cyan-800 transition-all duration-300 bg-gray-200 backdrop-blur-sm group-hover:border-cyan-800"
                    required
                  />
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isEditMode ? "bg-amber-500" : "bg-purple-500"
                      }`}
                    ></span>
                    آیتم‌های سفارش
                  </h3>
                  <span className="text-sm font-medium bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                    {orders.length} آیتم
                  </span>
                </div>

                {orders.map((order, index) => {
                  const filteredMenuItems = menuItems.filter(
                    (item) => item.category === order.category
                  );

                  return (
                    <div
                      key={order.id}
                      className="border border-slate-200 rounded-md p-2 space-y-5 bg-gradient-to-br from-white to-slate-50/50 relative transition-all duration-300 hover:shadow-lg hover:border-slate-300 group"
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

                      <div className="grid grid-cols-1 md:grid-cols-6 gap-1">
                        {/* Category */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-slate-700">
                            دسته‌بندی
                          </label>
                          <select
                            name="category"
                            value={order.category}
                            onChange={(e) => handleOrderChange(index, e)}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 bg-white"
                            required
                          >
                            <option value="">انتخاب دسته</option>
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
                            آیتم منو
                          </label>
                          <select
                            name="menuItem"
                            value={order.menuItemId || ""}
                            onChange={(e) => {
                              const id = e.target.value;
                              const selected = menuItems.find(
                                (item) => item.id.toString() === id
                              );
                              if (selected) {
                                setOrders((prevOrders) => {
                                  const updatedOrders = [...prevOrders];
                                  updatedOrders[index] = {
                                    ...updatedOrders[index],
                                    menuItem: selected.name,
                                    price: selected.price,
                                    menuItemId: selected.id.toString(),
                                  };
                                  return updatedOrders;
                                });
                              }
                            }}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
                            required
                            disabled={!order.category}
                          >
                            <option value="">انتخاب آیتم</option>
                            {filteredMenuItems.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name} — {item.price} افغانی
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="md:flex items-center gap-x-1 md:col-span-2">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                              قیمت (افغانی)
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
                                  AFN
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Amount */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">
                              تعداد
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
                              مجموع خط
                            </label>
                            <div className="w-full border-2 border-emerald-200 bg-emerald-50 rounded-xl px-4 py-3 text-emerald-700 font-bold text-center">
                              {(
                                (parseFloat(order.price) || 0) *
                                (parseInt(order.amount) || 0)
                              ).toFixed(2)}{" "}
                              افغانی
                            </div>
                          </div>
                        </div>

                        {/* Note */}
                        <div className="space-y-2 md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700">
                            یادداشت
                          </label>
                          <textarea
                            name="note"
                            value={order.note}
                            onChange={(e) => handleOrderChange(index, e)}
                            placeholder="یادداشت‌ها..."
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:ring-3 min-h-[20px] max-h-[50px] focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 bg-white resize-none"
                            rows="2"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleAddOrder}
                className="w-full flex items-center justify-center gap-3 border-2 border-dashed border-blue-300 text-blue-600 py-4 rounded-2xl hover:bg-blue-50 hover:border-blue-400 hover:shadow-lg transition-all duration-300 font-semibold group"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">
                  +
                </span>
                افزودن آیتم دیگر
              </button>

              {/* Order Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border-2 border-blue-200/50">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-lg font-bold text-slate-800">
                      مجموع سفارش:
                    </span>
                    <p className="text-sm text-slate-600">
                      {orders.length} آیتم
                    </p>
                  </div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {calculateTotal()} افغانی
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                {isEditMode && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 bg-slate-500 text-white py-4 rounded-2xl font-bold hover:bg-slate-600 focus:ring-4 focus:ring-slate-200 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                  >
                    انصراف
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 bg-gradient-to-r text-white py-4 rounded-2xl font-bold focus:ring-4 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] ${
                    isEditMode
                      ? "from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 focus:ring-amber-200"
                      : "from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:ring-blue-200"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {isEditMode
                        ? "در حال بروزرسانی..."
                        : "در حال پردازش سفارش..."}
                    </div>
                  ) : isEditMode ? (
                    "بروزرسانی سفارش"
                  ) : (
                    "ثبت سفارش"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Order List */}
          <div
            className={`bg-white overflow-hidden border border-white/20 backdrop-blur-sm transform transition-all duration-500 ${
              activeTab === "orders" ? "block" : "hidden lg:block"
            } ${
              activeTab === "orders"
                ? "lg:translate-x-0 lg:opacity-100"
                : "lg:-translate-x-0 lg:opacity-100"
            }`}
          >
            {/* Card Header */}
            <div className="relative bg-cyan-800 p-6 md:p-4">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <span className="text-2xl">📋</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      لیست سفارش‌ها
                    </h2>
                    <p className="text-blue-100">
                      نمایش آخرین سفارش‌های مشتریان
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="">
              <OrderList
                refresh={refreshOrders}
                onEditOrder={handleEditOrder} // Pass edit handler to OrderList
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
