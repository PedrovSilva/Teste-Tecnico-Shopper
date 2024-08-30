import "./util/module-alias";
import { SetupServer } from "@src/server"; // Ajuste o caminho conforme necessário

async function startServer() {
  const server = new SetupServer(3000);

  await server.init();

  const app = server.getApp();

  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });

  // Handle server shutdown
  process.on("SIGINT", async () => {
    console.log("Shutting down...");
    await server.close();
    process.exit();
  });
}

startServer().catch((err) => {
  console.error("Error starting server:", err);
});
