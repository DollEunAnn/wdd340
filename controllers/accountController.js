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


module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildManagement, buildUpdateAccountView, updateAccountDetails, updateAccountPassword, accountLogout }