const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
  })
}

// View add classification
invCont.buildAddClassificationView = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    errors: null,
    title: "Add New Classification",
    nav,
  })
}

// Process add classification
invCont.addClassification = async function (req, res, next) {
  const { classification_name } = req.body
  
  const regResult = await invModel.addClassification(classification_name)
  
  if (regResult) {
    let nav = await utilities.getNav()
    req.flash("notice", "Classification added successfully.")
    res.status(201).render("./inventory/add-classification", {
      errors:null,
      title: "Add New Classification",
      nav,
    })
  } else {
    let nav = await utilities.getNav()
    req.flash("error", "Failed to add classification.")
    res.status(500).render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
    })
  }
}


// View add inventory item
invCont.buildAddInventoryItemView = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-inventory-item", {  
    title: "Add New Inventory Item",
    nav,
  })
}


/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build inventory item detail view by Detail Id
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  const inventory_id = req.params.inventoryId //route - detail/1
  const data = await invModel.getInventoryItemByInventoryId(inventory_id)
  const grid = await utilities.buildDetailItemView(data)
  let nav = await utilities.getNav()
  const className = data[0].inv_year +
   ' ' + data[0].inv_make + ' ' + data[0].inv_model
  res.render("./inventory/classification", {
    title: className,
    nav,
    grid,
  })
}


/* ***************************
 *  Make Error
 * ************************** */
invCont.makeError = async function(req, res, next){
  try {
    let result = undefinedVariable + 1
    res.send(result)
  } catch (error) {
    next(error)
  }
}


module.exports = invCont