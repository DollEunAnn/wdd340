const utilities = require("../utilities/")
const accountModel = require("../models/account-model") 
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

// render -> view location
// redirect -> route location


/* ****************************************
*  Deliver account management view - Default Route
* *************************************** */
async function buildManagement(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/management", {
    errors: null,
    title: "Account Management",
    nav,
  })
}

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  // check if the email exists in the database
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* ****************************************
*  Deliver update account view
* *************************************** */
async function buildUpdateAccountView(req, res, next) {
  let nav = await utilities.getNav()
  const account_id = parseInt(req.params.accountId)
  const accountData = await accountModel.getAccountById(account_id)
  console.log("Account ID from params is: " + accountData)
  
  if (!accountData) {
    req.flash("notice", "Sorry, we couldn't find the account.")
    return res.redirect("/account/")
  }
  
  res.render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
  })
}

/* ****************************************
*  Update Account details
* *************************************** */
async function updateAccountDetails(req, res) {
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  let nav = await utilities.getNav()

  const updateResult = await accountModel.updateAccountDetails(account_firstname, account_lastname, account_email, account_id)

  if (updateResult.rowCount > 0) {

    req.flash("notice", "Account details updated successfully.")
    res.status(201).render("./account/management", {
      errors: null,
      title: "Account Manageement",
      nav,
    })
  } else {

    req.flash("notice", "Sorry, there was an error updating the account details.")
    res.status(501).render("/account/update/",{
      title: "Update Account",
      nav,
      errors: null,
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    })
  }
}

/* ****************************************
*  Update Password
* *************************************** */
async function updateAccountPassword(req, res) {
  const { account_password, account_id } = req.body
  let nav = await utilities.getNav()  
  
  let hashedPassword

  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the password update.")
    res.status(500).render("account/update/", {
      title: "Update Account",
      nav,
      errors: null,
      account_id,
    })
  }

  const updateResult = await accountModel.updateAccountPassword(hashedPassword, account_id)

  if (updateResult.rowCount > 0) {

    req.flash("notice", "Password updated successfully.")
    res.status(201).render("./account/management", {
      errors: null,
      title: "Account Manageement",
      nav,
    })
  } else {

    req.flash("notice", "Sorry, there was an error updating the password.")
    res.status(501).render("/account/update/",{
      title: "Update Account",
      nav,
      errors: null,
      account_id,
    })
  }
}

/* ****************************************
*  Logout
* *************************************** */
async function accountLogout(req, res) {
  let nav = await utilities.getNav()  
  // delete the JWT cookie to log the user out
  res.clearCookie("jwt")

  //destroy the session to clear all session data
  req.session.destroy()

  // returns to the home page
  res.redirect("/")
}

// USER MANAGEMENT VIEW
/*******************************************
 * User management view for admin accounts
 *******************************************/
async function buildUserManagementView(req, res) {
  let nav = await utilities.getNav()  
  const users = await accountModel.getAllUsers()

  res.render("account/user-management", {
    title: "User Management",
    nav,
    users,
    errors: null,
  })
}

async function buildUpdateRoleView(req, res) {
  let nav = await utilities.getNav()
  const account_id = parseInt(req.params.accountId)
  const accountData = await accountModel.getAccountById(account_id)
  const roleList = await utilities.buildRoleList(accountData.role_id)

  if (!accountData) {
    req.flash("notice", "Sorry, we couldn't find the account.")
    return res.redirect("/account/")
  }

  res.render("account/update-user-role", {
    title: "Update Account Type",
    nav,
    errors: null,
    roleList,
    account_id,
    role_id: accountData.role_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
    account_role_id: accountData.role_id,
  })
}

async function updateUserRole(req, res) {
  const { account_id, role_id } = req.body
  let nav = await utilities.getNav()
  
  const accountData = await accountModel.getAccountById(account_id);
  
  // data validation
  if (!accountData) {
    req.flash("notice", "Account not found.")
    return res.redirect("/account/user-management")
  }
  
  if (accountData.role_id === role_id) {
    req.flash("notice", "Role is already assigned.")
    return res.redirect("/account/user-management")
  }
  
  const updateResult = await accountModel.updateRole(account_id, role_id);
  const users = await accountModel.getAllUsers()

  if(updateResult) {
    req.flash("notice", `${accountData.account_firstname} ${accountData.account_lastname} role was updated successfully.`)
    res.status(201).render("./account/user-management", {
      errors: null,
      title: "User Management",
      nav,
      users
    })
  } else {
    req.flash("notice", "Sorry, there was an error updating the role.")
    res.status(501).render("/account/update-user-role/",{
      title: "Update Account",
      nav,
      errors: null,
    })

  }
}

// Role Management
async function buildRoleManagementView (req, res) {
  let nav = await utilities.getNav();
  const roles = await accountModel.getAllRoles()

  res.render("account/role-management", {
    title: "Role Management",
    nav,
    errors:null,
    roles,
  })
}

async function buildAddRoleView (req, res) {
  let nav = await utilities.getNav();
   res.render("account/add-role", {
    title: "Role Management",
    nav,
    errors:null,
  })
}

async function addRole (req,res) {
  const { role_name } = req.body
  let nav = await utilities.getNav()

  const updateResult = await accountModel.addRole(role_name)
  const roles = await accountModel.getAllRoles()
  
  if(updateResult) {
    req.flash("notice", `Role "${role_name}" added successfully.`)
    res.status(201).render("account/role-management", {
      roles,
      errors: null,
      title: "Role Management",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, there was an error adding the role.")
    res.status(501).render("account/add-role",{
      roles,
      title: "Add Role",
      nav,
      errors: null,
      role_name,
    })

  }
}


module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildManagement, buildUpdateAccountView, updateAccountDetails, updateAccountPassword, accountLogout, buildUserManagementView, buildUpdateRoleView, updateUserRole, buildRoleManagementView, buildAddRoleView, addRole }