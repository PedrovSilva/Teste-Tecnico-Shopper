import { Controller, Post } from "@overnightjs/core";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { DatabaseService } from "@src/services/databaseService"; // Serviço de banco de dados
import { LLMService } from "@src/services/llmService"; // Serviço para interagir com a API LLM
import { format } from "date-fns"; // Para formatação de datas

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload an image
 *     description: Uploads an image and extracts the measure value from it.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 example: 'base64-encoded-image'
 *               customer_code:
 *                 type: string
 *                 example: 'customer123'
 *               measure_datetime:
 *                 type: string
 *                 format: date-time
 *                 example: '2024-08-30T12:00:00Z'
 *               measure_type:
 *                 type: string
 *                 enum: [WATER, GAS]
 *                 example: 'WATER'
 *     responses:
 *       200:
 *         description: Successfully uploaded and processed image
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 image_url:
 *                   type: string
 *                   example: 'https://example.com/images/uuid.png'
 *                 measure_value:
 *                   type: number
 *                   example: 123.45
 *                 measure_uuid:
 *                   type: string
 *                   example: 'uuid-1234'
 *       400:
 *         description: Invalid request data
 *       409:
 *         description: Duplicate measure for the current month
 *       500:
 *         description: Internal server error
 */
@Controller("upload")
export class UploadImageController {
  private dbService: DatabaseService;
  private llmService: LLMService;

  constructor() {
    this.dbService = new DatabaseService();
    this.llmService = new LLMService();
  }

  @Post("")
  public async postUploadImage(req: Request, res: Response): Promise<void> {
    try {
      const { image, customer_code, measure_datetime, measure_type } = req.body;

      // Validação dos dados fornecidos
      if (
        typeof image !== "string" ||
        typeof customer_code !== "string" ||
        typeof measure_datetime !== "string" ||
        (measure_type !== "WATER" && measure_type !== "GAS")
      ) {
        res.status(400).json({
          error_code: "INVALID_DATA",
          error_description:
            "Os dados fornecidos no corpo da requisição são inválidos",
        });
        return;
      }

      // Decodificar a imagem base64
      let imageData: Buffer;
      try {
        imageData = Buffer.from(image, "base64");
      } catch (error) {
        res.status(400).json({
          error_code: "INVALID_DATA",
          error_description: "A imagem base64 fornecida é inválida",
        });
        return;
      }

      // Verificar se já existe uma leitura para o tipo no mês atual
      const currentMonth = format(new Date(measure_datetime), "yyyy-MM");
      const existingReading = await this.dbService.getReadingByCustomerAndType(
        customer_code,
        measure_type,
        currentMonth
      );
      if (existingReading) {
        res.status(409).json({
          error_code: "DOUBLE_REPORT",
          error_description: "Leitura do mês já realizada",
        });
        return;
      }

      // Integrar com a API LLM para extrair o valor da imagem
      let value: number | null = null;
      try {
        const result = await this.llmService.extractValueFromImage(imageData);
        value = result.value;
      } catch (error) {
        res.status(500).json({
          error_code: "LLM_SERVICE_ERROR",
          error_description: "Erro ao processar a imagem com a API LLM",
        });
        return;
      }

      // Gerar um UUID e construir a URL temporária
      const measure_uuid = uuidv4();
      const image_url = `https://example.com/images/${measure_uuid}.png`; // Ajuste conforme necessário

      // Salvar no banco de dados
      try {
        await this.dbService.saveReading({
          measure_uuid,
          customer_code,
          measure_datetime,
          measure_type,
          value,
          image_url,
          confirmed: false, // Inicialmente não confirmado
        });

        // Responder com sucesso
        res.status(200).json({
          image_url,
          measure_value: value,
          measure_uuid,
        });
      } catch (error) {
        console.error("Error saving reading:", error);
        res.status(500).json({
          error_code: "DATABASE_ERROR",
          error_description: "Erro ao salvar a leitura no banco de dados",
        });
      }
    } catch (error) {
      console.error("Error processing upload request:", error);
      res.status(500).json({
        error_code: "INTERNAL_SERVER_ERROR",
        error_description: "Erro interno no servidor",
      });
    }
  }
}
