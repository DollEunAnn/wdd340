const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* *************************************** */
Util.buildClassificationGrid = function (data) {
  if (!data || data.length === 0) {
    return '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }

  const items = data.map(vehicle => `
    <div class="card">
      <a class="cardImage" href="../../inv/detail/${vehicle.inv_id}"
        title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
        <img src="${vehicle.inv_thumbnail}"
          alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" />
      </a>
      <div class="namePrice">
        <hr />
        <h2>
          <a href="../../inv/detail/${vehicle.inv_id}"
            title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
            ${vehicle.inv_make} ${vehicle.inv_model}
          </a>
        </h2>
        <span>$${formatNumber(vehicle.inv_price)}</span>
      </div>
    </div>
  `).join('')

  return `<div id="inv-display">${items}</div>`
}

/* **************************************
* Build the Inventory Item view HTML
* ************************************ */
Util.buildDetailItemView = function (data) {
  if (!data || data.length === 0) {
    return '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }

  const vehicle = data[0]

  return `
    <div class="cardDetailItem">
      <div class="cardDetailItemImage">
        <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" />
      </div>
      <div class="cardDetailItemDetails">
        <h2>${vehicle.inv_make} ${vehicle.inv_model} Details</h2>
        <p><span>Description:</span> ${vehicle.inv_description}</p>
        <p><span>Price:</span> $${formatNumber(vehicle.inv_price)} </p>
        <p><span>Color:</span> ${vehicle.inv_color} </p>
        <p><span>Miles:</span> ${formatNumber(vehicle.inv_miles)} miles</p>
      </div>
    </div>
  `
}

/* ****************************************
 * Formatter for Number
 **************************************** */
function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value)
}

/* ****************************************
 * Classification List Function
 **************************************** */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()

  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  
  classificationList += "<option value=''>Choose a Classification</option>"

  data.rows.forEach((row) => {
    classificationList += `<option value="${row.classification_id}"`

    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected"
    }

    classificationList += `>${row.classification_name}</option>`
  })

  classificationList += "</select>"

  return classificationList
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util