// Needed Resources 
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")

// Index 
router.get("/login", accountController.buildLogin);
router.get("/register", accountController.buildRegister);

module.exports = router;