// deps

    // externals
    import React from "react";
    import {
        Card, CardHeader, CardBody, CardFooter,
        InputText, Button, Alert,
        generateFocus
    } from "react-bootstrap-fontawesome";

    // locals
    import getSDK from "../SDK";

// types & interfaces

    // externals
    import type { iPropsNode, iGenerateFocusCallback } from "react-bootstrap-fontawesome";

    // locals
    import type { SDK } from "../SDK";

    interface iProps extends iPropsNode {
        "onError": (err: Error) => void;
    }

    interface iState {
        "running": boolean;
        "sound": string;
        "success": string | null;
    }

// component

export default class SoundPlayer extends React.Component<iProps, iState> {

    // name

        public static displayName: string = "SoundPlayer";

    // private

        private readonly _sdk: SDK = getSDK();
        private readonly _focus: iGenerateFocusCallback<HTMLInputElement>;

    // constructor

    public constructor (props: iProps) {

        super(props);

        this._focus = generateFocus();

        this.state = {
            "running": false,
            "sound": "",
            "success": null
        };

    }

    public componentDidMount (): void {

        this._focus.setFocus();

    }

    // interface handlers

    private readonly _handleChangeSound = (e: React.ChangeEvent<HTMLInputElement>, value: string): void => {

        e.preventDefault();
        e.stopPropagation();

        this.setState({
            "sound": value,
            "success": null
        });

    };

    private readonly _handlePlay = (e: React.MouseEvent<HTMLButtonElement> | React.FormEvent<HTMLFormElement>): void => {

        e.preventDefault();
        e.stopPropagation();

        if (this.state.running || 0 >= this.state.sound.length) {
            return;
        }

        this.setState({
            "running": true,
            "success": null
        });

        this._sdk.readSound({
            "sound": this.state.sound
        }).then((): void => {

            this.setState({
                "running": false,
                "success": "Playback finished."
            });

            setTimeout((): void => {
                this._focus.setFocus();
            }, 200);

        }).catch((err: Error): void => {

            this.setState({
                "running": false
            });

            this.props.onError(err);

        });

    };

    // render

    public render (): React.JSX.Element {

        return <Card onSubmit={ this._handlePlay }>

            <CardHeader>Play a sound</CardHeader>

            <CardBody>

                { null !== this.state.success && <Alert variant="success">{ this.state.success }</Alert> }

                <InputText _ref={ this._focus.ref }
                    placeholder="Local path or URL (file://, http://, …)"
                    value={ this.state.sound } onChange={ this._handleChangeSound }
                    disabled={ this.state.running }
                />

            </CardBody>

            <CardFooter>

                <Button type="submit"
                    icon="volume-up" variant="primary" block
                    disabled={ this.state.running || 0 >= this.state.sound.length }
                >
                    { this.state.running ? "Playing…" : "Play sound" }
                </Button>

            </CardFooter>

        </Card>;

    }

}
