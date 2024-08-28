import express from "express";
import { SetupServer } from "@src/server";
import supertest, { SuperTest, Test } from "supertest";

let app: any;

beforeAll(async () => {
  const server = new SetupServer();
  await server.init();
  const expressApp: express.Application = server.getApp(); // Ensure this is correct
  app = supertest(expressApp);
});

export { app };
