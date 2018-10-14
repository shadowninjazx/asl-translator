import React from 'react';
import {Button, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Camera, Permissions} from "expo";

const url = 'https://us-central1-kaggle-160323.cloudfunctions.net/asl-translate-1';

export default class App extends React.Component {
    state = {
        text: "HELLO WORLD",
        imgUrl: "assets/icon.png",
    };

    render() {
        return (
            <View style={styles.container}>
                <CustomCamera ref={ref => this.customCamera = ref} onSnap={img => {
                    const manipulated = Expo.ImageManipulator.manipulate(img.uri, [{
                        resize: {
                            width: 400,
                            height: 400
                        },
                        // rotate: 90
                    }]);
                    manipulated.then((img) => {
                        console.log("Resized " + img.uri + " to size " + img.width + " by " + img.height);

                        // ImageStore.getBase64ForTag(img.uri, data => {
                        //     fetch(url, {
                        //         method: 'POST',
                        //         headers: {
                        //             Accept: 'application/json',
                        //             'Content-Type': 'application/json',
                        //         },
                        //         body: JSON.stringify({
                        //             payload: {
                        //                 image: {
                        //                     imageBytes: data
                        //                 }
                        //             }
                        //         }),
                        //     }).then(response => console.log(response));
                        // }, reason => console.log(reason));
                        this.setState({imgUrl: img.uri});
                    });
                }}/>
                <View style={styles.bottomBox}>
                    {/*<Text style={styles.textBox}>{this.state.text}</Text>*/}
                    <Image source={{uri: this.state.imgUrl}} style={{width: 300, height: 250}}/>
                    <StartStopButton style={styles.buttonBox} startAction={() => {
                        if (this.customCamera) this.customCamera.snap()
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
            <Button title={this.state.started ? "Stop" : "Start"} onPress={() => {
                clearInterval(this.intervalID);
                if (!this.state.started)
                    this.intervalID = setInterval(this.props.startAction, 1500)
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

    textBox: {
        flex: 2
    },

    buttonBox: {
        flex: 1,
    },

    text: {
        fontSize: 30,
    }
});
