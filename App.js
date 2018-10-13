import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
// import Camera from 'Camera';
import {Camera, Permissions} from "expo";

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {text: "HELLO WORLD", imgUrl: "assets/icon.png"};
    }

    render() {
        return (
            <View style={styles.container}>
                <CustomCamera onSnap={(img) => {
                    const manipulated = Expo.ImageManipulator.manipulate(img.uri, [{
                        resize: {
                            width: 400,
                            height: 400
                        }
                    }]);
                    manipulated.then((img) => {
                        console.log("Resized " + img.uri + " to size " + img.width + " by " + img.height);
                        this.setState({imgUrl: img.uri});
                    });
                }}/>
                <View style={styles.textBox}>
                    {/*<Text style={styles.text}>{this.state.text}</Text>*/}
                    <Image source={{uri: this.state.imgUrl}} style={{width: 300, height: 300}}/>
                </View>
            </View>
        );
    }
}

class CustomCamera extends React.Component {
    state = {
        hasCameraPermission: null,
        type: Camera.Constants.Type.back,
    };

    constructor(props) {
        super(props);

        setTimeout(() => {
            setInterval(() => {
                this.snap();
            }, 1250);
        }, 3000);
    }

    async componentWillMount() {
        const {status} = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({hasCameraPermission: status === 'granted'});
    }

    async snap() {
        if (this.camera) {
            // this.camera.resumePreview();
            let photo = this.camera.takePictureAsync({
                onPictureSaved: this.props.onSnap,
                // skipProcessing: true
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

    textBox: {
        flex: 1,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
    },

    text: {
        fontSize: 30,
    }
});
