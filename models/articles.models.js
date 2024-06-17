const db = require("../db/connection")

exports.fetchArticleById = async (article_id) => {

	const SQLquery = `
        SELECT 
            articles.author,
            articles.title,
            articles.article_id,
            articles.body,
            articles.topic,
            articles.created_at,
            articles.votes,
            articles.article_img_url,
            COUNT(comments.article_id) AS comment_count
		FROM articles
        LEFT JOIN comments ON articles.article_id = comments.article_id
		WHERE articles.article_id = $1
        GROUP BY articles.article_id;`
		
		const article = await db.query(SQLquery, [article_id])

	if (!article.rows.length) {
			return Promise.reject({ status: 404, msg: `Article not found for article_id: ${article_id}` })
        }
	return article.rows[0]
    }

exports.fetchCommentsByArticleId = async (article_id) => {
    const comments = await db.query(`
        SELECT *
        FROM comments
        WHERE article_id = $1 
        ORDER BY created_at DESC;
        `,
        [article_id]
    )
    if (!comments.rows.length) {
        return Promise.reject({ status: 404, msg: `Comments not found for article_id: ${article_id}` })
    }
    return comments.rows
}


exports.fetchArticles = async ({ topic, author, sort_by = "created_at", order = "desc" }) => {
    const queryValues = []
    let SQLquery = `
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
        `
    if(topic) {
        queryValues.push(topic)
        SQLquery += ` WHERE topic = $1`
    }
    SQLquery += ` ORDER BY ${sort_by} ${order};`
    const articles = await db.query(SQLquery, queryValues)
    if (articles.rows.length === 0 && topic) {
            return Promise.reject({ status: 404, msg: "Topic not found" })
        }
    return articles.rows
}

exports.addCommentsByArticleId = async (article_id, username, body) => {
    if(!username || !body) {
        return Promise.reject({ status: 400, msg: "Bad request: must include both username and body"})
    }
    
    const checkArticle = await db.query(
            `SELECT * FROM articles WHERE article_id = $1;`,
            [article_id]
        )
    if (!checkArticle.rows.length) {
            return Promise.reject({ status: 404, msg: `Article not found for article_id: ${article_id}` });
        }
    const checkAuthor = await db.query(
        `SELECT * FROM users WHERE username = $1;`, [username]
    )
    if (!checkAuthor.rows.length) {
        return Promise.reject({ status: 404, msg: 'Author not found' })
    }
    const addedComment = await db.query(
            `INSERT INTO comments (body, author, article_id, votes, created_at)
            VALUES ($1, $2, $3, 0, NOW())
            RETURNING *`,
            [body, username, article_id]
        )
        
    return addedComment.rows[0] 
}

exports.incVotesByArticleById = async (article_id, inc_votes) => {
    if (inc_votes === undefined) {
        return Promise.reject({ status: 400, msg: "Bad request: inc_votes is missing"})
    }
    const updatedArticle = await db.query(
        `UPDATE articles
        SET votes = votes + $1
        WHERE article_id = $2
        RETURNING *;`,
        [inc_votes, article_id]
    )
    if (!updatedArticle.rows.length) {
        return Promise.reject({ status: 404, msg: `Article not found for article_id: ${article_id}` });
    }
    return updatedArticle.rows[0]
}