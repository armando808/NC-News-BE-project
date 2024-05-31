const {removeCommentByCommentId} = require("../models/comments.models")

exports.deleteCommentByCommentId = async (req, res, next) => {
    const { comment_id } = req.params
    try {
        await removeCommentByCommentId(comment_id)
        res.status(204).send()
    } catch(err) {
        next(err)
    }
}