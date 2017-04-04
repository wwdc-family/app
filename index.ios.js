import React, { Component } from 'react';
import * as firebase from "firebase";
import MapView from 'react-native-maps';
const ReactNative = require('react-native');
const styles = require('./styles.js')
const Database = require('./database.js')
const FileUpload = require('./fileUpload.js')

import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  NavigatorIOS,
  ActivityIndicator,
  Alert,
  Image,
  ImagePickerIOS
} from 'react-native';

const {
  AppState
} = ReactNative

firebase.initializeApp({
});

export default class NavigatorIOSApp extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <NavigatorIOS
        initialRoute={{
          component: login,
          title: 'Login'
        }}
        style={{flex: 1}}
      />
    );
  }
}

export class mapview extends Component {
  constructor(props) {
    super(props)

    this.state = {
      markers: [],
      lastPosition: 'unknown',
      gpsTrackingActive: false
    }
  }

  // viewDidLoad
  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
    this._handleAppStateChange('active')
    this.startTrackingLocation()
  }

  // viewDidUnload
  componentWillUnmount() {
    this.stopTrackingLocation()
    Database.stopListening()
  }

  _handleAppStateChange = (appState) => {    
    if (appState == "active") { // viewDidAppear
      Database.listenToUsers(this.onOtherUserUpdatedLocation)
    }
    else if (appState == "inactive" || appState == "background") { // viewDidDisappear
      Database.stopListening()
    }
  }

  // This is called with lat & lng being nil if a marker gets removed
  onOtherUserUpdatedLocation = (userId, lat, lng, timestamp, profilePicture) => {
    let foundExisting = -1
    let coordinatesProvided = !(lat == null && lng == null)
    let coordinate = null

    if (coordinatesProvided) {
      coordinate = {latitude: parseFloat(lat), longitude: parseFloat(lng)}
    }

    for (let i = 0; i < this.state.markers.length; i++) {
      if (this.state.markers[i]["key"] == userId) {
        if (coordinatesProvided) {
          this.state.markers[i]["coordinate"] = coordinate
        }
        foundExisting = i
      }
    }

    if (foundExisting > 0 && !coordinatesProvided) {
      // we have to remove this marker from our list
      // as the user disabled their location sharing
      console.log("Removing the marker here")
      this.state.markers.splice(foundExisting, 1)
    }

    if (coordinatesProvided && foundExisting == -1) {
      this.state.markers.push({
        coordinate: coordinate,
        key: userId,
        title: userId,
        description: "fastlane guy",
        profilePicture: profilePicture
      })
    }
    console.log("updating markers here")

    // So that react re-renders
    this.setState({ markers: this.state.markers })
    console.log(this.state.markers)
  }

  // Location tracking
  watchID: ?number = null;

  startTrackingLocation = () => {
    console.log("starting location listening")
    this.setState({gpsTrackingActive: true })

    this.watchID = navigator.geolocation.watchPosition((position) => {
      var lastPosition = JSON.stringify(position);
      this.setState({gpsTrackingActive: true })
      this.state.lastPosition = lastPosition

      let userId = this.props.route.userId

      Database.setUserLocation(userId, 
          position.coords.latitude + "", 
          position.coords.longitude + "", 
          position.timestamp + "")
    },
    (error) => console.log(error),
    {enableHighAccuracy: true});
  }

  stopTrackingLocation = () => {
    console.log("Stop tracking location")
    this.setState({gpsTrackingActive: false })
    navigator.geolocation.clearWatch(this.watchID);
    let userId = this.props.route.userId
    Database.hideUser(userId)
  }

  toggleLocationTracking = () => {
    if (this.state.gpsTrackingActive) {
      this.stopTrackingLocation()
    } else {
      this.startTrackingLocation()
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <MapView
          initialRegion={{
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 1.322,
            longitudeDelta: 0.721,
          }}
          style={styles.map}
        >
          {this.state.markers.map(marker => (
            <MapView.Marker
              coordinate={marker.coordinate}
              title={marker.title}
              description={marker.description}
              key={marker.key}
            >
              <Image
                source={{uri: marker.profilePicture}}
                style={styles.mapMarker}
              />
            </MapView.Marker>
          ))}
        </MapView>
        <Text style={styles.gpsSender} onPress={this.toggleLocationTracking}>
          {(this.state.gpsTrackingActive?"📡":"👻")}
        </Text>
      </View>
    );
  }
}

export class login extends Component {
  constructor(props) {
    super(props)

    this.state = {
      email: 'email@kdrausefx.com', // TODO: remove
      password: 'abcdefg123',
      loading: false
    }
  }

  async signup(email, pass) {
    this.setState({loading: true})
    ref = this
    try {
      console.log("start")
      let userSession = await firebase.auth().createUserWithEmailAndPassword(email, pass);
      let userId = userSession.uid
      console.log("Account created with ID: " + userId);

      let nav = this.props.navigator
      this.askForProfilePicture(userId, function() {
        reffinishLoading()
        nav.push({
          component: mapview,
          title: 'Map',
          userId: userId
        });
      })
    } catch (error) {
      this.setState({loading: false})
      Alert.alert("Registration error", error.message)
    }
  }

  async login(email, pass) {
    this.setState({loading: true})
    ref = this
    try {
      let userSession = await firebase.auth()
          .signInWithEmailAndPassword(email, pass);

      let userId = userSession.uid
      console.log("Logged In for user with ID: " + userId);

      let nav = this.props.navigator
      this.askForProfilePicture(userId, function() {
        ref.finishLoading()
        nav.push({
          component: mapview,
          title: 'Map',
          userId: userId
        });
      })
    } catch (error) {
      this.setState({loading: false})
      Alert.alert("Login error", error.message)
    }
  }

  async logout() {
    try {
      await firebase.auth().signOut();
    } catch (error) {
      console.log(error);
    }
  }

  finishLoading() {
    this.setState({loading: false})
  }

  askForProfilePicture(userId, successCallback) {
    let email = this.state.email

    Database.getUser(userId, function(value) {
      // First, check if there is an existing profile picture
      if (value != null && value.profilePicture != null) {
        successCallback()
        return
      }
      Alert.alert(
        "Profile picture required", 
        "Please provide a profile picture. This will be shown on the map for other iOS developers to see. Ideally use your Twitter profile picture.",
        [
          {text: 'OK', onPress: function() {
            ImagePickerIOS.openSelectDialog({
              showImages: true,
              showVideos: false
            }, imageUri => {
              FileUpload.uploadImage(imageUri, email + ".jpg").then(url => {
                console.log("Got the URL: " + url)
                Database.setUserProfilePicture(userId, url)
                successCallback()
              }).catch(error => Alert.alert("Error uploading picture", error))
            }, error => console.log(error));
          }},
        ])
    })
  }

  onPressRegister = () => {
    this.signup(this.state.email, this.state.password)
  }

  onPressLogin = () => {
    this.login(this.state.email, this.state.password)
  }

  render() {
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.email}
          placeholder="Email"
          onChangeText={email => this.setState({email})}
          value={this.state.email}
        />
        <TextInput
          style={styles.password}
          placeholder="Password"
          secureTextEntry={true}
          onChangeText={password => this.setState({password})}
          value={this.state.password}
        />
        <Button
          style={styles.button}
          disabled={this.state.loading}
          onPress={this.onPressLogin}
          title="Login"
          accessibilityLabel="Login"
        />
        <Button
          style={styles.button}
          disabled={this.state.loading}
          onPress={this.onPressRegister}
          title="Register"
          accessibilityLabel="Signup"
        />
        <ActivityIndicator
          animating={this.state.loading}
          style={[styles.centering, {height: 80}]}
          size="large"
        />
      </View>
    );
  }
}

AppRegistry.registerComponent('wwdcfamily', () => NavigatorIOSApp);
