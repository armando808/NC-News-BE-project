const db = require("../db/connection")
const seed = require("../db/seeds/seed")
const testData = require("../db/data/test-data/index")
const request = require("supertest")
const app = require("../app")
const endpoints = require("../endpoints.json")

beforeEach(() => { return seed(testData) })
afterAll(() => { return db.end() })

describe("GET /api/topics", () => {
    test("status: 200 responds with all topics", async () => {
        const response = await request(app).get("/api/topics")
        expect(response.status).toBe(200)
        expect(response.body.topics).toHaveLength(3)
        response.body.topics.forEach((topic) => {
            expect(topic).toMatchObject({
                description: expect.any(String),
                slug: expect.any(String)
            })
        })
    })

    test("status: 404 for bad routes (get request for non existent data)", async () => {
        const response = await request(app).get("/api/gibberish")
        expect(response.status).toBe(404)
        expect(response.body.msg).toBe('Route not found')
    })
})

describe("GET /api", () => {
    test("status: 200 responds with JSON object describing all available endpoints on the api", async () => {
        const response = await request(app).get("/api")
        expect(response.status).toBe(200)
        expect(response.body).toEqual(endpoints)
    })
})

describe("GET /api/articles", () => {
    test("status: 200 responds with array of articles, with comment_count column added and populated correctly, sorted by date, descending order", async () => {
        const response = await request(app).get("/api/articles")
        expect(response.status).toBe(200)
        response.body.articles.forEach((article) => {
            expect(article).toMatchObject({
                author: expect.any(String),
                title: expect.any(String),
                article_id: expect.any(Number),
                topic: expect.any(String),
                created_at: expect.any(String),
                votes: expect.any(Number),
                article_img_url: expect.any(String),
                comment_count: expect.any(String),
            })
        })
        expect(response.body.articles).toBeSortedBy('created_at', { descending: true })
    })
    test("status: 404 for bad routes (get request for non existent data)", async () => {
        const response = await request(app).get("/api/gibberish")
        expect(response.status).toBe(404)
        expect(response.body.msg).toBe('Route not found')
    })
})


describe("GET /api/articles/:article_id", () => {
    test("status: 200 responds with a single article associated with that article ID",
    async () => {
        const response = await request(app).get("/api/articles/1")
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty("article")
        expect(Array.isArray(response.body.article)).toBe(false)
        expect(response.body.article).toHaveProperty("author");
        expect(response.body.article).toHaveProperty("title");
        expect(response.body.article).toHaveProperty("article_id");
        expect(response.body.article).toHaveProperty("body");
        expect(response.body.article).toHaveProperty("topic");
        expect(response.body.article).toHaveProperty("created_at");
        expect(response.body.article).toHaveProperty("votes");
        expect(response.body.article).toHaveProperty("article_img_url")
    })

    test("status: 404 for nonexistent article_id, if route is otherwise ok", async () => {
        const response = await request(app).get("/api/articles/75")
        expect(response.status).toBe(404)
        expect(response.body.msg).toBe('Article not found for article_id: 75')
    })
})
