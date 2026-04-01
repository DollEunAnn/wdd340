// Needed Resources 
const regValidate = require('../utilities/account-validation')
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")

// Index 
router.get("/login", accountController.buildLogin);
router.get("/register", accountController.buildRegister);

// Saves / Post a Registration
router.post('/register', 
    regValidate.registationRules(),
    regValidate.checkRegData, 
    accountController.registerAccount);

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  (req, res) => {
    res.status(200).send('login process')
  }
)

module.exports = router;