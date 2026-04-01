// Needed Resources 
const regValidate = require('../utilities/inventory-validation')
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Route to build inventory management view
router.get("/", invController.buildManagementView);

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to view a detail item
router.get("/detail/:inventoryId", invController.buildByInventoryId);

// Classification
router.get("/add-classification", invController.buildAddClassificationView);

router.post("/add-classification", 
    regValidate.classificationRules(),
    regValidate.checkClassificationData,
    invController.addClassification);

// Inventory Item
router.get("/add-inventory-item", invController.buildAddInventoryItemView);

router.post("/add-inventory-item",
    regValidate.inventoryItemRules(),
    regValidate.checkInventoryItemData,
    invController.addInventoryItem);

// Route error
router.get("/error",invController.makeError);


module.exports = router;