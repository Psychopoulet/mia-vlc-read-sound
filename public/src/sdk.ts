

// deps

    // natives
    import { EventEmitter } from "events";

// types & interfaces

    // locals
    // import type { components, operations, paths } from "./descriptor";

// component

export class SDK extends EventEmitter<{
    "connected": [];
    "disconnected": [ number, string ];
    "error": [ Error ];
}> {

    public constructor () {

        super();

        const socket = new WebSocket(
            ("https:" === window.location.protocol ? "wss:" : "ws:")
            + "//" + window.location.host
        );

        socket.addEventListener("error", (err: Event): void => {
            // eslint-disable-next-line no-console -- template: surface socket errors during development
            console.error("socket error", err);
        });

        socket.addEventListener("open", (): void => {
            this.emit("connected");
        });

        socket.addEventListener("close", (data: CloseEvent): void => {
            this.emit("disconnected", data.code, data.reason);
        });

        socket.addEventListener("error", (evt: Event): void => {
            const message = evt instanceof ErrorEvent ? evt.message : "Socket error";
            this.emit("error", new Error(message));
        });

        socket.addEventListener("message", (): void => {

            /*
            const parsedMessage: <types> = JSON.parse(_event.data);

            if (<plugin name> === parsedMessage.plugin) {

                switch (parsedMessage.command) {
                    <cases>
                }

            }
            */

        });

    }

}

let _sdk: SDK | null = null;

export default function getSDK (): SDK {

    _sdk ??= new SDK();

    return _sdk;

}
