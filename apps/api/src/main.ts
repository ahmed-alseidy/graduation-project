import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  const config = new DocumentBuilder()
    .setTitle("Graduation Project API")
    .setDescription("Graduation Project API Description")
    .addBearerAuth()
    .setVersion("1.0")
    .addTag("api")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("/api", app, document);

  app.enableCors();
  app.setGlobalPrefix("api");

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
