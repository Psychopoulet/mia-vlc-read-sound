// deps

    const { EventEmitter } = require("node:events");

// module

function createSpawnMock (options = {}) {

    const exitCode = Object.hasOwn(options, "exitCode") ? options.exitCode : 0;
    const error = Object.hasOwn(options, "error") ? options.error : null;
    const stderr = options.stderr ?? "";
    const stdout = options.stdout ?? "";

    const calls = [];

    function spawn (cmd, args, spawnOptions) {

        calls.push({
            "cmd": cmd,
            "args": args,
            "spawnOptions": spawnOptions
        });

        const child = new EventEmitter();
        child.stdout = new EventEmitter();
        child.stderr = new EventEmitter();

        process.nextTick(() => {

            if (null !== error) {
                child.emit("error", error);
                return;
            }

            if ("" !== stdout) {
                child.stdout.emit("data", Buffer.from(stdout, "utf-8"));
            }

            if ("" !== stderr) {
                child.stderr.emit("data", Buffer.from(stderr, "utf-8"));
            }

            child.emit("close", exitCode);

        });

        return child;

    }

    spawn.calls = calls;

    return spawn;

}

module.exports = {
    createSpawnMock
};
