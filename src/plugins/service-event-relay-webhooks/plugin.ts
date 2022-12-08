import { fetch } from "undici";
import {
  IPluginLogger,
  ServiceCallable,
  ServicesBase,
} from "@bettercorp/service-base";
import { MyPluginConfig } from "./sec.config";
import { virtualClient } from "./virtualClient";
import { fastify } from "@bettercorp/service-base-plugin-web-server";

export class Service extends ServicesBase<
  ServiceCallable,
  ServiceCallable,
  ServiceCallable,
  ServiceCallable,
  ServiceCallable,
  MyPluginConfig
> {
  private virtualClient: virtualClient;
  private fastify: fastify;
  constructor(
    pluginName: string,
    cwd: string,
    pluginCwd: string,
    log: IPluginLogger
  ) {
    super(pluginName, cwd, pluginCwd, log);
    this.fastify = new fastify(this);
    this.virtualClient = new virtualClient(
      this,
      process.env.BSB_RELAY_PLUGIN_NAME || "NULL"
    );
  }
  public override async init(): Promise<void> {
    if ((await this.getPluginConfig()).apiOn) {
      const self = this;
      await this.fastify.post(
        "/whapi/:eventName/",
        async (reply, params, query, body) => {
          await self.virtualClient.emitMessageEvent(
            params.eventName,
            ...(body as Array<any>)
          );
          reply.status(202).send();
        }
      );
    }
  }
  public override async run(): Promise<void> {
    const self = this;
    for (let eventWH of (await this.getPluginConfig()).events) {
      self.log.info("Setup relay: {event} -> {url}", {
        event: eventWH.name,
        url: eventWH.webhookUrl,
      });
      await self.virtualClient.onMessageEvent(eventWH.name, async (params) => {
        self.log.info("Relay event: {event} -> {url}", {
          event: eventWH.name,
          url: eventWH.webhookUrl,
        });
        try {
          await fetch(eventWH.webhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            redirect: "follow",
            body: JSON.stringify(params),
          });
        } catch (exc) {
          self.log.error(exc as Error);
        }
      });
    }
  }
}
