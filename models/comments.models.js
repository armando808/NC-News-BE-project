const db = require("../db/connection")

exports.removeCommentByCommentId = async (comment_id) => {
    const deleted = await db.query(
        `DELETE FROM comments
        WHERE comment_id = $1
        RETURNING *;`,
        [comment_id]
    )
    if (deleted.rowCount === 0) {
        return Promise.reject({ status: 404, msg: `Comment not found for comment_id: ${comment_id}` })
    } else {
        return deleted.rows[0]
    }
}