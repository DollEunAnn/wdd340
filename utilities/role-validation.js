const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

validate.roleRules = () => {
  return [
    body("role_name")
      .trim()
      .notEmpty().withMessage("Cannot save empty")
      .isLength({ min: 3 }).withMessage("Minimum of 3 characters.")
      .matches(/^[A-Za-z\s'-]+$/)
      .escape()
      .withMessage("Please type a valid role name"),
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