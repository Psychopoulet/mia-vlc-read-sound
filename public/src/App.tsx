// deps

    // externals
    import React from "react";
    import { Alert, Modal, ModalBody } from "react-bootstrap-fontawesome";

    // locals
    import getSDK from "./sdk";

// types & interfaces

    // externals
    import type { iPropsNode } from "react-bootstrap-fontawesome";

    // locals
    import type { SDK } from "./sdk";
    import type { components } from "./Descriptor";

    interface iState {
        "connected": boolean;
        "error": components["schemas"]["PushEventPluginError"]["data"] | null;
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

        // state

        this.state = {
            "connected": false,
            "error": null
        };

    }

    public componentDidMount (): void {

        this._sdk
            .on("connected", this._onConnected)
            .on("disconnected", this._onDisconnected)
            .on("error", this._onError);

        this._sdk.connect();

    }

    public componentWillUnmount (): void {

        this._sdk
            .off("connected", this._onConnected)
            .off("disconnected", this._onDisconnected)
            .off("error", this._onError);

        this._sdk.disconnect();

    }

    // handlers

    private readonly _onConnected = (): void => {

        this.setState({
            "connected": true
        });

    };

    private readonly _onDisconnected = (): void => {

        this.setState({
            "connected": false
        });

    };

    private readonly _onError = (err: components["schemas"]["PushEventPluginError"]["data"] | null): void => {

        this.setState({
            "error": err
        });

    };

    // interface handlers

    private readonly _handleCloseError = (): void => {

        this.setState({
            "error": null
        });

    };

    // render

    public render (): React.JSX.Element {

        if (!this.state.connected) {

            return <div className="container">
                <Alert variant="warning">Not connected yet...</Alert>
            </div>;

        }
        else {

            return <div className="container-fluid">

                { this.state.error && <Modal appId="{{plugin.name}}-app" title="Error" variant="danger" centered size="sm" onClose={ this._handleCloseError }>
                    <ModalBody>
                        { this.state.error.message || "An error occurred" }
                    </ModalBody>
                </Modal> }

                <span>Hello World !</span>

            </div>;

        }

    }

}
