import request from "supertest";
import { createApp } from "../../src/app";

describe("API integration", () => {
  const app = createApp();

  it("returns health", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
  });

  it("returns 404 for unknown route", async () => {
    const res = await request(app).get("/unknown-route");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", "Not Found");
  });
});


