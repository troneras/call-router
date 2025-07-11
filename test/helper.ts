import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import { build as buildApplication } from 'fastify-cli/helper.js'
import serviceApp from "../src/app.js";
import type { Config } from "../src/plugins/external/env.js";
import envPlugin from "../src/plugins/external/env.js";
import { options as serverOptions } from "../src/app.js";
import path from "path";

const AppPath = path.join(import.meta.dirname, '../src/app.ts')
// Fill in this config with all the configurations
// needed for testing the application
export function config() {
  return {
    skipOverride: true // Register our application with fastify-plugin
  }
}

export async function build(opts = {}, configOverrides: Partial<Config> = {}): Promise<FastifyInstance> {

  // you can set all the options supported by the fastify CLI command
  const argv = [AppPath]
  process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://dev:dev123@localhost:5432/call_router_dev';


  const app = (await buildApplication(
    argv,
    config(),
    serverOptions
  )) as FastifyInstance
  // Set test environment variables - still needed for compatibility

  await app.ready()



  return app;
}

// Alternative build function that creates mock plugins for isolated testing
export async function buildWithMocks(opts = {}, configOverrides: Partial<Config> = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: false,
    ...opts
  });

  // Set environment variables instead of decorating config
  // This way the env plugin can handle the config decoration
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://mock:mock@localhost:5432/mock_db';
  process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

  // Apply config overrides to process.env
  if (configOverrides.DATABASE_URL) process.env.DATABASE_URL = configOverrides.DATABASE_URL;
  if (configOverrides.REDIS_URL) process.env.REDIS_URL = configOverrides.REDIS_URL;
  if (configOverrides.REDIS_HOST) process.env.REDIS_HOST = configOverrides.REDIS_HOST;
  if (configOverrides.REDIS_PORT) process.env.REDIS_PORT = configOverrides.REDIS_PORT;
  if (configOverrides.REDIS_DB) process.env.REDIS_DB = configOverrides.REDIS_DB;
  if (configOverrides.PORT) process.env.PORT = configOverrides.PORT;
  if (configOverrides.LOG_LEVEL) process.env.LOG_LEVEL = configOverrides.LOG_LEVEL;
  if (configOverrides.FASTIFY_CLOSE_GRACE_DELAY) process.env.FASTIFY_CLOSE_GRACE_DELAY = configOverrides.FASTIFY_CLOSE_GRACE_DELAY;

  // // Mock Redis plugin
  // app.decorate('redis', {
  //   connect: async () => {},
  //   quit: async () => "OK",
  //   status: "ready",
  //   isCluster: false,
  //   on: () => {},
  //   stream: {},
  //   condition: {},
  // });

  // // Mock Queue plugin
  // app.decorate('queue', {
  //   webhookQueue: {
  //     add: async (name: string, data: any, opts?: any) => ({ 
  //       id: 'mock-job-id', 
  //       data: data,
  //       opts: opts || {} 
  //     }),
  //     getWaiting: async () => [],
  //     getActive: async () => [],
  //     getCompleted: async () => [],
  //     close: async () => {},
  //     name: 'webhook-processing',
  //     opts: {
  //       defaultJobOptions: {
  //         removeOnComplete: 100,
  //         removeOnFail: 50,
  //       }
  //     }
  //   }
  // });

  // // Mock Database plugin
  // app.decorate('db', {
  //   insert: () => ({ values: async () => ({}) }),
  //   select: () => ({ from: () => ({ limit: async () => [] }) }),
  //   update: () => ({ set: () => ({ where: async () => ({}) }) }),
  //   delete: () => ({ where: async () => ({}) }),
  // });

  // Register the full serviceApp which now handles config decoration properly
  await app.register(serviceApp, { skipOverride: true });

  return app;
}

export default build;

