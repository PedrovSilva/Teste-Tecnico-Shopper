import express from "express";
import { SetupServer } from "@src/server";

let expressApp: express.Application;

beforeAll(async () => {
  const server = new SetupServer();
  await server.init();
  expressApp = server.getApp(); // Certifique-se de que isso é uma instância do Express
});

export { expressApp as app }; // Exporta a instância do Express
