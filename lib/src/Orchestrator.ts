// deps

    // natives
    import { join } from "node:path";

    // externals
    import { Orchestrator } from "node-pluginsmanager-plugin";

// types & interfaces

    // externals
    import type { iOrchestratorOptions } from "node-pluginsmanager-plugin";
    import type ContainerPattern from "node-containerpattern";

    // locals
    import type MediatorVLCReadSound from "./Mediator";

// module

export default class OrchestratorVLCReadSound extends Orchestrator {

    public constructor (data: iOrchestratorOptions) {

        super({
            ...data,
            "packageFile": join(__dirname, "..", "..", "package.json"),
            "descriptorFile": join(__dirname, "..", "data", "Descriptor.json"),
            "mediatorFile": join(__dirname, "Mediator.js"),
            "serverFile": join(__dirname, "Server.js")
        });

    }

    protected _initWorkSpace (container: ContainerPattern): Promise<void> {

        container.set("sound-reader", (path: string): Promise<void> => {
            return this.readSound(path);
        });

        return Promise.resolve();

    }

    public readSound (path: string): Promise<void> {

        return (this._Mediator as MediatorVLCReadSound).checkParameters("readSound", {}, {
            "sound": path
        }).then((): Promise<void> => {

            return (this._Mediator as MediatorVLCReadSound).readSound({}, {
                "sound": path
            });

        });

    }

}
