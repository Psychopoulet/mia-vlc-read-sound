// deps

    // natives
    import { spawn } from "node:child_process";
    import { readFile } from "node:fs/promises";
    import { join } from "node:path";

    // externals
    import { Mediator } from "node-pluginsmanager-plugin";

// types & interfaces

    // natives
    import type { ChildProcess } from "node:child_process";
    import type { Readable } from "node:stream";

    // externals
    import type ContainerPattern from "node-containerpattern";
    import type { iEventsMinimal, iDescriptorUserOptions } from "node-pluginsmanager-plugin";

    // locals
    import type { operations, components } from "./Descriptor";

// module

export default class MediatorVLCReadSound extends Mediator<iEventsMinimal & {
    "initialized": [ ContainerPattern ];
    "released": [ ContainerPattern ];
    "error": [ components["schemas"]["PushEventPluginError"]["data"] ];
}> {

    private _container: ContainerPattern | null;

    public constructor (data: iDescriptorUserOptions) {

        super(data);

        this._container = null;

    }

    protected _initWorkSpace (container: ContainerPattern): Promise<void> {

        this._container = container;

        return this._execute("vlc", [ "--help" ]).then((): Promise<void> => {
            return Promise.resolve();
        });

    }

    protected _releaseWorkSpace (): Promise<void> {
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

    protected _execute (cmd: string, args: string[] = []) : Promise<string> {

        return new Promise((resolve, reject): void => {

            (this._container as ContainerPattern).get<{ "debug": (log: string) => void }>("log").debug(cmd + " " + args.join(" "));

            let exited: boolean = false;

            const child: ChildProcess = spawn(cmd, args);

            child.once("error", (err: Error): void => {

                if (!exited) {

                    exited = true;

                    reject(err);

                }

            });

            let stdout: string = "";
            let stderr: string = "";

            (child.stdout as Readable).on("data", (chunk: Buffer): void => {
                stdout += chunk.toString("utf-8");
            });

            (child.stderr as Readable).on("data", (chunk: Buffer): void => {
                stderr += chunk.toString("utf-8");
            });

            child.on("close", (code: number): void => {

                if (!exited) {

                    exited = true;

                    if (code) {
                        reject(new Error(stderr));
                    }
                    else {
                        resolve(stdout);
                    }

                }

            });

        });

    }

    // public readSound (urlParameters: operations["readSound"]["parameters"], bodyParameters: operations["readSound"]["requestBody"]["content"]["application/json"]): Promise<operations["readSound"]["responses"]["204"]["content"]["application/json"]> {
    public readSound (urlParameters: operations["readSound"]["parameters"], bodyParameters: operations["readSound"]["requestBody"]["content"]["application/json"]): Promise<void> {

        return this._execute("vlc", [
            "--intf",
            "dummy",
            bodyParameters.sound,
            "vlc://quit"
        ]).then((): Promise<void> => {
            return Promise.resolve();
        });

    }

}
