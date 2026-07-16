import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_secret";

let mongod;
let app;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  await mongoose.connect(process.env.MONGO_URI);
  ({ default: app } = await import("../server.js"));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe("Auth API", () => {
  const user = { name: "Sung Jinwoo", email: "jinwoo@hunters.com", password: "arise123" };

  test("registers a new user and returns 201 with gamification status", async () => {
    const res = await request(app).post("/api/auth/register").send(user);
    expect(res.status).toBe(201);
    expect(res.body.email).toBe(user.email);
    expect(res.body.status.rank).toBe("E");
    expect(res.body.status.level).toBe(1);
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  test("rejects duplicate email registration with 400", async () => {
    await request(app).post("/api/auth/register").send(user);
    const res = await request(app).post("/api/auth/register").send(user);
    expect(res.status).toBe(400);
  });

  test("rejects registration with missing fields", async () => {
    const res = await request(app).post("/api/auth/register").send({ email: "x@x.com" });
    expect(res.status).toBe(400);
  });

  test("logs in with correct credentials", async () => {
    await request(app).post("/api/auth/register").send(user);
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password });
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(user.email);
  });

  test("rejects login with wrong password", async () => {
    await request(app).post("/api/auth/register").send(user);
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: "wrongpassword" });
    expect(res.status).toBe(401);
  });

  test("blocks profile access without a token", async () => {
    const res = await request(app).get("/api/auth/profile");
    expect(res.status).toBe(401);
  });

  test("allows profile access with a valid session cookie", async () => {
    const agent = request.agent(app);
    await agent.post("/api/auth/register").send(user);
    const res = await agent.get("/api/auth/profile");
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(user.email);
  });
});
