import React, { useState, useEffect, useCallback } from "react";
import "./App.css";

const API_BASE_URL = "http://localhost:8080/api";

function App() {
  const [inventories, setInventories] = useState([]);
  const [selectedInventoryId, setSelectedInventoryId] = useState("");
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState("");
  const [itemStock, setItemStock] = useState("");
  const [inventoryName, setInventoryName] = useState("");

  // State for editing
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  // State for searching
  const [searchId, setSearchId] = useState("");
  const [searchedItem, setSearchedItem] = useState(null);
  const [searchError, setSearchError] = useState("");

  const fetchInventories = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventories`);
      const data = await response.json();
      setInventories(data || []);
    } catch (error) {
      console.error("Error fetching inventories:", error);
    }
  }, []);

  const fetchItems = useCallback(async () => {
    if (!selectedInventoryId) {
      setItems([]);
      return;
    }
    try {
      const response = await fetch(
        `${API_BASE_URL}/inventories/${selectedInventoryId}/items`
      );
      const data = await response.json();
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching items:", error);
      setItems([]);
    }
  }, [selectedInventoryId]);

  useEffect(() => {
    fetchInventories();
  }, [fetchInventories]);

  useEffect(() => {
    if (inventories.length > 0) {
      const isSelectedInventoryValid = inventories.some(
        (inv) => String(inv.ID) === selectedInventoryId
      );
      if (!isSelectedInventoryValid) {
        setSelectedInventoryId(String(inventories[0].ID));
      }
    } else {
      setSelectedInventoryId("");
    }
  }, [inventories]);

  useEffect(() => {
    fetchItems();
  }, [selectedInventoryId, fetchItems]);

  const handleAddInventory = async (e) => {
    e.preventDefault();
    if (!inventoryName) return;
    try {
      await fetch(`${API_BASE_URL}/inventories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: inventoryName }),
      });
      setInventoryName("");
      fetchInventories();
    } catch (error) {
      console.error("Error adding inventory:", error);
    }
  };

  const handleDeleteInventory = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/inventories/${id}`, { method: "DELETE" });
      fetchInventories();
    } catch (error) {
      console.error("Error deleting inventory:", error);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!itemName || !itemStock || !selectedInventoryId) return;
    try {
      await fetch(`${API_BASE_URL}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: itemName,
          stock: parseInt(itemStock, 10),
          inventoryId: parseInt(selectedInventoryId, 10),
        }),
      });
      setItemName("");
      setItemStock("");
      fetchItems();
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    if (!itemName || !itemStock || !currentItem) return;

    const updatedItem = {
      name: itemName,
      stock: parseInt(itemStock, 10),
    };

    try {
      await fetch(`${API_BASE_URL}/items/${currentItem.ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedItem),
      });
      handleCancelEdit();
      fetchItems();
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/items/${id}`, { method: "DELETE" });
      fetchItems();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleEditClick = (item) => {
    setIsEditing(true);
    setCurrentItem(item);
    setItemName(item.name);
    setItemStock(item.stock);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentItem(null);
    setItemName("");
    setItemStock("");
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchId) {
      setSearchError("Please enter an ID to search.");
      return;
    }
    setSearchError("");
    setSearchedItem(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/inventories/${selectedInventoryId}/search/${searchId}`
      );
      if (response.ok) {
        const data = await response.json();
        setSearchedItem(data);
      } else {
        const text = await response.text();
        setSearchError(text || "Item not found.");
      }
    } catch (error) {
      console.error("Error searching item:", error);
      setSearchError("An error occurred during search.");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Inventory Manager</h1>
        <div className="inventory-selector">
          <label htmlFor="inventory-select">Select Inventory:</label>
          <select
            id="inventory-select"
            value={selectedInventoryId}
            onChange={(e) => setSelectedInventoryId(e.target.value)}
          >
            {inventories.map((inv) => (
              <option key={inv.ID} value={String(inv.ID)}>
                {inv.name}
              </option>
            ))}
          </select>
        </div>
      </header>
      <main>
        <div className="management-container">
          <h2>Manage Inventories</h2>
          <form onSubmit={handleAddInventory} className="inventory-form">
            <input
              type="text"
              placeholder="New Inventory Name"
              value={inventoryName}
              onChange={(e) => setInventoryName(e.target.value)}
              required
            />
            <button type="submit">Add Inventory</button>
          </form>
          <div className="inventory-list">
            <h3>Available Inventories</h3>
            <ul>
              {inventories.map((inv) => (
                <li key={inv.ID}>
                  {inv.name}
                  <button onClick={() => handleDeleteInventory(inv.ID)}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="items-container">
          <div className="form-container">
            <h2>
              {isEditing
                ? `Edit Item (ID: ${currentItem.displayId})`
                : "Add New Item"}
            </h2>
            <form onSubmit={isEditing ? handleUpdateItem : handleAddItem}>
              <input
                type="text"
                placeholder="Item Name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Stock"
                value={itemStock}
                onChange={(e) => setItemStock(e.target.value)}
                required
              />
              <div className="form-buttons">
                <button
                  type="submit"
                  disabled={!selectedInventoryId && !isEditing}
                >
                  {isEditing
                    ? "Save Changes"
                    : `Add Item to "${
                        inventories.find(
                          (inv) => String(inv.ID) === selectedInventoryId
                        )?.name
                      }"`}
                </button>
                {isEditing && (
                  <button type="button" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
          <div className="list-container">
            <h2>Inventory List</h2>
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="number"
                placeholder="Search by ID"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
              <button type="submit" disabled={!selectedInventoryId}>
                Search
              </button>
              {searchError && <p className="search-error">{searchError}</p>}
            </form>
            {items.length === 0 ? (
              <p>
                No items in this inventory. Select an inventory or add an item.
              </p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.ID}
                      className={
                        searchedItem && item.ID === searchedItem.ID
                          ? "searched-item"
                          : ""
                      }
                    >
                      <td>{item.displayId}</td>
                      <td>{item.name}</td>
                      <td>{item.stock}</td>
                      <td className="action-buttons">
                        <button onClick={() => handleEditClick(item)}>
                          Edit
                        </button>
                        <button onClick={() => handleDeleteItem(item.ID)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
