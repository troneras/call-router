import Fastify from "fastify";
import fp from "fastify-plugin";
import closeWithGrace from "close-with-grace";
import serviceApp from "./app";
import { loadConfig } from "./lib/config";

function getLoggerOptions(logLevel: string) {
  if (process.stdout.isTTY) {
    return {
      level: "info",
      transport: {
        target: "pino-pretty",
        options: {
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname",
        },
      },
    };
  }

  return { level: logLevel };
}

async function init() {
  const config = await loadConfig();
  
  const app = Fastify({
    logger: getLoggerOptions(config.LOG_LEVEL || "info"),
    ajv: {
      customOptions: {
        coerceTypes: "array",
        removeAdditional: "all",
      },
    },
  });

  app.register(fp(serviceApp));

  closeWithGrace(
    { delay: Number(config.FASTIFY_CLOSE_GRACE_DELAY) || 500 },
    async ({ err }) => {
      if (err != null) {
        app.log.error(err);
      }
      await app.close();
    }
  );

  await app.ready();

  try {
    await app.listen({
      port: Number(config.PORT) || 3000,
      host: '0.0.0.0'
    });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

init();