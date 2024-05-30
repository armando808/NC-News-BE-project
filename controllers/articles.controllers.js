const {fetchArticles, fetchArticleById, fetchCommentsByArticleId} = require("../models/articles.models")

exports.getArticleById = async (req, res, next) => {
    const { article_id } = req.params
	try {
		const article = await fetchArticleById(article_id)
		res.status(200).send( {article} )
	} catch (err) {
		next(err)
	}
}

exports.getCommentsByArticleId = async (req, res, next) => {
    const { article_id } = req.params
    try {
        const comments = await fetchCommentsByArticleId(article_id)
        res.status(200).send( {comments} )
    } catch (err) {
        next(err)
    }
}

exports.getArticles = async (req, res, next) => {
    try {
        const articles = await fetchArticles()
        res.status(200).send( {articles} )
    } catch (err) {
        next(err)
    }
}