import 'module-alias/register';

import * as path from 'path';
import * as express from 'express';
import * as swaggerUi from 'swagger-ui-express';
import * as YAML from 'yamljs';

// Carregar o arquivo swagger.yaml
const swaggerDocument = YAML.load(path.resolve(__dirname, '../../docs/swagger.yaml'));

export function setupSwagger(app: express.Application): void {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
