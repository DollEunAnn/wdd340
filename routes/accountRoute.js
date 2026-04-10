// Needed Resources 
const accountValidate = require('../utilities/account-validation')
const roleValidate = require('../utilities/role-validation')
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
    accountValidate.registationRules(),
    accountValidate.checkRegData, 
    accountController.registerAccount);

// Process the login attempt -> redirects to account management page
router.post(
  "/login",
  accountValidate.loginRules(),
  accountValidate.checkLoginData,
  accountController.accountLogin
)

// Logout
router.get("/logout", accountController.accountLogout);

// Update account details view
router.get("/update/:accountId", accountController.buildUpdateAccountView);

// Update account details
router.post("/update-details", 
  accountValidate.accountUpdateRules(),
  accountValidate.checkAccountUpdateData,
  accountController.updateAccountDetails);

// Update account password
router.post("/update-password", accountController.updateAccountPassword);


/**
 * User management view for admin accounts
 */
router.get("/user-management", 
  utilities.checkLogin, 
  utilities.checkAdmin, 
  accountController.buildUserManagementView);

router.get("/update-user-role/:accountId",
  utilities.checkLogin,
  utilities.checkAdmin,
  accountController.buildUpdateRoleView);

router.post("/update-user-role",
  utilities.checkAdmin,
  accountController.updateUserRole);

  /**
   * Role management View
   */
  router.get("/role-management",
    utilities.checkLogin,
    utilities.checkAdmin,
    accountController.buildRoleManagementView);

  router.get("/add-role", 
    utilities.checkAdmin,
    utilities.checkAuthorization,
    accountController.buildAddRoleView);

  router.post("/add-role",
    utilities.checkAdmin,
    roleValidate.roleRules(),
    roleValidate.checkRoleData,
    accountController.addRole);



module.exports = router;