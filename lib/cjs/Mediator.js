"use strict";
// deps
Object.defineProperty(exports, "__esModule", { value: true });
// natives
const node_child_process_1 = require("node:child_process");
// externals
const node_pluginsmanager_plugin_1 = require("node-pluginsmanager-plugin");
// module
class MediatorVLCReadSound extends node_pluginsmanager_plugin_1.Mediator {
    _container;
    constructor(data) {
        super(data);
        this._container = null;
    }
    _initWorkSpace(container) {
        this._container = container;
        return this._execute("vlc", ["--help"]).then(() => {
            return Promise.resolve();
        });
    }
    _releaseWorkSpace() {
        return Promise.resolve();
    }
    _execute(cmd, args = []) {
        return new Promise((resolve, reject) => {
            this._container.get("log").debug(cmd + " " + args.join(" "));
            let exited = false;
            const child = (0, node_child_process_1.spawn)(cmd, args);
            child.once("error", (err) => {
                if (!exited) {
                    exited = true;
                    return reject(err);
                }
            });
            let stdout = "";
            let stderr = "";
            child.stdout.on("data", (chunk) => {
                stdout += chunk.toString("utf-8");
            });
            child.stderr.on("data", (chunk) => {
                stderr += chunk.toString("utf-8");
            });
            child.on("close", (code) => {
                if (!exited) {
                    exited = true;
                    return code ? reject(new Error(stderr)) : resolve(stdout);
                }
            });
        });
    }
    // public readSound (urlParameters: operations["readSound"]["parameters"], bodyParameters: operations["readSound"]["requestBody"]["content"]["application/json"]): Promise<operations["readSound"]["responses"]["204"]["content"]["application/json"]> {
    readSound(urlParameters, bodyParameters) {
        return this._execute("vlc", [
            "--intf",
            "dummy",
            bodyParameters.sound,
            "vlc://quit"
        ]).then(() => {
            return Promise.resolve();
        });
    }
}
exports.default = MediatorVLCReadSound;
