const pool = require("../database/")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, role_id) VALUES ($1, $2, $3, $4, '1') RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    return error.message
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, role_id, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* *****************************
* Return account data using account ID
* ***************************** */
async function getAccountById (account_id) {
  try {
    const result = await pool.query('SELECT account_id, account_firstname, account_lastname, account_email, role_id FROM account WHERE account_id = $1', [account_id])
    return result.rows[0]
  }
  catch (error) {
    return new Error("No matching account id found")
  }
}

/* *****************************
* Update account details
* ***************************** */
async function updateAccountDetails(account_firstname, account_lastname, account_email, account_id) {
  try {
    const sql = "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_id])
  } catch (error) {
    return error.message
  }
}

/* *****************************
* Update account password
* ***************************** */
async function updateAccountPassword(account_password, account_id) {
  try {
    const sql = "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *"
    return await pool.query(sql, [account_password, account_id])
  } catch (error) {
    return error.message
  }
}

/* *****************************
* Get the account data using email address
* ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const result = await pool.query(sql, [account_email])
    return result.rows[0]
  } catch (error) {
    return error.message
  }
}

async function getRoleByName(role_name) {
  try {
    const sql = "SELECT * FROM role WHERE LOWER(role_name) = LOWER($1)";
    const result = await pool.query(sql, [role_name])
    return result.rows[0]
  } catch (error) {
    return error.message
  }
}

/**
 * Get all the accounts in the database
 */
async function getAllUsers() {
  try {
    const sql = `SELECT 
        a.account_id,
        a.account_firstname,
        a.account_lastname,
        a.account_email,
        r.role_name
      FROM account a
      JOIN role r ON a.role_id = r.role_id`
    const result = await pool.query(sql)
    return result.rows
  } catch (error) {
    return error.message
  }
}

/* *****************************
* Get all roles in the database
* ***************************** */
async function getAllRoles() {
  const data = await pool.query("SELECT * FROM role ORDER BY role_id")
  return data.rows
}


/***********************
 * Update the role
 **********************/
async function updateRole(account_id, role_id) {
   try {
    const sql = "UPDATE account SET role_id = $1 WHERE account_id = $2 RETURNING *"
    return await pool.query(sql, [role_id, account_id])
  } catch (error) {
    return error.message
  }
}

/***********************
 * Check if the role - not case sensitive
 **********************/
async function checkExistingRole(role_name) {
  try {
    const sql = `
      SELECT * 
      FROM role 
      WHERE LOWER(role_name) = LOWER($1)
    `
    const result = await pool.query(sql, [role_name])

    return result.rows[0] // returns existing role or undefined
  } catch (error) {
    return error.message
  }
}

async function addRole(role_name) {
  try {
    const sql = "INSERT INTO public.role (role_name) VALUES ($1) RETURNING *"
    return await pool.query(sql, [role_name])
  } catch (error) {
    return error.message
  }
}

module.exports = { registerAccount, checkExistingEmail, getAccountByEmail, getAccountById, updateAccountDetails, updateAccountPassword, getAllUsers, getAllRoles, updateRole, checkExistingRole, addRole, getRoleByName }