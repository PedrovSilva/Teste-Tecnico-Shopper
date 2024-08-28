import supertest from "supertest";

describe("POST /upload", () => {
    it("should return a temporary link, GUID, and numeric value from the LLM", async () => {
        // Adicione um corpo de requisição se necessário
        const response = await supertest(app)
            .post("/upload")
            .send({
                image_base64: "your_base64_image_data_here" // Substitua pelo dado real
            });

        expect(response.status).toBe(200);

        const expectedKeys = ["image_url", "measure_value", "measure_uuid"];
        expect(response.body).toEqual(expect.objectContaining({
            image_url: expect.any(String),
            measure_value: expect.any(Number),
            measure_uuid: expect.any(String)
        }));

        // Verifica se a resposta contém as chaves esperadas
        expectedKeys.forEach(key => {
            expect(response.body).toHaveProperty(key);
        });
    });
});