const {fetchArticleById} = require("../models/articles.models")

exports.getArticleById = async (req, res, next) => {
    const { article_id } = req.params
	try {
		const article = await fetchArticleById(article_id)
        if (article.status && article.msg) {
            res.status(article.status).send({ msg: article.msg })
        } else {
		res.status(200).send( {article} )
        }
	} catch (err) {
		next(err)
	}
}
