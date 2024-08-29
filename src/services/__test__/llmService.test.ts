// llmService.test.ts
import { LLMService } from './llmService';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mocks
jest.mock('@google/generative-ai/server');
jest.mock('@google/generative-ai');

describe('LLMService', () => {
  let llmService: LLMService;
  let mockFileManager: jest.Mocked<GoogleAIFileManager>;
  let mockGenerativeAI: jest.Mocked<GoogleGenerativeAI>;

  beforeEach(() => {
    mockFileManager = new GoogleAIFileManager() as jest.Mocked<GoogleAIFileManager>;
    mockGenerativeAI = new GoogleGenerativeAI() as jest.Mocked<GoogleGenerativeAI>;
    llmService = new LLMService();
    (llmService as any).fileManager = mockFileManager;
    (llmService as any).genAI = mockGenerativeAI;
  });

  it('should extract value from image correctly', async () => {
    const mockUploadResponse = {
      file: {
        mimeType: 'image/jpeg',
        uri: 'http://example.com/image.jpg',
      },
    };

    const mockGenerateContentResponse = {
      response: {
        text: jest.fn().mockReturnValue('The amount on the bill is 123.45 USD'),
      },
    };

    mockFileManager.uploadFile = jest.fn().mockResolvedValue(mockUploadResponse);
    mockGenerativeAI.getGenerativeModel = jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue(mockGenerateContentResponse),
    });

    const imageBuffer = Buffer.from('fake-image-data');
    const result = await llmService.extractValueFromImage(imageBuffer);

    expect(result).toEqual({ value: 123.45 });
  });

  it('should handle errors gracefully', async () => {
    mockFileManager.uploadFile = jest.fn().mockRejectedValue(new Error('Upload failed'));

    const imageBuffer = Buffer.from('fake-image-data');
    
    await expect(llmService.extractValueFromImage(imageBuffer)).rejects.toThrow('Upload failed');
  });
});
