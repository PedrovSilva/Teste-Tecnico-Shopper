// llmService.ts
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { API_KEY } from './config'; // Ensure you have your API key in a config file or environment variable

export class LLMService {
  private fileManager: GoogleAIFileManager;
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.fileManager = new GoogleAIFileManager(API_KEY);
    this.genAI = new GoogleGenerativeAI(API_KEY);
  }

  // Method to upload image and get content from it
  public async extractValueFromImage(imageData: Buffer): Promise<{ value: number }> {
    try {
      // Upload the file
      const uploadResponse = await this.fileManager.uploadFile("image.jpg", {
        mimeType: "image/jpeg",
        displayName: "Uploaded Image",
      });

      // Use the file URI from the upload response to generate content
      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
      });

      const result = await model.generateContent([
        {
          fileData: {
            mimeType: uploadResponse.file.mimeType,
            fileUri: uploadResponse.file.uri
          }
        },
        { text: "Describe how this product might be manufactured." },
      ]);

      // Assuming the result contains the value in some format
      const content = result.response.text();
      const value = this.parseValueFromContent(content); // Implement this method based on your needs

      return { value };
    } catch (error) {
      console.error("Error extracting value from image:", error);
      throw error;
    }
  }

  // Method to parse the value from the generated content
  private parseValueFromContent(content: string): number {
    // Implement logic to parse the value from the content
    // For example, extract a number from the text
    const match = content.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[0]) : 0;
  }
}
