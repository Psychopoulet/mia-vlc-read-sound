"use strict";
// deps
Object.defineProperty(exports, "__esModule", { value: true });
// natives
const node_path_1 = require("node:path");
// externals
const node_pluginsmanager_plugin_1 = require("node-pluginsmanager-plugin");
// module
class OrchestratorVLCReadSound extends node_pluginsmanager_plugin_1.Orchestrator {
    constructor(data) {
        super({
            ...data,
            "packageFile": (0, node_path_1.join)(__dirname, "..", "..", "package.json"),
            "descriptorFile": (0, node_path_1.join)(__dirname, "..", "data", "Descriptor.json"),
            "mediatorFile": (0, node_path_1.join)(__dirname, "Mediator.js"),
            "serverFile": (0, node_path_1.join)(__dirname, "Server.js")
        });
    }
    _initWorkSpace(container) {
        container.set("sound-reader", (path) => {
            return this.readSound(path);
        });
        return Promise.resolve();
    }
    readSound(path) {
        return this._Mediator.checkParameters("readSound", {}, {
            "sound": path
        }).then(() => {
            return this._Mediator.readSound({}, {
                "sound": path
            });
        });
    }
}
exports.default = OrchestratorVLCReadSound;
