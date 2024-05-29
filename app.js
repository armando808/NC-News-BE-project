const express = require("express")
const {getTopics, getEndpoints} = require("./controllers/topics.controllers")
const {getArticles, getArticleById} =require("./controllers/articles.controllers")

const app = express()

app.get("/api/topics", getTopics)
app.get("/api", getEndpoints)
app.get("/api/articles", getArticles)
app.get("/api/articles/:article_id", getArticleById)

app.use((req, res, next) => {
    res.status(404).send({ msg: 'Route not found' });
});

app.use((err, req, res, next) => {
    res.status(500).send({ msg: 'server error!'})
})


module.exports = app