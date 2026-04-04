const utilities = require(".")
const { body, validationResult } = require("express-validator")
const invModel = require("../models/inventory-model")
const validate = {}

validate.classificationRules = () => {
    return [
      // classification name is required and must be string
      body("classification_name")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .matches(/^[A-Za-z]+$/)
        .withMessage("Please provide a valid classification name."), // on error this message is sent.
  ]
}

// sticky form data and error handling
validate.checkClassificationData = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("inventory/add-classification", {
        errors,
        title: "Add New Classification",
        nav,        
        classification_name,
      })
      return
    }
  next()
}

validate.inventoryItemRules = () => {
    return [
      body("inv_make")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 3 })
        .withMessage("Make must be at least 3 characters long."),
      body("inv_model")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 3 })
        .withMessage("Model must be at least 3 characters long."),
      body("inv_year")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 4, max: 4 })
        // .isInt({ min: 1886, max: new Date().getFullYear() + 1 }) // Cars were invented around 1886
        .withMessage("Please provide a valid year."),
      body("inv_description")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 10 })
        .withMessage("Description must be at least 10 characters long."),
      body("inv_image")
        .trim()
        .notEmpty()
        .withMessage("Image path is required."),
      body("inv_thumbnail")
        .trim()
        .notEmpty()
        .withMessage("Thumbnail path is required."),
      body("inv_price")
        .trim()
        .notEmpty()
        .isFloat({ min: 0 })
        .withMessage("Please provide a valid price."),
      body("inv_miles")
        .trim()
        .escape()
        .notEmpty()
        .isInt({ min: 0 })
        .withMessage("Please provide a valid mileage."),
      body("inv_color")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Color must be at least 2 characters long."),
      body("classification_id")
        .trim()
        .escape()
        .notEmpty()
    ]
  }

// CREATE - sticky form data and error handling for inventory item 
  validate.checkInventoryItemData = async (req, res, next) => {
    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
    let errors = []
    errors = validationResult(req) 
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      let classificationList = await utilities.buildClassificationList(classification_id)
      res.render("inventory/add-inventory-item", {
        errors,
        title: "Add New Inventory Item",
        nav,
        classificationList,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id,
      })
      return
  } next()
}

// UPDATE - sticky form data and error handling for inventory item 
  validate.checkUpdateData = async (req, res, next) => {
    const { inv_id,inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
    let errors = []
    errors = validationResult(req) 
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      let classificationList = await utilities.buildClassificationList(classification_id)
      res.render("inventory/edit-inventory-item", {
        errors,
        title: "Update Inventory Item",
        nav,
        classificationList,
        inv_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id,
      })
      return
  } next()
}


module.exports = validate