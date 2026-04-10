const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

validate.roleRules = () => {
  return [
    body("role_name")
      .trim()
      .notEmpty()
      .isLength({ min: 3 })
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

    return res.render("account/role-management", {
      errors,
      title: "Add New Role",
      nav,
      role_name,
    })
  }

  next()
}

module.exports = validate