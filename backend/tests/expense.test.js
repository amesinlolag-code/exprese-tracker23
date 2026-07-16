import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_secret";

let mongod;
let app;

const user = { name: "Cha Hae-In", email: "haein@hunters.com", password: "swordqueen1" };

const registerAndLogin = async () => {
  const agent = request.agent(app);
  await agent.post("/api/auth/register").send(user);
  return agent;
};

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

describe("Expense API", () => {
  test("rejects unauthenticated access", async () => {
    const res = await request(app).get("/api/expenses");
    expect(res.status).toBe(401);
  });

  test("creates an expense and awards XP + the 'log_a_kill' quest", async () => {
    const agent = await registerAndLogin();
    const res = await agent.post("/api/expenses").send({
      amount: 42.5,
      category: "Food",
      description: "Ramen",
      date: "2026-07-15",
    });
    expect(res.status).toBe(201);
    expect(res.body.expense.amount).toBe(42.5);
    expect(res.body.gamification.questsCompleted).toContain("log_a_kill");
    expect(res.body.gamification.xpGained).toBeGreaterThan(0);
  });

  test("rejects invalid category", async () => {
    const agent = await registerAndLogin();
    const res = await agent.post("/api/expenses").send({
      amount: 10,
      category: "NotACategory",
      date: "2026-07-15",
    });
    expect(res.status).toBe(400);
  });

  test("lists, filters by category, and sorts by amount", async () => {
    const agent = await registerAndLogin();
    await agent.post("/api/expenses").send({ amount: 10, category: "Food", date: "2026-07-01" });
    await agent.post("/api/expenses").send({ amount: 50, category: "Bills", date: "2026-07-02" });
    await agent.post("/api/expenses").send({ amount: 20, category: "Food", date: "2026-07-03" });

    const res = await agent.get("/api/expenses?category=Food&sortBy=amount&order=asc");
    expect(res.status).toBe(200);
    expect(res.body.expenses).toHaveLength(2);
    expect(res.body.expenses[0].amount).toBe(10);
    expect(res.body.expenses[1].amount).toBe(20);
  });

  test("filters by min/max amount and date range", async () => {
    const agent = await registerAndLogin();
    await agent.post("/api/expenses").send({ amount: 5, category: "Food", date: "2026-01-01" });
    await agent.post("/api/expenses").send({ amount: 100, category: "Shopping", date: "2026-06-01" });

    const res = await agent.get("/api/expenses?minAmount=50&startDate=2026-05-01");
    expect(res.status).toBe(200);
    expect(res.body.expenses).toHaveLength(1);
    expect(res.body.expenses[0].amount).toBe(100);
  });

  test("updates an expense", async () => {
    const agent = await registerAndLogin();
    const created = await agent
      .post("/api/expenses")
      .send({ amount: 10, category: "Food", date: "2026-07-01" });
    const id = created.body.expense._id;

    const res = await agent.put(`/api/expenses/${id}`).send({ amount: 99 });
    expect(res.status).toBe(200);
    expect(res.body.amount).toBe(99);
  });

  test("deletes an expense", async () => {
    const agent = await registerAndLogin();
    const created = await agent
      .post("/api/expenses")
      .send({ amount: 10, category: "Food", date: "2026-07-01" });
    const id = created.body.expense._id;

    const del = await agent.delete(`/api/expenses/${id}`);
    expect(del.status).toBe(200);

    const getAfter = await agent.get(`/api/expenses/${id}`);
    expect(getAfter.status).toBe(404);
  });

  test("prevents a user from accessing another user's expense", async () => {
    const agentA = await registerAndLogin();
    const created = await agentA
      .post("/api/expenses")
      .send({ amount: 10, category: "Food", date: "2026-07-01" });
    const id = created.body.expense._id;

    const agentB = request.agent(app);
    await agentB
      .post("/api/auth/register")
      .send({ name: "Beru", email: "beru@hunters.com", password: "shadowarmy1" });

    const res = await agentB.get(`/api/expenses/${id}`);
    expect(res.status).toBe(404);
  });

  test("exports expenses as CSV", async () => {
    const agent = await registerAndLogin();
    await agent.post("/api/expenses").send({ amount: 10, category: "Food", date: "2026-07-01" });

    const res = await agent.get("/api/expenses/export");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/csv");
    expect(res.text).toContain("date,category,amount,description");
  });

  test("dashboard returns totals, category breakdown, and quest state", async () => {
    const agent = await registerAndLogin();
    await agent.post("/api/expenses").send({ amount: 10, category: "Food", date: new Date().toISOString() });

    const res = await agent.get("/api/dashboard");
    expect(res.status).toBe(200);
    expect(res.body.totalThisMonth).toBe(10);
    expect(res.body.byCategory[0].category).toBe("Food");
    expect(res.body.recentExpenses).toHaveLength(1);
    expect(res.body.quests.find((q) => q.id === "log_a_kill").completed).toBe(true);
  });
});
