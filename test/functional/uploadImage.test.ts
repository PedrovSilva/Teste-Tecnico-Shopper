import supertest from "supertest";
import { app } from "@test/jest-setup";
import { DatabaseService } from "@src/services/databaseService";
import { LLMService } from "@src/services/llmService";

// Mockar o módulo inteiro
jest.mock("@src/services/databaseService");
jest.mock("@src/services/llmService");

// Obter os mocks das instâncias
const mockDbService = jest.mocked(DatabaseService.prototype);
const mockLLMService = jest.mocked(LLMService.prototype);

describe("POST /upload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should process image and return measure data", async () => {
    const image = "valid_base64_image_data";
    const customer_code = "customer123";
    const measure_datetime = new Date().toISOString();
    const measure_type = "WATER";
    const measure_value = 42;

    // Mockar os métodos da instância
    mockDbService.getReadingByCustomerAndType.mockResolvedValue(null);
    mockLLMService.extractValueFromImage.mockResolvedValue({
      value: measure_value,
    });

    const response = await supertest(app).post("/upload").send({
      image,
      customer_code,
      measure_datetime,
      measure_type,
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      image_url: expect.any(String), // Verifique se a URL gerada está correta conforme a implementação
      measure_value,
      measure_uuid: expect.any(String), // Verifique se o UUID gerado está correto
    });
  });

  // Outros testes...
});
