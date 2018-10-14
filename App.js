import React from 'react';
import {Button, ImageStore, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Camera, Permissions} from "expo";

const url = 'https://us-central1-kaggle-160323.cloudfunctions.net/asl-translate-3';
const twilioURL = 'https://us-central1-kaggle-160323.cloudfunctions.net/function-1';

let currentString = "";

export default class App extends React.Component {
    state = {
        text: "",
        // imgUrl: "assets/icon.png",
    };

    async submitToModel(modelURL, imageURI, success) {
        ImageStore.getBase64ForTag(imageURI, data => {
            fetch(modelURL, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: data
                }),
            }).then(response => response.json()).then(success);
        }, reason => console.log(reason));
    }

    async sendSMS(twilioURL) {
        fetch(twilioURL, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: this.state.text
            }),
        });
    }

    isImpossibleDuplicate(c) {
        if (c !== this.state.text.slice(-1)) return false;
        else return (c !== 'L' && c !== 'P') || (this.state.text.slice(-1) === this.state.text.slice(-2, -1));
    }

    async predict(uri) {
        this.submitToModel(url, uri, response => {
            if (response[0] && response[0].payload[0])
                if (response[0].payload[0].displayName !== "Null") {
                    let character = response[0].payload[0].displayName;
                    if (!this.isImpossibleDuplicate(character)) {
                        this.setState({text: this.state.text + character})
                        currentString += character;
                    }
                }
                else {
                    if (!this.isImpossibleDuplicate(' ')) {
                        this.setState({text: this.state.text + " "});
                        Expo.Speech.speak(currentString);
                        currentString = "";
                    }
                }
        })

    }

    render() {
        return (
            <View style={styles.container}>
                <CustomCamera ref={ref => this.customCamera = ref} onSnap={img => {
                    const manipulated = Expo.ImageManipulator.manipulate(img.uri, [{
                        resize: {
                            width: 500,
                            height: 400
                        },

                    }, {
                        rotate: 90
                    }]);
                    manipulated.then((img) => {
                        // console.log("Resized " + img.uri + " to size " + img.width + " by " + img.height);
                        this.predict(img.uri);
                        // this.setState({imgUrl: img.uri});
                    });
                }}/>
                <View style={styles.bottomBox}>
                    <Text style={styles.text}>{this.state.text}</Text>
                    {/*<Image source={{uri: this.state.imgUrl}} style={{width: 300, height: 250}}/>*/}
                    <StartStopButton initAction={() => this.setState({text: ""})}
                                     startAction={() => {
                                         if (this.customCamera) this.customCamera.snap()
                                     }}/>
                    <Button title="Send SMS" style={{flex: 1}} onPress={() => {
                        this.sendSMS(twilioURL);
                    }}/>
                </View>
            </View>
        );
    }
}

class StartStopButton extends React.Component {
    state = {
        started: false,
    };
    intervalID = 0;

    render() {
        return (
            <Button title={this.state.started ? "Stop" : "Start"}
                    onPress={() => {
                        if (this.state.started) {
                            clearInterval(this.intervalID);
                            Expo.Speech.speak(currentString);
                            currentString = "";
                        }
                        if (!this.state.started) {
                            this.props.initAction();
                            this.intervalID = setInterval(this.props.startAction, 4000);
                        }
                        this.setState({started: !this.state.started})
                    }}/>
        )
    }
}

class CustomCamera extends React.Component {
    state = {
        hasCameraPermission: null,
        type: Camera.Constants.Type.back,
    };

    async componentWillMount() {
        const {status} = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({hasCameraPermission: status === 'granted'});
    }

    async snap() {
        if (this.camera) {
            let photo = this.camera.takePictureAsync({
                onPictureSaved: this.props.onSnap,
                skipProcessing: true
            });
        }
    };

    render() {
        const {hasCameraPermission} = this.state;
        if (hasCameraPermission === null) {
            return <View/>;
        } else if (hasCameraPermission === false) {
            return <Text>No access to camera</Text>;
        } else {
            return (
                <View style={{flex: 1}}>
                    <Camera style={styles.cameraView}
                            type={this.state.type}
                            ref={ref => {
                                this.camera = ref;
                            }}
                            pictureSize="2560x1440">
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: 'transparent',
                                flexDirection: 'row',
                            }}>
                            <TouchableOpacity
                                style={{
                                    flex: 0.1,
                                    alignSelf: 'flex-end',
                                    alignItems: 'center',
                                }}
                                onPress={() => {
                                    this.setState({
                                        type: this.state.type === Camera.Constants.Type.back
                                            ? Camera.Constants.Type.front
                                            : Camera.Constants.Type.back,
                                    });
                                }}>
                                <Text
                                    style={{fontSize: 18, marginBottom: 10, color: 'white'}}>
                                    {' '}Flip{' '}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Camera>
                </View>
            );
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    cameraView: {
        flex: 2,
    },

    bottomBox: {
        flex: 1,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
    },

    text: {
        flex: 2,
        fontSize: 30,

    },
});
