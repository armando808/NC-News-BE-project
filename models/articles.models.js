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

exports.fetchArticles = async (req, res, next) => {
    const SQLquery = `
        SELECT 
            author,
            title,
            article_id,
            topic,
            created_at,
            votes,
            article_img_url,
            (SELECT COUNT(*) FROM comments WHERE comments.article_id = articles.article_id) AS comment_count
        FROM articles
        ORDER BY created_at DESC;
        `

    const result = await db.query(SQLquery)
    return result.rows
}