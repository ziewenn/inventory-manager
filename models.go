package main

import "gorm.io/gorm"

type Inventory struct {
	gorm.Model
	Name string `json:"name"`
	Items []Item `json:"items"`
}

type Item struct {
	gorm.Model
	DisplayID   int    `json:"displayId"`
	Name        string `json:"name"`
	Stock       int    `json:"stock"`
	InventoryID uint   `json:"inventoryId"`
}