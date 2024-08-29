import mongoose from "mongoose";
import { Reading, gfs } from "@src/models/reading";
import { DatabaseService } from "../databaseService";

// Mock do modelo Reading
jest.mock("@src/models/reading", () => {
  const mockFind = jest.fn().mockReturnValue({
    then: jest
      .fn()
      .mockResolvedValue([{ customer_code: "code1", measure_type: "type1" }]), // Mock dos resultados
  });

  const mockFindOne = jest.fn().mockReturnValue({
    then: jest.fn().mockResolvedValue({ measure_uuid: "uuid1", value: 100 }), // Mock dos resultados
  });

  const mockUpdateOne = jest.fn().mockReturnValue({
    then: jest.fn().mockResolvedValue({ nModified: 1 }), // Mock do resultado
  });

  return {
    Reading: {
      find: mockFind,
      findOne: mockFindOne,
      updateOne: mockUpdateOne,
      prototype: {
        save: jest.fn().mockResolvedValue(undefined),
      },
    },
    gfs: {
      createWriteStream: jest.fn().mockReturnValue({
        end: jest.fn(),
        on: jest.fn().mockImplementation((event, callback) => {
          if (event === "finish") {
            callback();
          }
        }),
        id: "mockFileId",
      }),
    },
  };
});

describe("DatabaseService", () => {
  let service: DatabaseService;

  beforeEach(() => {
    service = new DatabaseService();
  });

  describe("getMeasuresByCustomerCode", () => {
    it("should fetch measures by customer code and type", async () => {
      const measures = await service.getMeasuresByCustomerCode(
        "code1",
        "type1"
      );
      expect(measures).toEqual([
        { customer_code: "code1", measure_type: "type1" },
      ]);
    });

    it("should fetch measures by customer code only", async () => {
      const measures = await service.getMeasuresByCustomerCode("code1");
      expect(measures).toEqual([
        { customer_code: "code1", measure_type: "type1" },
      ]);
    });
  });

  describe("getReadingByCustomerAndType", () => {
    it("should fetch reading by customer code, type, and month", async () => {
      const reading = await service.getReadingByCustomerAndType(
        "code1",
        "type1",
        "2024-08"
      );
      expect(reading).toEqual({ measure_uuid: "uuid1", value: 100 });
    });
  });

  describe("saveReading", () => {
    it("should save a new reading", async () => {
      const readingData = {
        measure_uuid: "uuid1",
        customer_code: "code1",
        measure_datetime: "2024-08-01T00:00:00Z",
        measure_type: "type1",
        value: 100,
        image_url: "",
        confirmed: false,
      };

      await service.saveReading(readingData);

      expect(Reading.prototype.save).toHaveBeenCalled();
    });
  });

  describe("saveImage", () => {
    it("should save an image and update the reading with the image ID", async () => {
      const imageData = Buffer.from("image data");
      const measure_uuid = "uuid1";

      await service.saveImage(imageData, measure_uuid);

      expect(gfs.createWriteStream).toHaveBeenCalled();
      expect(Reading.updateOne).toHaveBeenCalledWith(
        { measure_uuid },
        { image_url: "mockFileId" }
      );
    });
  });

  describe("getReadingByUuid", () => {
    it("should fetch a reading by UUID", async () => {
      const reading = await service.getReadingByUuid("uuid1");
      expect(reading).toEqual({ measure_uuid: "uuid1", value: 100 });
    });
  });

  describe("updateReading", () => {
    it("should update a reading with the confirmed value", async () => {
      await service.updateReading("uuid1", 150);
      expect(Reading.updateOne).toHaveBeenCalledWith(
        { measure_uuid: "uuid1" },
        {
          $set: {
            value: 150,
            confirmed: true,
          },
        }
      );
    });
  });
});
