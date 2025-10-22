import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    available: true,
  });
  const [editId, setEditId] = useState(null);

  // Fetch all menu items
  const fetchMenuItems = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/menu`);
      setMenuItems(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch menu items", "error");
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        await axios.put(`${BASE_URL}/menu/${editId}`, formData);
        Swal.fire("Updated", "Menu item updated successfully", "success");
      } else {
        await axios.post(`${BASE_URL}/menu`, formData);
        Swal.fire("Added", "Menu item added successfully", "success");
      }
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        available: true,
      });
      setEditId(null);
      fetchMenuItems();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to save menu item", "error");
    }
  };

  // Edit item
  const handleEdit = (item) => {
    setFormData(item);
    setEditId(item.id);
  };

  // Delete item
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the item!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/${id}`);
        Swal.fire("Deleted!", "Menu item deleted successfully.", "success");
        fetchMenuItems();
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to delete item", "error");
      }
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">
        🍽️ Menu Management
      </h2>

      {/* Form Section */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto mb-8"
      >
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border p-2 mb-3 rounded"
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border p-2 mb-3 rounded"
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          className="w-full border p-2 mb-3 rounded"
          required
        />
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full border p-2 mb-3 rounded"
        >
          <option value="">Select Category</option>
          <option value="Main Dish">Main Dish</option>
          <option value="Appetizer">Appetizer</option>
          <option value="Drink">Drink</option>
          <option value="Dessert">Dessert</option>
          <option value="Other">Other</option>
        </select>

        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            name="available"
            checked={formData.available}
            onChange={handleChange}
            className="mr-2"
          />
          <label>Available</label>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
        >
          {editId ? "Update Item" : "Add Item"}
        </button>
      </form>

      {/* Table Section */}
      <table className="w-full border-collapse border border-gray-200 text-center">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">#</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Available</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(menuItems) && menuItems.length > 0 ? (
            menuItems.map((item, index) => (
              <tr key={item.id}>
                <td className="border p-2">{index + 1}</td>
                <td className="border p-2">{item.name}</td>
                <td className="border p-2">{item.category}</td>
                <td className="border p-2">${item.price}</td>
                <td className="border p-2">{item.available ? "✅" : "❌"}</td>
                <td className="border p-2 space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-gray-500 p-4">
                No menu items available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MenuManagement;
