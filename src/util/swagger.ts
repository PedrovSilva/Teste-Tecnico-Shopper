import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "API documentation for the project",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./src/controllers/*.ts"], // Altere o caminho conforme necessário
};

const specs = swaggerJsdoc(options);

export default {
  swaggerUi,
  specs,
};
