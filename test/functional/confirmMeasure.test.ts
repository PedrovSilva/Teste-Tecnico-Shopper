import supertest from "supertest";
import { app } from "@test/jest-setup"; // Certifique-se de importar o app corretamente
import { DatabaseService } from "@src/services/databaseService"; // Importar o serviço de banco de dados

// Mock do serviço de banco de dados
jest.mock("@src/services/databaseService");

// Tipo do mock
const mockGetReadingByUuid = jest.fn();
const mockUpdateReading = jest.fn();

// Adiciona os métodos mock ao protótipo da classe DatabaseService
(
  DatabaseService as jest.MockedClass<typeof DatabaseService>
).prototype.getReadingByUuid = mockGetReadingByUuid;
(
  DatabaseService as jest.MockedClass<typeof DatabaseService>
).prototype.updateReading = mockUpdateReading;

describe("PATCH /confirm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should confirm a reading with valid data", async () => {
    const measure_uuid = "some-uuid";
    const confirmed_value = 42;

    // Mock do serviço de banco de dados
    mockGetReadingByUuid.mockResolvedValue({
      uuid: measure_uuid,
      confirmed: false,
    });
    mockUpdateReading.mockResolvedValue(undefined);

    const response = await supertest(app).patch("/confirm").send({
      measure_uuid,
      confirmed_value,
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
  });

  it("should return 400 for invalid data types", async () => {
    const response = await supertest(app).patch("/confirm").send({
      measure_uuid: 123, // Invalid type
      confirmed_value: "not-a-number", // Invalid type
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid data types" });
  });

  it("should return 404 if the reading does not exist", async () => {
    const measure_uuid = "non-existent-uuid";
    const confirmed_value = 42;

    mockGetReadingByUuid.mockResolvedValue(null);

    const response = await supertest(app).patch("/confirm").send({
      measure_uuid,
      confirmed_value,
    });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Reading not found" });
  });

  it("should return 400 if the reading is already confirmed", async () => {
    const measure_uuid = "already-confirmed-uuid";
    const confirmed_value = 42;

    mockGetReadingByUuid.mockResolvedValue({
      uuid: measure_uuid,
      confirmed: true,
    });

    const response = await supertest(app).patch("/confirm").send({
      measure_uuid,
      confirmed_value,
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Reading already confirmed" });
  });

  it("should return 500 on server error", async () => {
    const measure_uuid = "some-uuid";
    const confirmed_value = 42;

    mockGetReadingByUuid.mockRejectedValue(new Error("Database error"));

    const response = await supertest(app).patch("/confirm").send({
      measure_uuid,
      confirmed_value,
    });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Internal Server Error" });
  });
});
