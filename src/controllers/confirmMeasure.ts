import { Controller, Patch } from "@overnightjs/core";
import { Request, Response } from "express";
import { DatabaseService } from "@src/services/databaseService"; // Suponha que você tenha um serviço de banco de dados

/**
 * @swagger
 * /confirm:
 *   patch:
 *     summary: Confirm a measure
 *     description: Updates the confirmation status of a specific measure with a confirmed value.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               measure_uuid:
 *                 type: string
 *                 description: The UUID of the measure to confirm.
 *                 example: 'b3e4d4b8-14f8-4c09-96a3-2b93087cfb9c'
 *               confirmed_value:
 *                 type: number
 *                 description: The confirmed value to set for the measure.
 *                 example: 123.45
 *     responses:
 *       200:
 *         description: Confirmation successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid data types or already confirmed reading
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid data types"
 *       404:
 *         description: Reading not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Reading not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal Server Error"
 */
@Controller("confirm")
export class ConfirmMeasureController {
  private dbService: DatabaseService;

  constructor() {
    this.dbService = new DatabaseService(); // Inicialize o serviço de banco de dados
  }

  @Patch("")
  public async patchConfirmValue(req: Request, res: Response): Promise<void> {
    try {
      const { measure_uuid, confirmed_value } = req.body;

      // Validar o tipo de dados dos parâmetros enviados
      if (
        typeof measure_uuid !== "string" ||
        typeof confirmed_value !== "number"
      ) {
        res.status(400).json({ error: "Invalid data types" });
        return;
      }

      // Verificar se o código de leitura informado existe
      const reading = await this.dbService.getReadingByUuid(measure_uuid);
      if (!reading) {
        res.status(404).json({ error: "Reading not found" });
        return;
      }

      // Verificar se o código de leitura já foi confirmado
      if (reading.confirmed) {
        res.status(400).json({ error: "Reading already confirmed" });
        return;
      }

      // Salvar o novo valor informado no banco de dados
      await this.dbService.updateReading(measure_uuid, confirmed_value);

      // Responder com sucesso
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error processing confirm request:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}
