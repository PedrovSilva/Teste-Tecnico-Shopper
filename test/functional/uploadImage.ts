import supertest from "supertest";

describe("Responsavel por receber uma imagem em base 64, consultar o Gemine e retornar a medida lida pela API\n Validar o tipo de dados dos parametros enviados (inclusive o base64\n Vefificar se ja existe uma leitura no mes naquele tipo de leitura \n integrar com uma API de LLM para extrair o valor da imagem", () =>{
    it("Un link temporario para a imagem\n um GUID \nO valor numerico reconhecido pela LLM"), async() => {
        const {body, status} = await supertest(app).post("/upload");
        expect(status).toBe(200);
        expect(body).toBe([{
            "image_url": "string",
            "measure_value":"integer",
            "measure_uuid":" string"  
        }])
    }
})