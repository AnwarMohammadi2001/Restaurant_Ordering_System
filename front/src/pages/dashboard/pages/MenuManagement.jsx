import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FaUtensils,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaFilter,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all menu items
  const fetchMenuItems = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/menu`);
      setMenuItems(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch menu items", "error");
    } finally {
      setIsLoading(false);
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
    setIsLoading(true);

    try {
      if (editId) {
        await axios.put(`${BASE_URL}/menu/${editId}`, formData);
        Swal.fire({
          title: "Updated!",
          text: "Menu item updated successfully",
          icon: "success",
          confirmButtonColor: "#10b981",
        });
      } else {
        await axios.post(`${BASE_URL}/menu`, formData);
        Swal.fire({
          title: "Added!",
          text: "Menu item added successfully",
          icon: "success",
          confirmButtonColor: "#10b981",
        });
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
      Swal.fire({
        title: "Error!",
        text: "Failed to save menu item",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Edit item
  const handleEdit = (item) => {
    setFormData(item);
    setEditId(item.id);
    // Scroll to form
    document.getElementById("menu-form").scrollIntoView({ behavior: "smooth" });
  };

  // Delete item
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the menu item!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/menu/${id}`);
        Swal.fire({
          title: "Deleted!",
          text: "Menu item deleted successfully.",
          icon: "success",
          confirmButtonColor: "#10b981",
        });
        fetchMenuItems();
      } catch (err) {
        console.error(err);
        Swal.fire({
          title: "Error!",
          text: "Failed to delete item",
          icon: "error",
          confirmButtonColor: "#ef4444",
        });
      }
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      available: true,
    });
    setEditId(null);
  };

  // Filter and search items
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = [
    ...new Set(menuItems.map((item) => item.category)),
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-sm border border-white/20">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <FaUtensils className="text-white text-xl" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Menu Management
              </h1>
              <p className="text-slate-600 text-sm">
                Manage your restaurant menu items
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Section - Left Side */}
          <div className="lg:col-span-4">
            <div
              id="menu-form"
              className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <FaPlus className="text-white" />
                  {editId ? "Edit Menu Item" : "Add New Item"}
                </h2>
                <p className="text-emerald-100 text-sm mt-1">
                  {editId
                    ? "Update existing menu item"
                    : "Create a new menu item"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g., Margherita Pizza"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-3 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    placeholder="Brief description of the item..."
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-3 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-300 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Price ($) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="price"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        className="w-full border border-slate-300 rounded-xl pl-4 pr-10 py-3 focus:ring-3 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-300"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-slate-400">$</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-3 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-300"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Main Dish">Main Dish</option>
                      <option value="Appetizer">Appetizer</option>
                      <option value="Drink">Drink</option>
                      <option value="Dessert">Dessert</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        formData.available ? "bg-emerald-500" : "bg-red-500"
                      }`}
                    ></div>
                    <span className="font-semibold text-slate-700">
                      Available
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="available"
                      checked={formData.available}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : editId ? (
                      <FaCheck className="text-lg" />
                    ) : (
                      <FaPlus className="text-lg" />
                    )}
                    {isLoading
                      ? "Processing..."
                      : editId
                      ? "Update Item"
                      : "Add Item"}
                  </button>

                  {editId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-6 bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-300 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <FaTimes />
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Table Section - Right Side */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <FaUtensils className="text-white" />
                  Menu Items ({filteredItems.length})
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  Manage all your menu items in one place
                </p>
              </div>

              {/* Search and Filter */}
              <div className="p-6 border-b border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl pl-4 pr-10 py-3 focus:ring-3 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300"
                    />
                  </div>

                  <div className="relative">
                    <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl pl-4 pr-10 py-3 focus:ring-3 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 appearance-none"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : filteredItems.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-right p-4 font-semibold text-slate-700">
                          Item
                        </th>
                        <th className="text-right p-4 font-semibold text-slate-700">
                          Category
                        </th>
                        <th className="text-right p-4 font-semibold text-slate-700">
                          Price
                        </th>
                        <th className="text-right p-4 font-semibold text-slate-700">
                          Status
                        </th>
                        <th className="text-right p-4 font-semibold text-slate-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredItems.map((item, index) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50 transition-colors duration-200"
                        >
                          <td className="p-4">
                            <div className="text-right">
                              <div className="font-semibold text-slate-800">
                                {item.name}
                              </div>
                              {item.description && (
                                <div className="text-sm text-slate-600 mt-1 line-clamp-2">
                                  {item.description}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {item.category}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-green-600">
                              ${parseFloat(item.price).toFixed(2)}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                item.available
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {item.available ? "Available" : "Unavailable"}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="w-10 h-10 flex items-center justify-center bg-yellow-100 text-yellow-600 rounded-xl hover:bg-yellow-200 transition-colors duration-200"
                                title="Edit"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="w-10 h-10 flex items-center justify-center bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors duration-200"
                                title="Delete"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaUtensils className="text-slate-400 text-2xl" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-600 mb-2">
                      No menu items found
                    </h3>
                    <p className="text-slate-500">
                      {searchTerm || filterCategory
                        ? "Try adjusting your search or filter criteria"
                        : "Get started by adding your first menu item"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;
