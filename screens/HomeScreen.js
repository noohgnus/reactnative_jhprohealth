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
  DatePickerIOS,
  TimePickerIOS,
  ToastAndroid,
  TouchableOpacity,
  View,
  Clipboard,
  TextInput,
} from 'react-native';

import DatePicker from 'react-native-datepicker'

import {
  WebBrowser,
  Permissions,
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
    title: "JHProHealth Companion App",
  };



  state = {
    language: "",
    userId: 0,
    datetext: "",
    timetext: "",
    time: "00:00",
    token: "",
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
    if (Platform.OS === 'android') {

      try {
        const {action, hour, minute} = await TimePickerAndroid.open({
          hour: 12,
          minute: 0,
          is24Hour: false,
        });
        if (action !== TimePickerAndroid.dismissedAction) {
          // Selected hour (0-23), minute (0-59)
          ToastAndroid.show(`${hour} : ${minute}`, ToastAndroid.SHORT);
          if (minute % 10 == 0){
            minute = minute + "0";
          }
          let timetext = `${hour}:${minute}`;
          this.setState({
            timetext: timetext
          });
        }
      } catch ({code, message}) {
        console.warn('Cannot open time picker', message);
      }
    } else if (Platform.OS === 'ios') {
      console.log('hi ios');
      return (
        <DatePickerIOS
          date={new Date()}
          onDateChange={this.setDateIOS}
        />
      );
    }
  }

  setDateIOS(newDate) {
    this.setState({datetext: newDate})
  }

  submitDateTime(){
    ToastAndroid.show(`${this.state.datetext} at ${this.state.timetext}`, ToastAndroid.SHORT);
    this._createNotificationAsync();
    this.sendDelayedNotificationV2(`It's time to take a survey!`,`Your nth survey is ready to take.`)
  }

  submitTime(){
    fetch(`https://jhprohealth.herokuapp.com/polls/reminders/${this.state.userId}/${this.state.timetext}/${this.state.token}/`)
    .then(
      response => console.log(response)
    ).catch(
      error => console.log(error)
    );

  }
  async submitTimeAsync() {
    if(this.state.timetext == ""){
      alert("Please select preferred time");
      return;
    }
    if(this.state.userId == 0){
      alert("Please enter userId");
      return;
    }
    try {
      alert('Please wait...');
      let response = await fetch(
        `https://jhprohealth.herokuapp.com/polls/reminders/${this.state.userId}/${this.state.timetext}/${this.state.token}/`,
      );

      let responseJson = await response.json();
      console.log(responseJson);
      alert("Reminder is successfully set.");
    } catch (error) {
      console.error(error);
    }
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

    if(Platform.OS === 'android'){
      ToastAndroid.show("time: " + (new Date(
                this.state.datetext.split("/")[0], this.state.datetext.split("/")[1], this.state.datetext.split("/")[2],
                this.state.timetext.split(":")[0], this.state.timetext.split(":")[1], 0, 0
              )).getTime(), ToastAndroid.SHORT);

      console.log("time: " + (new Date(
                this.state.datetext.split("/")[0], this.state.datetext.split("/")[1], this.state.datetext.split("/")[2],
                this.state.timetext.split(":")[0], this.state.timetext.split(":")[1], 0, 0
              )).getTime());
    }

    console.log('Scheduling delayed notification:', { localNotification, schedulingOptions });

    Notifications.scheduleLocalNotificationAsync(localNotification, schedulingOptions);

  }


  async registerForPushNotificationsAsync() {
    const PUSH_ENDPOINT = 'https://your-server.com/users/push-token';

    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );
    let finalStatus = existingStatus;

    // only ask if permissions have not already been determined, because
    // iOS won't necessarily prompt the user a second time.
    if (existingStatus !== 'granted') {
      // Android remote notification permissions are granted during the app
      // install, so this will only ask on iOS
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }

    // Stop here if the user did not grant permissions
    if (finalStatus !== 'granted') {
      console.log("push permission not granted.");
      return;
    } else {
      console.log("push permission granted!");
    }

    // Get the token that uniquely identifies this device
    let token = await Notifications.getExpoPushTokenAsync();
    console.log(token);
    this.state.token = token;

    // POST the token to your backend server from where you can retrieve it to send push notifications.
    return fetch(PUSH_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: {
          value: token,
        },
        user: {
          username: 'Brent',
        },
      }),
    });
  }

  writeToClipboard = async () => {
    await Clipboard.setString(this.state.token);
    alert('Copied to Clipboard!');
    this.setState({ state: this.state });
  };

  componentDidMount(){
    if (Platform.OS === 'android') {
      console.log("OS: android. component did mount");
      this.registerForPushNotificationsAsync();
      Expo.Notifications.createChannelAndroidAsync('reminders', {
        name: 'Reminders',
        priority: 'max',
        sound: true,
        vibrate: [0, 250, 250, 250],
      });
    } else if(Platform.OS === 'ios'){    //TODO: iOS specific handling, but it seems to be working for now
      console.log("OS: ios. component did mount");
      this.registerForPushNotificationsAsync();
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

            <Text style={styles.welcomeText}> Reminder </Text>
            {/*<Text>{"Your token: " + this.state.token}</Text>*/}

            <View style={styles.myButton}>
              <TextInput
                style={styles.userIdTextBox}
                keyboardType='numeric'
                returnKeyType='done'
                placeholder='Enter user ID'
                underlineColorAndroid='rgba(0,0,0,0)'
                onChangeText={(text) => this.setState({userId:text})}

              />
            </View>

            <View style={styles.myButton}>
            <DatePicker
              style={styles.timePicker}
              date={this.state.timetext}
              mode="time"
              format="HH:mm"
              confirmBtnText="Confirm"
              cancelBtnText="Cancel"
              minuteInterval={10}
              showIcon={false}
              androidMode="spinner"
              onDateChange={(time) => {this.setState({timetext: time});}}
            />
            </View>



            <TouchableOpacity style={styles.myButton} onPress={() => this.submitTimeAsync()}>
                <Text style={styles.buttonText}>Setup reminder</Text>
            </TouchableOpacity>

          </View>




      </View>
    );
  }
}

function hife(){
  return(

    <Text style={styles.welcomeText}> Reminder </Text>

  )
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
  welcomeText: {
    color: '#5472d3',
    fontWeight: 'bold',
    fontSize: 40,
    textAlign: 'center',
  },


  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 30,

  },

  userIdTextBox: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 30,
    width:300,
    textAlign: 'center',
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
  },
  timePicker: {
    width: 350,

    shadowColor: 'rgba(0,0,0, .4)', // IOS
    shadowOffset: { height: 0, width: 0 }, // IOS
    shadowOpacity: 0, // IOS
    shadowRadius: 0, //IOS
    backgroundColor: '#5472d3',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',


  },


});
