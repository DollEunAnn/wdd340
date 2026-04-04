// Needed Resources 
const regValidate = require('../utilities/inventory-validation')
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Route to build inventory management view
router.get("/", invController.buildManagementView);

// Route to get inventory items by classification_id
router.get("/getInventory/:classification_id", invController.getInventoryJSON);

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to view a detail item
router.get("/detail/:inventoryId", invController.buildByInventoryId);

// Classification Form View
router.get("/add-classification", invController.buildAddClassificationView);

// Saves classification item
router.post("/add-classification", 
    regValidate.classificationRules(),
    regValidate.checkClassificationData,
    invController.addClassification);

// Inventory Item Form View
router.get("/add-inventory-item", invController.buildAddInventoryItemView);

// Saves inventory item
router.post("/add-inventory-item",
    regValidate.inventoryItemRules(),
    regValidate.checkInventoryItemData,
    invController.addInventoryItem);

// Edit inventory item view
router.get("/edit/:inventoryId", invController.buildEditInventoryItemView);

// Update / Saves the edit inventory item
router.post("/update/", 
    regValidate.inventoryItemRules(),
    regValidate.checkUpdateData,
    invController.updateInventoryItem);

// Route error
router.get("/error",invController.makeError);


module.exports = router;