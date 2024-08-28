import { Server } from "@overnightjs/core";
import "./util/module-alias";
import bodyParser from "body-parser";
import { UploadImageController } from "./controllers/uploadImage";
import { ListMeasuresController } from "./controllers/listMeasures";
import { ConfirmMeasureController } from "./controllers/confirmMeasure";
import { Application } from "express";

export class SetupServer extends Server {
  constructor(private port = 3000) {
    super();
  }

  public init(): void {
    this.setupExpress();
    this.setupController();
  }

  public getApp(): Application {
    return this.app;
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json());
  }
  private setupController(): void {
    const uploadImageController = new UploadImageController();
    const listMeasuresController = new ListMeasuresController();
    const confirmMeasuresController = new ConfirmMeasureController();

    this.addControllers([
      listMeasuresController,
      uploadImageController,
      confirmMeasuresController,
    ]);
  }
}
