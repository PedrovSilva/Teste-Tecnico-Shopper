import supertest from "supertest";
import app from "../path/to/your/app"; // Certifique-se de importar o app corretamente
import { DatabaseService } from "../path/to/databaseService"; // Importar o serviço de banco de dados
import { LLMService } from "../path/to/llmService"; // Importar o serviço LLM

jest.mock("../path/to/databaseService");
jest.mock("../path/to/llmService");

const mockDbService = DatabaseService as jest.Mocked<typeof DatabaseService>;
const mockLLMService = LLMService as jest.Mocked<typeof LLMService>;

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

        mockDbService.prototype.getReadingByCustomerAndType.mockResolvedValue(null);
        mockLLMService.prototype.extractValueFromImage.mockResolvedValue({ value: measure_value });

        const response = await supertest(app)
            .post("/upload")
            .send({
                image,
                customer_code,
                measure_datetime,
                measure_type
            });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            image_url: expect.any(String), // Verifique se a URL gerada está correta conforme a implementação
            measure_value,
            measure_uuid: expect.any(String) // Verifique se o UUID gerado está correto
        });
    });

    it("should return 400 for invalid data", async () => {
        const response = await supertest(app)
            .post("/upload")
            .send({
                image: 123, // Invalid type
                customer_code: true, // Invalid type
                measure_datetime: "invalid_date",
                measure_type: "UNKNOWN" // Invalid measure type
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            error_code: "INVALID_DATA",
            error_description: "Os dados fornecidos no corpo da requisição são inválidos"
        });
    });

    it("should return 409 if reading already exists for the month", async () => {
        const image = "valid_base64_image_data";
        const customer_code = "customer123";
        const measure_datetime = new Date().toISOString();
        const measure_type = "WATER";

        mockDbService.prototype.getReadingByCustomerAndType.mockResolvedValue({
            measure_uuid: "existing_uuid",
            customer_code,
            measure_datetime,
            measure_type,
            value: 42,
            image_url: "http://example.com/image.png",
            confirmed: false
        });

        const response = await supertest(app)
            .post("/upload")
            .send({
                image,
                customer_code,
                measure_datetime,
                measure_type
            });

        expect(response.status).toBe(409);
        expect(response.body).toEqual({
            error_code: "DOUBLE_REPORT",
            error_description: "Leitura do mês já realizada"
        });
    });

    it("should return 500 on server error", async () => {
        const image = "valid_base64_image_data";
        const customer_code = "customer123";
        const measure_datetime = new Date().toISOString();
        const measure_type = "WATER";

        mockDbService.prototype.getReadingByCustomerAndType.mockRejectedValue(new Error("Database error"));

        const response = await supertest(app)
            .post("/upload")
            .send({
                image,
                customer_code,
                measure_datetime,
                measure_type
            });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: "Internal Server Error" });
    });
});
