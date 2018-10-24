import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  Picker,
  DatePickerAndroid,
  TimePickerAndroid,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  WebBrowser,
  Notifications,
 } from 'expo';

import { MonoText } from '../components/StyledText';

class PickedDateTime{
  constructor(year=2018, month=10, day=2, hour=9, minute=0) {
    this.year = year;
    this.month = month;
    this.day = day;
    this.hour = hour;
    this.minute = minute;
  }

}

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };



  state = {
    language: "English",
    datetext: "Choose date",
    timetext: "Choose time",

  }

  async openCalendar() {
    console.log("opening calendar");
    try {
      const {action, year, month, day} = await DatePickerAndroid.open({
        // Use `new Date()` for current date.
        // May 25 2020. Month 0 is January.
        date: new Date(2018, 9, 10)
      });
      if (action !== DatePickerAndroid.dismissedAction) {
        // Selected year, month (0-11), day

        ToastAndroid.show(`${year} / ${month} / ${day}`, ToastAndroid.SHORT);
        let datetext = `${year}/${month + 1}/${day}`;
        this.setState({
          datetext: datetext
        });
      }
    } catch ({code, message}) {
      console.warn('Cannot open date picker', message);
    }
  }

  async openTimePicker(){
    try {
      const {action, hour, minute} = await TimePickerAndroid.open({
        hour: 17,
        minute: 0,
        is24Hour: false, // Will display '2 PM'
      });
      if (action !== TimePickerAndroid.dismissedAction) {
        // Selected hour (0-23), minute (0-59)
        ToastAndroid.show(`${hour} : ${minute}`, ToastAndroid.SHORT);
        let timetext = `${hour}:${minute}`;
        this.setState({
          timetext: timetext
        });
      }
    } catch ({code, message}) {
      console.warn('Cannot open time picker', message);
    }
  }

  submitDateTime(){
    ToastAndroid.show(`${this.state.datetext} at ${this.state.timetext}`, ToastAndroid.SHORT);
    this._createNotificationAsync();
    this.sendDelayedNotificationV2(`It's time to take a survey!`,`Your nth survey is ready to take.`)
  }

  sendDelayedNotificationV2 (title,body) {
    const localNotification = {
      title: title,
      body: body,
      data: { test: 'value' },
      priority : 'high',
      vibrate: true,
      sound:true,
      android: {
      sound: true,
      channelId: 'reminders'
      },
      ios: {
      sound: true,
      },
    }
    const schedulingOptions = {
      // time: (new Date()).getTime() + 5000
      time: (new Date(
                this.state.datetext.split("/")[0], this.state.datetext.split("/")[1]-1, this.state.datetext.split("/")[2],
                this.state.timetext.split(":")[0], this.state.timetext.split(":")[1], 0, 0
              )).getTime()


    }

    ToastAndroid.show("time: " + (new Date(
              this.state.datetext.split("/")[0], this.state.datetext.split("/")[1], this.state.datetext.split("/")[2],
              this.state.timetext.split(":")[0], this.state.timetext.split(":")[1], 0, 0
            )).getTime(), ToastAndroid.SHORT);

    console.log("time: " + (new Date(
              this.state.datetext.split("/")[0], this.state.datetext.split("/")[1], this.state.datetext.split("/")[2],
              this.state.timetext.split(":")[0], this.state.timetext.split(":")[1], 0, 0
            )).getTime());

    console.log('Scheduling delayed notification:', { localNotification, schedulingOptions });

    Notifications.scheduleLocalNotificationAsync(localNotification, schedulingOptions);

  }

  componentDidMount(){
    if (Platform.OS === 'android') {
      Expo.Notifications.createChannelAndroidAsync('reminders', {
        name: 'Reminders',
        priority: 'max',
        sound: true,
        vibrate: [0, 250, 250, 250],
      });
    }
  }

  _createNotificationAsync = () => {
    Expo.Notifications.presentLocalNotificationAsync({
      title: 'Sample Reminder',
      body: 'Your reminders will show up like this.',
      android: {
        channelId: 'reminders',
        color: '#FF0000',
      },
    });
}

  render() {
    return (
      <View style={styles.container}>
          <View style={{flex: 1, flexDirection: 'column', justifyContent: 'space-around', alignItems: 'stretch'}}>

            <Text> Set reminder on date and time </Text>
            <TouchableOpacity style={styles.myButton} onPress={() => this.openCalendar()}>
                <Text style={styles.buttonText}>{this.state.datetext}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.myButton} onPress={() => this.openTimePicker()}>
                <Text style={styles.buttonText}>{this.state.timetext}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.myButton} onPress={() => this.submitDateTime()}>
                <Text style={styles.buttonText}>Set reminder</Text>
            </TouchableOpacity>

          </View>




      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 30,

  },

  myButton: {
    shadowColor: 'rgba(0,0,0, .4)', // IOS
    shadowOffset: { height: 1, width: 1 }, // IOS
    shadowOpacity: 1, // IOS
    shadowRadius: 1, //IOS
    backgroundColor: '#5472d3',
    elevation: 2, // Android
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  submitButton: {
    shadowColor: 'rgba(0,0,0, .4)', // IOS
    shadowOffset: { height: 1, width: 1 }, // IOS
    shadowOpacity: 1, // IOS
    shadowRadius: 1, //IOS
    backgroundColor: '#002171',
    elevation: 2, // Android
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  }






});
