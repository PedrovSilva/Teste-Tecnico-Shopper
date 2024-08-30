import { Controller, Get } from "@overnightjs/core";
import { Request, Response } from "express";
import { DatabaseService } from "@src/services/databaseService"; // Serviço para interagir com o banco de dados

/**
 * @swagger
 * /customers/{customer_code}/list:
 *   get:
 *     summary: Retrieve measures for a customer
 *     description: Retrieves all measures for a specific customer, optionally filtered by measure type.
 *     parameters:
 *       - in: path
 *         name: customer_code
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer code for which measures are to be retrieved.
 *       - in: query
 *         name: measure_type
 *         required: false
 *         schema:
 *           type: string
 *           enum: [WATER, GAS]
 *         description: The type of measurement to filter by. If not provided, retrieves all types.
 *     responses:
 *       200:
 *         description: Measures retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 customer_code:
 *                   type: string
 *                 measures:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       measure_uuid:
 *                         type: string
 *                       measure_datetime:
 *                         type: string
 *                         format: date-time
 *                       measure_type:
 *                         type: string
 *                       value:
 *                         type: number
 *                       image_url:
 *                         type: string
 *                       confirmed:
 *                         type: boolean
 *       400:
 *         description: Invalid measurement type
 *       404:
 *         description: No measures found for the customer
 *       500:
 *         description: Internal server error
 */

@Controller("customers")
export class ListMeasuresController {
  private dbService: DatabaseService;

  constructor() {
    this.dbService = new DatabaseService(); // Inicializar o serviço de banco de dados
  }

  @Get(":customer_code/list")
  public async getMeasures(req: Request, res: Response): Promise<void> {
    try {
      const { customer_code } = req.params;
      const { measure_type } = req.query;

      // Validar o tipo de medição
      const validMeasureTypes = ["WATER", "GAS"];
      if (
        measure_type &&
        !validMeasureTypes.includes((measure_type as string).toUpperCase())
      ) {
        res.status(400).json({
          error_code: "INVALID_TYPE",
          error_description: "Tipo de medição não permitida",
        });
        return;
      }

      // Obter medidas do banco de dados
      const measures = await this.dbService.getMeasuresByCustomerCode(
        customer_code,
        measure_type as string | undefined
      );

      // Verificar se há medidas
      if (measures.length === 0) {
        res.status(404).json({
          error_code: "MEASURES_NOT_FOUND",
          error_description: "Nenhuma leitura encontrada",
        });
        return;
      }

      // Responder com sucesso
      res.status(200).json({
        customer_code,
        measures,
      });
    } catch (error) {
      console.error("Error fetching measures:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}
