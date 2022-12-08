import {
  IPluginConfig,
  ServiceCallable,
  ServicesBase,
  ServicesClient,
} from "@bettercorp/service-base";

export class virtualClient extends ServicesClient<
  ServiceCallable,
  ServiceCallable,
  ServiceCallable,
  ServiceCallable,
  ServiceCallable,
  IPluginConfig
> {
  constructor(self: ServicesBase<any, any, any>, pluginName: string) {
    super(self);
    this._pluginName = pluginName;
  }
  public override _pluginName: string;

  async onMessageEvent(
    eventName: string,
    handler: { (params: Array<any>): Promise<void> }
  ) {
    await (this._plugin as any).onEvent(
      eventName,
      async (...params: Array<any>) => await handler(params)
    );
  }
}
