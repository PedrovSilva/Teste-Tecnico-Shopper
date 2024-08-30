import mongoose from "mongoose";
import Grid  from "gridfs-stream";

// Configura o GridFS
let gfs: any;
mongoose.connection.once("open", () => {
  gfs = Grid(mongoose.connection.db, mongoose.mongo);
  gfs.collection("images"); // Nome da coleção onde as imagens serão armazenadas
});

// Define o schema para a leitura
const readingSchema = new mongoose.Schema(
  {
    measure_uuid: {
      type: String,
      required: true,
      unique: true, // Garante que cada UUID seja único
    },
    customer_code: {
      type: String,
      required: true,
    },
    measure_datetime: {
      type: Date,
      required: true,
    },
    measure_type: {
      type: String,
      required: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed, // Permite qualquer tipo de valor, ajuste conforme necessário
      required: true,
    },
    image_url: {
      type: mongoose.Schema.Types.ObjectId, // ID do arquivo no GridFS
    },
    confirmed: {
      type: Boolean,
      default: false, // Valor padrão para não confirmado
    },
  },
  {
    timestamps: true, // Adiciona campos de criação e atualização
    toJSON: {
      transform: (_, ret) => {
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

// Cria o modelo a partir do schema
const Reading = mongoose.model("Reading", readingSchema);

export { Reading, gfs };
