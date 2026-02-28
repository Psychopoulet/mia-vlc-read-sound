import { Orchestrator } from "node-pluginsmanager-plugin";
import type { iOrchestratorOptions } from "node-pluginsmanager-plugin";
import type ContainerPattern from "node-containerpattern";
export default class OrchestratorVLCReadSound extends Orchestrator {
    constructor(data: iOrchestratorOptions);
    protected _initWorkSpace(container: ContainerPattern): Promise<void>;
    readSound(path: string): Promise<void>;
}
