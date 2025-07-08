package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB

func initDatabase() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using default environment variables")
	}

	dsn := os.Getenv("DATABASE_DSN")
	if dsn == "" {
		log.Fatal("DATABASE_DSN environment variable not set")
	}

	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}

	db.AutoMigrate(&Inventory{},&Item{})
}

func getInventories() []Inventory {
	var inventories []Inventory
	db.Find(&inventories)
	return inventories
}

func addInventory(inventory *Inventory) {
	db.Create(inventory)
}

func deleteInventoryByID(id uint) {
	db.Delete(&Inventory{}, id)
	db.Where("inventory_id = ?", id).Delete(&Item{})
}

func getItemsByInventory(inventoryID uint) []Item {
	var items []Item
	db.Where("inventory_id = ?", inventoryID).Find(&items)
	return items
}

func getItems() []Item {
	var items []Item
	db.Find(&items)
	return items
}

func addItem(item *Item) error {
	return db.Transaction(func(tx *gorm.DB) error {
		var maxDisplayID int
		// Find the current maximum DisplayID for the given inventory.
		// COALESCE ensures that if the table is empty (max is NULL), we get 0 instead.
		if err := tx.Model(&Item{}).Where("inventory_id = ?", item.InventoryID).Select("COALESCE(MAX(display_id), 0)").Row().Scan(&maxDisplayID); err != nil {
			return err
		}

		// Set the new DisplayID to one more than the current max.
		item.DisplayID = maxDisplayID + 1

		// Create the new item.
		return tx.Create(item).Error
	})
}

func updateItem(item *Item) error {
	return db.Model(&Item{}).Where("id = ?", item.ID).Updates(map[string]interface{}{
		"name":  item.Name,
		"stock": item.Stock,
	}).Error
}

func searchItemByDisplayID(inventoryID uint, displayID int) (Item, error) {
	var item Item
	result := db.Where("inventory_id = ? AND display_id = ?", inventoryID, displayID).First(&item)
	return item, result.Error
}

func deleteItemByID(id uint) {
	db.Delete(&Item{}, id)
}