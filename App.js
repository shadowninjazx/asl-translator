import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {text: "HELLO WORLD"};
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.cameraView}>
          <Text>This is camera</Text>
        </View>
        <View style={styles.textBox}>
          <Text style={styles.text}>{this.state.text}</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
  },

  cameraView: {
    flex: 2,
    backgroundColor: '#35ebff',
    alignItems: 'center',
    justifyContent: 'center',
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
