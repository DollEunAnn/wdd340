const e = require("connect-flash")
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav()

  // store results of select list
  const classificationSelect = await utilities.buildClassificationList()

  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    classificationSelect,
  })
}

/* ***************************
 *  CLASSIFICATION VIEW AND PROCESS
 * ************************** */
// build inventory by classification view
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  if (data.length > 0) {
    var className = data[0].classification_name
  } else {
    var className = "No"
  } + " " + className
  
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
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
    req.flash("notice", "Failed to add classification.")
    res.status(500).render("./inventory/add-classification", {
      errors:errors,
      title: "Add New Classification",
      nav,
    })
  }
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
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)

  // changing the logic
  // if (invData[0].inv_id) {
  //   return res.json(invData)
  // } else {
  //   next(new Error("No data returned"))
  // }

  if (invData.length > 0) {
    return res.json(invData)
  } else {
    req.flash("notice", "No data found")
    return res.redirect("/inventory")
  }
}

/** ***************************
 * INVENTORY ITEM VIEW, ADD, UPDATE, DELETE
 * ****************************** */

// View add inventory item ✅
invCont.buildAddInventoryItemView = async function (req, res, next) {
  let nav = await utilities.getNav()
  let classification_id = null;
  let classificationList = await utilities.buildClassificationList(classification_id)
  res.render("./inventory/add-inventory-item", { 
    errors: null, 
    title: "Add New Inventory Item",
    nav,
    classificationList,
    classification_id,
  })
}

// Process add inventory item ✅
invCont.addInventoryItem = async function (req, res, next) {
  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
  
  const regResult = await invModel.addInventoryItem(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id);
  const classificationSelect = await utilities.buildClassificationList()
  if (regResult) {
    let nav = await utilities.getNav()

    req.flash("notice", `The ${inv_make} ${inv_model} was added successfully.`)
    res.status(201).render("./inventory/management", { //redirect to management view after successful addition
      errors:null,
      title: "Add New Inventory Item",
      nav,
      classificationSelect,
    })
  } else {
    let nav = await utilities.getNav()
    req.flash("notice", "Failed to add inventory item.")
    res.status(500).render("./inventory/add-inventory-item", {
      errors: null,
      title: "Inventory Management",
      nav,
      classificationSelect,
      })
  }
}

// View edit inventory item ✅
invCont.buildEditInventoryItemView = async function (req, res, next) {
  const inventory_id = parseInt(req.params.inventoryId) // get inventory id from route
  let nav = await utilities.getNav()
  const data = await invModel.getInventoryItemByInventoryId(inventory_id)
  const itemData = data[0] // get the first item from the data array
  const classificationList = await utilities.buildClassificationList(itemData.classification_id)
  const name = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory-item", { 
    errors: null, 
    title: `Edit ${name}`,
    nav,
    classificationList : classificationList,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

// Process update inventory item ✅
invCont.updateInventoryItem = async function (req, res, next) {
  const { 
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
    classification_id } = req.body
  
  const updateResult = await invModel.updateInventory(
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
    classification_id);

  if (updateResult) {
    let nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList()    
    req.flash("notice", `The ${inv_make} ${inv_model} was updated successfully.`)
    res.status(201).render("./inventory/management", { //redirect to management view after successful update
      errors:null,
      title: `Inventory Management`,
      nav,
      classificationSelect,
    })
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    let nav = await utilities.getNav()
    req.flash("notice", "Failed to update inventory item.")
    res.status(501).render("./inventory/edit-inventory-item", {
    errors: null,
    title: `Edit ${itemName}`,
    nav,
    classificationList: classificationSelect,
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_year,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

// View delete inventory item ✅
invCont.buildDeleteInventoryItemView = async function (req, res, next) {
  const inventory_id = parseInt(req.params.inventoryId) // get inventory id from route
  let nav = await utilities.getNav()
  const data = await invModel.getInventoryItemByInventoryId(inventory_id)
  const itemData = data[0] // get the first item from the data array
  const name = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/delete-confirm", { 
    errors: null, 
    title: `Delete ${name}`,
    nav,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  })
}

// Process delete inventory item
invCont.deleteInventoryItem = async function (req, res, next) {
  const inventory_id = parseInt(req.body.inv_id) // get inventory id from form data
  const deleteResult = await invModel.deleteInventoryItem(inventory_id);

  
  if (deleteResult) { 

    let nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList()  

    req.flash("notice", `The delete was deleted successful.`)
    res.status(201).render("./inventory/management", { //redirect to management view after successful delete
      errors:null,
      title: `Inventory Management`,
      nav,
      classificationSelect,
    })

  } else {
    let nav = await utilities.getNav()

    const data = await invModel.getInventoryItemByInventoryId(inventory_id)
    const itemData = data[0] // get the first item from the data array
    const name = `${itemData.inv_make} ${itemData.inv_model}`

    req.flash("notice", "Failed to delete inventory item.")
    res.status(501).render("./inventory/delete-confirm", {
    errors: null,
    nav,
    title: "Delete Inventory Item",
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,

    })
  }
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