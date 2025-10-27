import React, { useEffect, useState } from "react";
import axios from "axios";
import { payRemaining, updateOrderPayment } from "../services/ServiceManager";
import Swal from "sweetalert2";

const OrderList = ({ refresh }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/orders`);
        setOrders(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [refresh]);

  const toggleOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handlePayRemaining = async (order) => {
    try {
      const confirm = await Swal.fire({
        title: "آیا مطمئن هستید؟",
        text: "آیا می‌خواهید باقی‌مانده این سفارش پرداخت شود؟",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "بله، پرداخت کن",
        cancelButtonText: "لغو",
      });

      if (confirm.isConfirmed) {
        const updated = await payRemaining(order);
        Swal.fire("موفق!", "سفارش به طور کامل پرداخت شد.", "success");
        console.log("Updated order:", updated);
        // Refresh orders list
        const res = await axios.get(`${BASE_URL}/orders`);
        setOrders(res.data);
      }
    } catch (err) {
      Swal.fire("خطا", "پرداخت باقی‌مانده انجام نشد.", "error");
    }
  };

  const handleEditPayment = (order) => {
    setEditingPayment(order.id);
    setPaymentAmount(order.recip.toString());
  };

  const handleCancelEdit = () => {
    setEditingPayment(null);
    setPaymentAmount("");
  };

  const handleSavePayment = async (order) => {
    if (!paymentAmount || isNaN(parseFloat(paymentAmount))) {
      Swal.fire("خطا", "لطفا مبلغ معتبر وارد کنید", "error");
      return;
    }

    const newRecip = parseFloat(paymentAmount);
    const total = parseFloat(order.total);

    if (newRecip < 0) {
      Swal.fire("خطا", "مبلغ نمی‌تواند منفی باشد", "error");
      return;
    }

    if (newRecip > total) {
      Swal.fire("خطا", "مبلغ دریافتی نمی‌تواند بیشتر از مبلغ کل باشد", "error");
      return;
    }

    try {
      const updatedOrder = await updateOrderPayment(order.id, newRecip);
      Swal.fire("موفق!", "مبلغ دریافتی با موفقیت به‌روزرسانی شد", "success");

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o.id === order.id
            ? { ...o, recip: newRecip, remained: total - newRecip }
            : o
        )
      );

      setEditingPayment(null);
      setPaymentAmount("");
    } catch (err) {
      Swal.fire("خطا", "به‌روزرسانی مبلغ دریافتی انجام نشد", "error");
    }
  };

  const handlePaymentAmountChange = (e, order) => {
    const value = e.target.value;
    setPaymentAmount(value);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">در حال بارگذاری سفارشات...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <p className="text-red-600 text-lg font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );

  if (orders.length === 0)
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📦</span>
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            هیچ سفارشی وجود ندارد
          </h3>
          <p className="text-gray-500">هنوز هیچ سفارشی ثبت نشده است.</p>
        </div>
      </div>
    );

  return (
    <div className="p-4 md:p-6">
      <div className="space-y-4 md:space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
          >
            {/* Order Header - Always Visible */}
            <div
              className="p-4 md:p-6 cursor-pointer bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300"
              onClick={() => toggleOrder(order.id)}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      order.isDelivered ? "bg-green-500" : "bg-orange-500"
                    }`}
                  ></div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-800">
                      سفارش #{order.id}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      مشتری:{" "}
                      <span className="font-semibold">
                        {order.customerName}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 md:gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">وضعیت تحویل</p>
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                        order.isDelivered
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {order.isDelivered ? (
                        <>
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          تحویل شده
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                          در انتظار تحویل
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-500">مبلغ کل</p>
                    <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {order.total} افغانی
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-500">تعداد اقلام</p>
                    <p className="text-lg font-semibold text-gray-700">
                      {order.items.length} قلم
                    </p>
                  </div>

                  <div
                    className={`transform transition-transform duration-300 ${
                      expandedOrder === order.id ? "rotate-180" : ""
                    }`}
                  >
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Details - Expandable */}
            {expandedOrder === order.id && (
              <div className="border-t border-gray-200">
                <div className="p-4 md:p-6">
                  {/* Desktop Table */}
                  <div className="hidden lg:block overflow-hidden rounded-lg border border-gray-200">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-blue-50">
                          <th className="px-6 py-4 text-right font-semibold text-gray-700 border-b border-gray-200">
                            کتگوری
                          </th>
                          <th className="px-6 py-4 text-right font-semibold text-gray-700 border-b border-gray-200">
                            آیتم
                          </th>
                          <th className="px-6 py-4 text-center font-semibold text-gray-700 border-b border-gray-200">
                            تعداد
                          </th>
                          <th className="px-6 py-4 text-left font-semibold text-gray-700 border-b border-gray-200">
                            قیمت واحد
                          </th>
                          <th className="px-6 py-4 text-right font-semibold text-gray-700 border-b border-gray-200">
                            یادداشت
                          </th>
                          <th className="px-6 py-4 text-left font-semibold text-gray-700 border-b border-gray-200">
                            مجموع
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item, index) => (
                          <tr
                            key={item.id}
                            className={`hover:bg-blue-50 transition-colors duration-200 ${
                              index < order.items.length - 1
                                ? "border-b border-gray-100"
                                : ""
                            }`}
                          >
                            <td className="px-6 py-4 text-right text-gray-700">
                              {item.category}
                            </td>
                            <td className="px-6 py-4 text-right text-gray-800 font-medium">
                              {item.menuItem}
                            </td>
                            <td className="px-6 py-4 text-center text-gray-700">
                              <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-semibold">
                                {item.amount}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-left text-gray-700">
                              {item.price} افغانی
                            </td>
                            <td className="px-6 py-4 text-right text-gray-600 max-w-xs">
                              {item.note || (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-left text-green-600 font-bold">
                              {(item.price * item.amount).toFixed(2)} افغانی
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="lg:hidden space-y-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-all duration-200"
                      >
                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2 flex justify-between items-start mb-2">
                            <span className="text-lg font-bold text-gray-800">
                              {item.menuItem}
                            </span>
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                              {item.category}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <p className="text-sm text-gray-500">تعداد</p>
                            <p className="font-semibold text-gray-700">
                              {item.amount} عدد
                            </p>
                          </div>

                          <div className="space-y-1">
                            <p className="text-sm text-gray-500">قیمت واحد</p>
                            <p className="font-semibold text-gray-700">
                              {item.price} افغانی
                            </p>
                          </div>

                          <div className="space-y-1">
                            <p className="text-sm text-gray-500">مجموع</p>
                            <p className="font-bold text-green-600">
                              {(item.price * item.amount).toFixed(2)} افغانی
                            </p>
                          </div>

                          {item.note && (
                            <div className="col-span-2 space-y-1 mt-2 pt-2 border-t border-gray-200">
                              <p className="text-sm text-gray-500">یادداشت</p>
                              <p className="text-gray-700 text-sm bg-white p-2 rounded-lg border">
                                {item.note}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-4 bg-blue-50 rounded-xl">
                        <p className="text-sm text-gray-600 mb-2">
                          مبلغ کل سفارش
                        </p>
                        <p className="text-2xl font-bold text-blue-700">
                          {order.total} افغانی
                        </p>
                      </div>

                      <div className="text-center p-4 bg-green-50 rounded-xl">
                        <p className="text-sm text-gray-600 mb-2">
                          مبلغ دریافتی
                        </p>
                        {editingPayment === order.id ? (
                          <div className="space-y-2">
                            <input
                              type="number"
                              value={paymentAmount}
                              onChange={(e) =>
                                handlePaymentAmountChange(e, order)
                              }
                              className="w-full px-3 py-2 border border-green-300 rounded-lg text-center text-lg font-bold text-green-700"
                              placeholder="مبلغ دریافتی"
                              step="0.01"
                              min="0"
                              max={order.total}
                            />
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => handleSavePayment(order)}
                                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                              >
                                ذخیره
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                              >
                                لغو
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-2xl font-bold text-green-700">
                              {order.recip} افغانی
                            </p>
                            <button
                              onClick={() => handleEditPayment(order)}
                              className="mt-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                            >
                              ویرایش
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="text-center p-4 bg-red-50 rounded-xl">
                        <p className="text-sm text-gray-600 mb-2">
                          مبلغ باقی‌مانده
                        </p>
                        <p className="text-2xl font-bold text-red-600">
                          {order.remained} افغانی
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {order.remained > 0 && (
                      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handlePayRemaining(order)}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-md transition-all duration-300 font-semibold flex items-center justify-center gap-2"
                        >
                          <span>💳</span>
                          پرداخت کامل باقی‌مانده
                        </button>

                        {editingPayment !== order.id && (
                          <button
                            onClick={() => handleEditPayment(order)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition-all duration-300 font-semibold flex items-center justify-center gap-2"
                          >
                            <span>✏️</span>
                            ویرایش مبلغ دریافتی
                          </button>
                        )}
                      </div>
                    )}

                    {order.remained === 0 && (
                      <div className="text-center p-4 bg-emerald-100 rounded-xl border border-emerald-200">
                        <p className="text-emerald-700 font-semibold text-lg">
                          ✅ این سفارش به طور کامل پرداخت شده است
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderList;
