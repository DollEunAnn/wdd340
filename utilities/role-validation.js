const utilities = require(".")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")
const validate = {}

validate.roleRules = () => {
  return [
    body("role_name")
      .trim()
      .notEmpty().withMessage("Cannot save empty")
      .isLength({ min: 3 }).withMessage("Minimum of 3 characters.")
      .matches(/^[A-Za-z\s'-]+$/).withMessage("Please type a valid role name")
      .escape()
      .custom(async (role_name) => {
        const existingRole = await accountModel.getRoleByName(role_name)

        if (existingRole) {
          throw new Error("Role already exists")
        }

        return true
      })
    ]
}

validate.checkRoleData = async (req, res, next) => {
  const { role_name } = req.body
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()

    return res.render("account/add-role", {
      errors,
      title: "Add New Role",
      nav,
      role_name,
    })
  }

  next()
}

module.exports = validate