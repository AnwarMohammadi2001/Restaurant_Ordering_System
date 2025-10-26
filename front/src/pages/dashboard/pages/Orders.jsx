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
  const [refreshOrders, setRefreshOrders] = useState(false); // triggers OrderList reload

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
    setOrders(orders.filter((_, i) => i !== index));
  };

  // Submit order
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { customerName, orders };
      await createOrder(payload);

      alert("Order created successfully!");
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

      // Trigger refresh of OrderList
      setRefreshOrders((prev) => !prev);
    } catch (err) {
      console.error(err);
      alert("Failed to create order.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">
          Create New Order
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Name */}
          <div>
            <label className="block text-gray-600 mb-1">Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              className="w-full border p-2 rounded focus:ring focus:ring-blue-200"
              required
            />
          </div>

          {/* Order Lines */}
          {orders.map((order, index) => {
            const filteredMenuItems = menuItems.filter(
              (item) => item.category === order.category
            );

            return (
              <div
                key={index}
                className="border rounded-lg p-4 space-y-3 bg-gray-50 relative"
              >
                <button
                  type="button"
                  onClick={() => handleRemoveOrder(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm"
                >
                  ✕
                </button>

                <div>
                  <label className="block text-gray-600 mb-1">Category</label>
                  <select
                    name="category"
                    value={order.category}
                    onChange={(e) => handleOrderChange(index, e)}
                    className="w-full border p-2 rounded focus:ring focus:ring-blue-200"
                    required
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((cat, i) => (
                      <option key={i} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-600 mb-1">Menu Item</label>
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
                    className="w-full border p-2 rounded focus:ring focus:ring-blue-200"
                    required
                    disabled={!order.category}
                  >
                    <option value="">-- Select Item --</option>
                    {filteredMenuItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} — ${item.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-600 mb-1">Price</label>
                  <input
                    type="number"
                    name="price"
                    value={order.price}
                    onChange={(e) => handleOrderChange(index, e)}
                    placeholder="Enter or edit price"
                    className="w-full border p-2 rounded focus:ring focus:ring-blue-200"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-600 mb-1">Amount</label>
                  <input
                    type="number"
                    name="amount"
                    value={order.amount}
                    onChange={(e) => handleOrderChange(index, e)}
                    placeholder="Enter quantity"
                    className="w-full border p-2 rounded focus:ring focus:ring-blue-200"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-600 mb-1">Note</label>
                  <textarea
                    name="note"
                    value={order.note}
                    onChange={(e) => handleOrderChange(index, e)}
                    placeholder="Any additional info..."
                    className="w-full border p-2 rounded focus:ring focus:ring-blue-200"
                    rows="2"
                  ></textarea>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={handleAddOrder}
            className="w-full border-2 border-blue-600 text-blue-600 py-2 rounded hover:bg-blue-50 transition"
          >
            + Add Another Item
          </button>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Submit Order
          </button>
        </form>
      </div>

      {/* Pass refreshOrders to trigger re-render in OrderList */}
      <OrderList refresh={refreshOrders} />
    </div>
  );
};

export default Orders;
