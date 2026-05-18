// deps

    // natives
    import { EventEmitter } from "events";

// types & interfaces

    // natives
    type Timeout = ReturnType<typeof setTimeout>;

// component

export class SDK extends EventEmitter<{
    "connected": [];
    "disconnected": [ number, string ];
    "error": [ Error ];
}> {

    // protected

        protected _socket: WebSocket | null;
        protected _reconnectTimeout: Timeout | null;

    // constructor

    public constructor () {

        super();

        this._socket = null;
        this._reconnectTimeout = null;

    }

    // public methods

    public connect (): void {

        if (WebSocket.OPEN === this._socket?.readyState) {
            return;
        }

        if (this._reconnectTimeout) {
            return;
        }

        this._socket = new WebSocket(
            ("https:" === window.location.protocol ? "wss:" : "ws:")
            + "//" + window.location.host
        );

        this._socket.onopen = (): void => {
            this.emit("connected");
        };

        this._socket.onclose = (event: CloseEvent): void => {

            this.emit("disconnected", event.code, event.reason);

            // normal closure
            if (1000 === event.code) {
                return;
            }

            this._reconnectTimeout = setTimeout((): void => {
                this._reconnectTimeout = null;
                return this.connect();
            }, 1000);

        };

        this._socket.onerror = (evt: Event): void => {

            // avoid catching error on reconnection
            if (evt instanceof ErrorEvent) {
                this.emit("error", new Error(evt.message));
            }

        };

    }

    public disconnect (): void {

        if (this._reconnectTimeout) {
            clearTimeout(this._reconnectTimeout);
            this._reconnectTimeout = null;
        }

        if (this._socket
            && (
                WebSocket.CONNECTING === this._socket.readyState
                || WebSocket.OPEN === this._socket.readyState
            )
        ) {
            this._socket.close(1000, "Normal closure");
        }

        this._socket = null;

    }

}

let _sdk: SDK | null = null;

export default function getSDK (): SDK {

    _sdk ??= new SDK();

    return _sdk;

}
