package main

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"gorm.io/gorm"
)

func main() {
	initDatabase()

	r := mux.NewRouter()

	// Inventory routes
	r.HandleFunc("/api/inventories", getInventoriesHandler).Methods("GET")
	r.HandleFunc("/api/inventories", addInventoryHandler).Methods("POST")
	r.HandleFunc("/api/inventories/{id}", deleteInventoryHandler).Methods("DELETE")

	// Item routes
	r.HandleFunc("/api/inventories/{id}/items", getItemsByInventoryHandler).Methods("GET")
	r.HandleFunc("/api/inventories/{inv_id}/search/{display_id}", searchItemHandler).Methods("GET")
	r.HandleFunc("/api/items", addItemHandler).Methods("POST")
	r.HandleFunc("/api/items/{id}", updateItemHandler).Methods("PUT")
	r.HandleFunc("/api/items/{id}", deleteItemHandler).Methods("DELETE")

	// CORS handler - Allow all for simplicity in this example
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type"},
	})
	handler := c.Handler(r)

	log.Println("Starting server on :8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}

// Inventory Handlers
func getInventoriesHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	inventories := getInventories()
	json.NewEncoder(w).Encode(inventories)
}

func addInventoryHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var inventory Inventory
	_ = json.NewDecoder(r.Body).Decode(&inventory)
	addInventory(&inventory)
	json.NewEncoder(w).Encode(inventory)
}

func deleteInventoryHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	params := mux.Vars(r)
	id, _ := strconv.ParseUint(params["id"], 10, 32)
	deleteInventoryByID(uint(id))
	json.NewEncoder(w).Encode(map[string]string{"result": "success"})
}

// Item Handlers
func getItemsByInventoryHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	params := mux.Vars(r)
	id, err := strconv.ParseUint(params["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid inventory ID", http.StatusBadRequest)
		return
	}
	items := getItemsByInventory(uint(id))
	json.NewEncoder(w).Encode(items)
}

func searchItemHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	params := mux.Vars(r)

	inventoryID, err := strconv.ParseUint(params["inv_id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid inventory ID", http.StatusBadRequest)
		return
	}

	displayID, err := strconv.Atoi(params["display_id"])
	if err != nil {
		http.Error(w, "Invalid item display ID", http.StatusBadRequest)
		return
	}

	item, err := searchItemByDisplayID(uint(inventoryID), displayID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			http.Error(w, "Item not found", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to search for item: "+err.Error(), http.StatusInternalServerError)
		}
		return
	}

	json.NewEncoder(w).Encode(item)
}

func updateItemHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	params := mux.Vars(r)
	id, err := strconv.ParseUint(params["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid item ID", http.StatusBadRequest)
		return
	}

	var updatedItem Item
	if err := json.NewDecoder(r.Body).Decode(&updatedItem); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	updatedItem.ID = uint(id)

	if err := updateItem(&updatedItem); err != nil {
		http.Error(w, "Failed to update item: "+err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(updatedItem)
}

func addItemHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var item Item
	_ = json.NewDecoder(r.Body).Decode(&item)
	if err := addItem(&item); err != nil {
		http.Error(w, "Failed to add item: "+err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(item)
}

func deleteItemHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	params := mux.Vars(r)
	id, err := strconv.ParseUint(params["id"], 10, 32)
	if err != nil {
		http.Error(w, "Invalid item ID", http.StatusBadRequest)
		return
	}
	deleteItemByID(uint(id))
	json.NewEncoder(w).Encode(map[string]string{"result": "success"})
}