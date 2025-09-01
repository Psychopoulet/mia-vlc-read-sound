// deps

    // externals
    import { Mediator } from "node-pluginsmanager-plugin";

// types & interfaces

    // externals
    import type ContainerPattern from "node-containerpattern";

// module

export default class MediatorVLCReadSound extends Mediator {

    protected _initWorkSpace (container: ContainerPattern): Promise<void> {
        return Promise.resolve();
    }

    protected _releaseWorkSpace  (container: ContainerPattern): Promise<void> {
        return Promise.resolve();
    }

}
