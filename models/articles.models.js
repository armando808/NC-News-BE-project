const db = require("../db/connection")

exports.fetchArticleById = async (article_id) => {

		const article = await db.query(
		`SELECT *
		FROM articles
		WHERE article_id = $1;`,
		[article_id]
		)

		if (!article.rows.length) {
			return Promise.reject({ status: 404, msg: `Article not found for article_id: ${article_id}` })
        }
		return article.rows[0]
    }