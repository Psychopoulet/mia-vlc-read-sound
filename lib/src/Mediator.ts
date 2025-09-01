// deps

    // natives
    import { spawn } from "node:child_process";

    // externals
    import { Mediator } from "node-pluginsmanager-plugin";

// types & interfaces

    // natives
    import type { ChildProcess } from "node:child_process";
    import type { Readable } from "node:stream";

    // locals
    import type { operations } from "./Descriptor";

// module

export default class MediatorVLCReadSound extends Mediator {

    protected _initWorkSpace (): Promise<void> {

        return this._execute("vlc", [ "--help" ]).then((): Promise<void> => {
            return Promise.resolve();
        });

    }

    protected _releaseWorkSpace  (): Promise<void> {
        return Promise.resolve();
    }

    protected _execute (cmd: string, args: string[] = []) : Promise<string> {

        return new Promise((resolve, reject): void => {

            const child: ChildProcess = spawn(cmd, args);

            child.once("error", (err: Error): void => {
                return reject(err);
            });

            (child.stdout as Readable).on("data", (chunk: Buffer): void => {
                console.log("stdout", chunk);
            });

            (child.stderr as Readable).on("data", (chunk: Buffer): void => {
                console.log("stderr", chunk);
            });

            child.on("close", (code: number): void => {
                return code ? resolve("@WIP") : reject(new Error("@WIP"));
            });

        });

    }

    public readSound (urlParameters: operations["readSound"]["parameters"], bodyParameters: operations["readSound"]["requestBody"]["content"]["application/json"]): Promise<operations["readSound"]["responses"]["204"]["content"]["application/json"]> {

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
