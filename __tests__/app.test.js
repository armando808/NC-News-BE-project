const db = require("../db/connection")
const seed = require("../db/seeds/seed")
const testData = require("../db/data/test-data/index")
const request = require("supertest")
const app = require("../app")

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