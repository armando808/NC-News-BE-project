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
        expect(response.body.article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            body: expect.any(String),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String)
        });
    })

    test("status: 404 for nonexistent article_id, if route is otherwise ok", async () => {
        const response = await request(app).get("/api/articles/75")
        expect(response.status).toBe(404)
        expect(response.body.msg).toBe('Article not found for article_id: 75')
    })

    test("status: 400 for invalid requests (eg not a number when searching by article_id)", async () => {
        const response = await request(app).get("/api/articles/invalidID")
        expect(response.status).toBe(400)
        expect(response.body.msg).toBe("Bad request")
    })
})

describe("GET /api/comments/:article_id", () => {
    test("status: 200 responds with an array of comments associated with that article (via article_id)",
    async () => {
        const response = await request(app).get("/api/articles/1/comments")
        expect(response.status).toBe(200)
        response.body.comments.forEach((comment) => {
            expect(comment).toMatchObject({
                comment_id: expect.any(Number),
                votes: expect.any(Number),
                created_at: expect.any(String),
                author: expect.any(String),
                body: expect.any(String),
                article_id: expect.any(Number),
            })
        })
        expect(response.body.comments).toBeSortedBy('created_at', { descending: true })
    })
    test("status: 404 for nonexistent article_id, if route is otherwise ok", async () => {
        const response = await request(app).get("/api/articles/75/comments")
        expect(response.status).toBe(404)
        expect(response.body.msg).toBe('Comments not found for article_id: 75')
    })
    test("status: 400 for invalid requests (eg not a number when searching by article_id)", async () => {
        const response = await request(app).get("/api/articles/invalidID/comments")
        expect(response.status).toBe(400)
        expect(response.body.msg).toBe("Bad request")
    })
})

describe("POST /api/articles/:article_id/comments", () => {
    test("status: 201 adds a comment to the associated article (via article_id), returning updated comment table", async () => {
        const comment = {
            username: "butter_bridge",
            body: "generic comment"
        }
        const response = await request(app)
        .post("/api/articles/1/comments")
        .send(comment)
        .expect(201)

        expect(response.body.comment).toMatchObject({
            comment_id: expect.any(Number),
            body: "generic comment",
            article_id: 1,
            author: "butter_bridge",
            votes: 0,
            created_at: expect.any(String)
        })
    })
    test("status: 400 if missing part of the query eg no username", async () => {
        const commentNotFinished = {
            body: "generic comment"
        }
        const response = await request(app)
            .post("/api/articles/1/comments")
            .send(commentNotFinished)
            .expect(400)
        expect(response.body.msg).toBe("Bad request: must include both username and body")
    })
    test("status: 404 when article does not exist, but route otherwise fine/valid", async () => {
        const comment = {
            username: "butter_bridge",
            body: "generic comment"
        };
        const response = await request(app)
            .post("/api/articles/75/comments")
            .send(comment)
            .expect(404);
        expect(response.body.msg).toBe("Article not found for article_id: 75");
    });
    test("status: 404 when author does not exist", async () => {
        const comment = {
            username: "count-chocula",
            body: "generic comment"
        }
        const response = await request(app)
            .post("/api/articles/1/comments")
            .send(comment)
            .expect(404);
        
        expect(response.body.msg).toBe("Author not found");
    })
})

describe("POST /api/articles/:article_id/comments", () => {
    test("status: 200 updates the article by changing the number of votes, responds with updated article object reflecting new vote count", async () => {
        const voteIncrementsBy = { inc_votes: 1 }
        const response = await request(app)
        .patch("/api/articles/1")
        .send(voteIncrementsBy)
        .expect(200)

        expect(response.body.article).toMatchObject({
            title: "Living in the shadow of a great man",
            topic: "mitch",
            author: "butter_bridge",
            body: "I find this existence challenging",
            created_at: expect.any(String),
            votes: 101,
            article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
        });
    })
    test("status: 400 when request does not contain info to change the number of votes (missing inc_votes)", async () => {
        const response = await request(app)
        .patch("/api/articles/1")
        .send({})
        .expect(400)
        expect(response.body.msg).toBe("Bad request: inc_votes is missing")
    })
    test("status: 404 when article does not exist", async () => {
        const response = await request(app)
            .patch("/api/articles/75")
            .send({ inc_votes: 1 })
            .expect(404);
        expect(response.body.msg).toBe("Article not found for article_id: 75");
    });
})