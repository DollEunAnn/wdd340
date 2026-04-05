// Needed Resources 
const regValidate = require('../utilities/account-validation')
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const { route } = require('./static')

// Default Route
router.get("/", utilities.checkLogin, accountController.buildManagement);

// Index 
router.get("/login", accountController.buildLogin);
router.get("/register", accountController.buildRegister);

// Saves / Post a Registration -> redirects to login page with success message
router.post('/register', 
    regValidate.registationRules(),
    regValidate.checkRegData, 
    accountController.registerAccount);

// Process the login attempt -> redirects to account management page
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  accountController.accountLogin
)

router.get("/logout", (req, res) => {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out.")
  res.redirect("/account/login")
})

module.exports = router;