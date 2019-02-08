import React from 'react';
import { ExpoConfigView } from '@expo/samples';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
} from 'react-native';

export default class SettingsScreen extends React.Component {
  static navigationOptions = {
    title: 'About',
  };

  render() {
    /* Go ahead and delete ExpoConfigView and replace it with your
     * content, we just wanted to give you a quick view of your config */
    return (

      <View style={{
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
      }}>
          <Text style={{
            textAlign: 'center',
            fontSize: 25,
          }}>

              Created by the Johns Hopkins inHealth Measurement Corps.
              Please direct any inquiries to akim77@jh.edu.

          </Text>
      </View>
      );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
});
