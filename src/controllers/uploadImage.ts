import { Controller, Post } from "@overnightjs/core";
import { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid'; // Para gerar GUIDs
import { someExternalService } from "./someExternalService"; // Suponha que você tenha um serviço para processar a imagem

@Controller("upload")
export class UploadController {
    
    @Post("")
    public async postUploadImage(req: Request, res: Response): Promise<void> {
        try {
            // Verificar se o corpo da requisição contém a imagem em base64
            const { image_base64 } = req.body;

            if (!image_base64 || typeof image_base64 !== "string") {
                res.status(400).json({ error: "Invalid base64 image data" });
                return;
            }

            // Decodificar a imagem em base64 (aqui você pode fazer o processamento necessário)
            const imageData = Buffer.from(image_base64, 'base64');

            // Aqui você pode salvar a imagem em um armazenamento ou processá-la
            // Por exemplo, utilizando uma API externa para analisar a imagem
            const analysisResult = await someExternalService.analyzeImage(imageData);

            // Gerar um GUID e construir a URL temporária (ou qualquer outro processo necessário)
            const measure_uuid = uuidv4();
            const image_url = `https://example.com/images/${measure_uuid}.png`;
            const measure_value = analysisResult.value; // Supondo que `value` é o resultado da análise

            // Responder com os dados necessários
            res.status(200).json({
                image_url,
                measure_value,
                measure_uuid
            });
        } catch (error) {
            // Lidar com erros
            console.error("Error processing image upload:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
}
