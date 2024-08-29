import { Controller, Get } from "@overnightjs/core";
import { Request, Response } from "express";
import { DatabaseService } from "./databaseService"; // Serviço para interagir com o banco de dados

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
