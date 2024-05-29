const {fetchTopics} = require("../models/topics.models")
const endpoints = require("../endpoints.json")

exports.getTopics = async (req, res, next) => {
    try {
        const topics = await fetchTopics()
        res.status(200).send( {topics} )
    } catch (err) {
        next(err)
    }
}

exports.getEndpoints = (req, res) => {
    res.status(200).send(endpoints)
}

