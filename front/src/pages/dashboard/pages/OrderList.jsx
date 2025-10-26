import React, { useEffect, useState } from "react";
import axios from "axios";

const OrderList = ({refresh}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  if (loading) return <div className="p-4 text-center">Loading orders...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white shadow-md rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-700">
                Order #{order.id} — {order.customerName}
              </h3>
              <span className="text-blue-600 font-semibold">
                Total: ${order.total}
              </span>
              <span className="text-blue-600 font-semibold">
                is delivered{order.isDelivered ? "✔️" : "❌"}
              </span>
            </div>

            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="border px-3 py-2 text-left">Category</th>
                  <th className="border px-3 py-2 text-left">Item</th>
                  <th className="border px-3 py-2 text-left">Amount</th>
                  <th className="border px-3 py-2 text-left">Price</th>
                  <th className="border px-3 py-2 text-left">Note</th>
                  <th className="border px-3 py-2 text-left">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border px-3 py-2">{item.category}</td>
                    <td className="border px-3 py-2">{item.menuItem}</td>
                    <td className="border px-3 py-2">{item.amount}</td>
                    <td className="border px-3 py-2">${item.price}</td>
                    <td className="border px-3 py-2">
                      {item.note || "-"}
                    </td>
                    <td className="border px-3 py-2">
                      ${item.price * item.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 text-right text-gray-700 font-semibold">
              Grand Total: ${order.total}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderList;
