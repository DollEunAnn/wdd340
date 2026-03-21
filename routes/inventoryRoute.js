// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to view a detail item
router.get("/detail/:inventoryId", invController.buildByInventoryId);

// Route error
router.get("/error",invController.makeError);


module.exports = router;