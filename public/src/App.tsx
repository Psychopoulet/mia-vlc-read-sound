

// deps

    // externals
    import React from "react";
    import { Alert } from "react-bootstrap-fontawesome";

    // locals
    import getSDK from "./sdk";

// types & interfaces

    // externals
    import type { iPropsNode } from "react-bootstrap-fontawesome";

    // locals
    import type { SDK } from "./sdk";

    interface iState {
        "connected": boolean;
        "error": Error | null;
    }

// component

export default class App extends React.Component<iPropsNode, iState> {

    // name

        public static displayName: string = "App";

    // private

        private readonly _sdk: SDK = getSDK();

    // constructor

    public constructor (props: iPropsNode) {

        super(props);

        this.state = {
            "connected": false,
            "error": null
        };

    }

    public componentDidMount (): void {

        this._sdk
            .on("connected", this._onConnected.bind(this))
            .on("disconnected", this._onDisconnected.bind(this))
            .on("error", this._onError.bind(this));

    }

    public componentWillUnmount (): void {

        this._sdk
            .off("connected", this._onConnected.bind(this))
            .off("disconnected", this._onDisconnected.bind(this))
            .off("error", this._onError.bind(this));

    }

    // handlers

    private _onConnected (): void {

        this.setState({
            "connected": true
        });

    }

    private _onDisconnected (): void {

        this.setState({
            "connected": false
        });

    }

    private _onError (err: Error | null): void {

        this.setState({
            "error": err
        });

    }

    // render

    public render (): React.JSX.Element {

        if (!this.state.connected) {

            return <div className="container">
                <Alert variant="warning">Not connected yet...</Alert>
            </div>;

        }
        else if (this.state.error) {

            return <div className="container">
                <Alert variant="danger">{ this.state.error.message || "An error occurred" }</Alert>
            </div>;

        }
        else {

            return <span>Hello World !</span>;

        }

    }

}
