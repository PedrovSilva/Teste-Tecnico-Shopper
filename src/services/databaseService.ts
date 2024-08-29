import { Reading, gfs } from '@src/models/reading'; // Ajuste o caminho conforme a estrutura do projeto
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export class DatabaseService {
  // Método para obter medidas por código do cliente e tipo de medição
  public async getMeasuresByCustomerCode(
    customer_code: string,
    measure_type?: string
  ): Promise<any[]> {
    try {
      const query: any = { customer_code };
      if (measure_type) {
        query.measure_type = measure_type;
      }

      return await Reading.find(query).then();
    } catch (error) {
      console.error('Error fetching measures:', error);
      throw new Error('Error fetching measures');
    }
  }

  // Método para verificar se já existe uma leitura para o cliente e tipo no mês atual
  public async getReadingByCustomerAndType(
    customer_code: string,
    measure_type: string,
    month: string
  ): Promise<any> {
    try {
      return await Reading.findOne({
        customer_code,
        measure_type,
        measure_datetime: {
          $gte: new Date(`${month}-01`),
          $lt: new Date(`${month}-01`).setMonth(new Date(`${month}-01`).getMonth() + 1),
        },
      }).then();
    } catch (error) {
      console.error('Error fetching reading:', error);
      throw new Error('Error fetching reading');
    }
  }
   // Método para salvar uma nova leitura
   public async saveReading(readingData: {
    measure_uuid: string;
    customer_code: string;
    measure_datetime: string;
    measure_type: string;
    value: number | null;
    image_url: string;
    confirmed: boolean;
  }): Promise<void> {
    try {
      const newReading = new Reading({
        ...readingData,
        image_url: new ObjectId() // Placeholder, será atualizado após o upload da imagem
      });
      await newReading.save();
    } catch (error) {
      console.error('Error saving reading:', error);
      throw new Error('Error saving reading');
    }
  }
  public async saveImage(imageData: Buffer, measure_uuid: string): Promise<void> {
    try {
      const writeStream = gfs.createWriteStream({
        filename: `${measure_uuid}.png`,
        content_type: 'image/png',
      });

      writeStream.end(imageData);

      // Esperar que a escrita esteja completa
      return new Promise((resolve, reject) => {
        writeStream.on('finish', async () => {
          const fileId = writeStream.id;
          // Atualizar o Reading com o ID do arquivo
          await Reading.updateOne({ measure_uuid }, { image_url: fileId }).then();
          resolve();
        });
        writeStream.on('error', reject);
      });
    } catch (error) {
      console.error('Error saving image:', error);
      throw new Error('Error saving image');
    }
  }

  // Método para obter uma leitura pelo UUID
  public async getReadingByUuid(measure_uuid: string): Promise<any> {
    try {
      return await Reading.findOne({ measure_uuid }).then();
    } catch (error) {
      console.error('Error fetching reading by UUID:', error);
      throw new Error('Error fetching reading by UUID');
    }
  }

  // Método para atualizar uma leitura com o valor confirmado
  public async updateReading(measure_uuid: string, confirmed_value: number): Promise<void> {
    try {
      await Reading.updateOne(
        { measure_uuid },
        {
          $set: {
            value: confirmed_value,
            confirmed: true,
          },
        }
      ).then();
    } catch (error) {
      console.error('Error updating reading:', error);
      throw new Error('Error updating reading');
    }
  }
}
