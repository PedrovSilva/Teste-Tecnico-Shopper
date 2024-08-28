import { SetupServer } from '@src/server';
import supertest, { SuperTest, Test } from 'supertest';

// Declare the app variable at the module level
let app: SuperTest<Test>;

// Set up the server and initialize `app` before all tests
beforeAll(async () => {
  const server = new SetupServer();
  await server.init();  // Assuming `init` returns a promise or is async
  app = supertest(server.getApp());
});

// Export the `app` variable for use in your tests
export { app };

