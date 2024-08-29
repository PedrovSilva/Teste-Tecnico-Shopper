import supertest from "supertest";
import { app } from "@test/jest-setup";
import { DatabaseService } from "../path/to/databaseService"; // Importar o serviço de banco de dados

jest.mock("../path/to/databaseService"); // Mockar o serviço de banco de dados

const mockDbService = DatabaseService as jest.Mocked<typeof DatabaseService>;

describe("GET /customers/:customer_code/list", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return measures for a customer", async () => {
    const customer_code = "123";
    const measure_type = "WATER";
    const measures = [
      {
        measure_uuid: "uuid1",
        measure_datetime: new Date().toISOString(),
        measure_type: "WATER",
        has_confirmed: false,
        image_url: "http://example.com/image1.png",
      },
      {
        measure_uuid: "uuid2",
        measure_datetime: new Date().toISOString(),
        measure_type: "WATER",
        has_confirmed: true,
        image_url: "http://example.com/image2.png",
      },
    ];

    mockDbService.prototype.getMeasuresByCustomerCode.mockResolvedValue(
      measures,
    );

    const response = await supertest(app)
      .get(`/customers/${customer_code}/list`)
      .query({ measure_type });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      customer_code,
      measures,
    });
  });

  it("should return 400 for invalid measure_type", async () => {
    const customer_code = "123";
    const invalidMeasureType = "INVALID";

    const response = await supertest(app)
      .get(`/customers/${customer_code}/list`)
      .query({ measure_type: invalidMeasureType });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error_code: "INVALID_TYPE",
      error_description: "Tipo de medição não permitida",
    });
  });

  it("should return 404 if no measures are found", async () => {
    const customer_code = "123";

    mockDbService.prototype.getMeasuresByCustomerCode.mockResolvedValue([]);

    const response = await supertest(app).get(
      `/customers/${customer_code}/list`,
    );

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error_code: "MEASURES_NOT_FOUND",
      error_description: "Nenhuma leitura encontrada",
    });
  });

  it("should return 500 on server error", async () => {
    const customer_code = "123";

    mockDbService.prototype.getMeasuresByCustomerCode.mockRejectedValue(
      new Error("Database error"),
    );

    const response = await supertest(app).get(
      `/customers/${customer_code}/list`,
    );

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Internal Server Error" });
  });
});
