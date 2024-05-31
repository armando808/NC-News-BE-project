const {fetchArticles, fetchArticleById, fetchCommentsByArticleId, addCommentsByArticleId, incVotesByArticleById} = require("../models/articles.models")

exports.getArticles = async (req, res, next) => {
    try {
        const articles = await fetchArticles()
        res.status(200).send( {articles} )
    } catch (err) {
        next(err)
    }
}

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

exports.postCommentsByArticleId = async (req, res, next) => {
    const { article_id } = req.params
    const { username, body } = req.body
    try {
        const addedComment = await addCommentsByArticleId(article_id, username, body)
        res.status(201).send({ comment: addedComment })
    } catch (err) {
        next(err)
    }
}

exports.addVotesByArticleById = async (req, res, next) => {
    const { article_id } = req.params
    const { inc_votes } = req.body
    try {
        const updatedArticle = await incVotesByArticleById(article_id, inc_votes)
        res.status(200).send({ article: updatedArticle })
    } catch (err) {
        next(err)
    }
}