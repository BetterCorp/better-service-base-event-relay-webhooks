import { SecConfig } from "@bettercorp/service-base";

export interface PluginEvent {
  name: string; // Event Name: The event to listen too
  webhookUrl: string; // Webhook URL: The URL to POST to on event
}

export interface MyPluginConfig {
  events: Array<PluginEvent>; // Events
  apiOn: boolean; // API Available
}

export class Config extends SecConfig<MyPluginConfig> {
  migrate(
    mappedPluginName: string,
    existingConfig: MyPluginConfig
  ): MyPluginConfig {
    return {
      events: existingConfig.events !== undefined ? existingConfig.events : [],
      apiOn: existingConfig.apiOn !== undefined ? existingConfig.apiOn : false,
    };
  }
}
