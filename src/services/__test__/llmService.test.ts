// llmService.test.ts
import { LLMService } from '@src/services/llmService';
import { FileState, GoogleAIFileManager } from '@google/generative-ai/server';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

// Mocks
jest.mock('@google/generative-ai/server', () => {
  return {
    GoogleAIFileManager: jest.fn().mockImplementation(() => ({
      uploadFile: jest.fn(),
    })),
  };
});

jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn(),
    })),
  };
});

describe('LLMService', () => {
  let llmService: LLMService;
  let mockFileManager: jest.Mocked<GoogleAIFileManager>;
  let mockGenerativeAI: jest.Mocked<GoogleGenerativeAI>;

  beforeEach(() => {
    mockFileManager = new GoogleAIFileManager('dummyApiKey') as jest.Mocked<GoogleAIFileManager>;
    mockGenerativeAI = new GoogleGenerativeAI('dummyApiKey') as jest.Mocked<GoogleGenerativeAI>;
    
    llmService = new LLMService();
    (llmService as any).fileManager = mockFileManager;
    (llmService as any).genAI = mockGenerativeAI;
  });

  it('should extract value from image correctly', async () => {
    // Ajustado para corresponder à interface esperada
    const mockUploadResponse = {
      file: {
        mimeType: 'image/jpeg',
        uri: 'http://example.com/image.jpg',
        name: 'image.jpg',
        sizeBytes: '12345', // Ajuste para string
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
        expirationTime: new Date().toISOString(),
        sha256Hash: 'fakehash',
        state: 'active' as FileState // Ajuste para valor válido de FileState
      },
    };

    const mockGenerateContentResponse = {
      response: {
        text: jest.fn().mockReturnValue('The amount on the bill is 123.45 USD'),
      },
    };

    // Ajuste para corresponder à interface esperada
    const mockGenerativeModel: Partial<GenerativeModel> = {
      generateContent: jest.fn().mockResolvedValue(mockGenerateContentResponse),
    };

    mockFileManager.uploadFile.mockResolvedValue(mockUploadResponse);
    mockGenerativeAI.getGenerativeModel.mockReturnValue(mockGenerativeModel as GenerativeModel);

    const imageBuffer = Buffer.from('fake-image-data');
    const result = await llmService.extractValueFromImage(imageBuffer);

    expect(result).toEqual({ value: 123.45 });
  });

  it('should handle errors gracefully', async () => {
    mockFileManager.uploadFile.mockRejectedValue(new Error('Upload failed'));

    const imageBuffer = Buffer.from('fake-image-data');
    
    await expect(llmService.extractValueFromImage(imageBuffer)).rejects.toThrow('Upload failed');
  });
});
