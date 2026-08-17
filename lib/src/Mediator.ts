// deps

    // natives
    import { readFile } from "node:fs/promises";
    import { join } from "node:path";

    // externals
    import { Mediator, type iEventsMinimal, type iDescriptorUserOptions } from "node-pluginsmanager-plugin";

    // locals
    import VLC, { type iVLCOptions } from "./utils/VLC";

// types & interfaces

    // externals
    import type ContainerPattern from "node-containerpattern";

    // locals
    import type { operations, components } from "./Descriptor";

// module

export default class MediatorVLCReadSound extends Mediator<iEventsMinimal & {
    "initialized": [ ContainerPattern ];
    "released": [ ContainerPattern ];
    "error": [ components["schemas"]["PushEventPluginError"]["data"] ];
}> {

    // attributes

        private _vlc: VLC | null;

    // constructor

    public constructor (data: iDescriptorUserOptions) {

        super(data);

        this._vlc = null;

    }

    protected _initWorkSpace (container: ContainerPattern): Promise<void> {

        if (container.has("vlc")) {

            this._vlc = container.get<VLC>("vlc");

        }
        else {

            const options: iVLCOptions = container.has("vlc-options")
                ? container.get<iVLCOptions>("vlc-options")
                : {};

            if (container.has("log")) {

                options.debug = (message: string): void => {
                    container.get<{ "debug": (log: string) => void }>("log").debug(message);
                };

            }

            this._vlc = new VLC(options);

        }

        return this._vlc.isAvailable().then((available: boolean): void => {

            if (!available) {
                throw new Error("VLC is not available");
            }

        });

    }

    protected _releaseWorkSpace (): Promise<void> {

        this._vlc = null;

        return Promise.resolve();

    }

    // front files

    public getFrontIndex (): Promise<operations["getFrontIndex"]["responses"]["200"]["content"]["text/html"]> {

        return readFile(join(__dirname, "..", "..", "public", "index.html"), "utf-8").then((content: string): string => {

            return content

                .replace(/{{plugin.name}}/g, this.getPluginName())
                .replace(/{{plugin.version}}/g, this.getPluginVersion())
                .replace(/{{plugin.description}}/g, this.getPluginDescription());

        });

    }

    public getFrontApp (): Promise<operations["getFrontApp"]["responses"]["200"]["content"]["application/javascript"]> {

        return readFile(join(__dirname, "..", "..", "public", "dist", "bundle.min.js"), "utf-8").then((content: string): string => {

            return content

                .replace(/{{plugin.name}}/g, this.getPluginName())
                .replace(/{{plugin.version}}/g, this.getPluginVersion())
                .replace(/{{plugin.description}}/g, this.getPluginDescription());

        });

    }

    public getFrontAppMap (): Promise<string> { // tricks return to avoid costful parsing
        return readFile(join(__dirname, "..", "..", "public", "dist", "bundle.min.js.map"), "utf-8");
    }

    // api

    public readSound (urlParameters: operations["readSound"]["parameters"], bodyParameters: operations["readSound"]["requestBody"]["content"]["application/json"]): Promise<void> {

        if (!this._vlc) {
            return Promise.reject(new Error("VLC is not initialized"));
        }

        return this._vlc.play(bodyParameters.sound);

    }

}
