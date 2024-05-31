const db = require("../db/connection")

exports.fetchUsers = async () => {
    const users = await db.query(
        `SELECT *
        FROM users`
    )
    return users.rows
}