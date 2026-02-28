import { Mediator } from "node-pluginsmanager-plugin";
import type ContainerPattern from "node-containerpattern";
import type { iDescriptorUserOptions } from "node-pluginsmanager-plugin";
import type { operations } from "./Descriptor";
export default class MediatorVLCReadSound extends Mediator {
    private _container;
    constructor(data: iDescriptorUserOptions);
    protected _initWorkSpace(container: ContainerPattern): Promise<void>;
    protected _releaseWorkSpace(): Promise<void>;
    protected _execute(cmd: string, args?: string[]): Promise<string>;
    readSound(urlParameters: operations["readSound"]["parameters"], bodyParameters: operations["readSound"]["requestBody"]["content"]["application/json"]): Promise<void>;
}
