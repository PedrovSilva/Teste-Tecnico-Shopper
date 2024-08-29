import { Controller, Patch } from "@overnightjs/core";
import { Request, Response } from "express";
import { DatabaseService } from "@src/services/databaseService"; // Suponha que você tenha um serviço de banco de dados

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
