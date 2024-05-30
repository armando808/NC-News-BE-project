const express = require("express")
const {getTopics, getEndpoints} = require("./controllers/topics.controllers")
const {getArticles, getArticleById} =require("./controllers/articles.controllers")

const app = express()

app.get("/api/topics", getTopics)
app.get("/api", getEndpoints)
app.get("/api/articles", getArticles)
app.get("/api/articles/:article_id", getArticleById)

app.use((req, res, next) => {
    res.status(404).send({ msg: "Route not found" })
})

app.use((err, req, res, next) => {
    if (err.status && err.msg) {
        res.status(err.status).send({ msg: err.msg });
    } else {
        next(err)
    }
})
    
app.use((err, req, res, next) => {
    if (err.code === '22P02') {
        res.status(400).send({ msg: "Bad request"})
    } else {
        next(err)
    }
})    

app.use((err, req, res, next) => {
    res.status(500).send({ msg: 'server error!'})
})

module.exports = app