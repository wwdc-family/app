import React, { Component } from "react";
import * as firebase from "firebase";
const styles = require("./styles.js");

import Firestack from "react-native-firestack";
const firestack = new Firestack();

const MapViewComponent = require("./mapViewComponent");
const Database = require("./database.js");

import {
  View,
  Image,
  TextInput,
  Button,
  ActivityIndicator,
  Alert,
  AlertIOS,
  Text,
  TouchableOpacity,
  Keyboard
} from "react-native";

class LoginComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      loading: true,
      waitingForFirebase: true
    };
  }

  componentWillMount() {
    // Check if the user is already logged in
    ref = this;
    firebase.auth().onAuthStateChanged(function(user) {
      if (ref.state.waitingForFirebase) {
        ref.setState({ waitingForFirebase: false });
        if (user) {
          let userId = user.uid;
          firestack.analytics.setUser(userId);
          ref.props.navigator.push({
            component: MapViewComponent,
            passProps: {
              title: "Map",
              userId: userId
            }
          });
          ref.finishLoading();
        } else {
          ref.setState({ loading: false });
          // No user is signed in - show the login dialog
        }
      } else {
        // We don't care about this, the user manually logged in
      }
    });
    firestack.analytics.logEventWithName("pageView", {
      screen: "LoginComponent"
    });
    firestack.analytics.logEventWithName("openLoginView");
  }

  async signup(email, pass) {
    this.setState({ loading: true });
    ref = this;
    try {
      let userSession = await firebase
        .auth()
        .createUserWithEmailAndPassword(email, pass);
      let userId = userSession.uid;
      console.log("Account created with ID: " + userId);

      let nav = this.props.navigator;
      this.askForTwitterUser(userId, function() {
        ref.finishLoading();
        firestack.analytics.setUser(userId);
        nav.push({
          component: MapViewComponent,
          passProps: {
            title: "Map",
            userId: userId
          }
        });
      });
    } catch (error) {
      this.setState({ loading: false });
      Alert.alert("Registration error", error.message);
    }
  }

  async login(email, pass) {
    this.setState({ loading: true });
    ref = this;
    try {
      let userSession = await firebase
        .auth()
        .signInWithEmailAndPassword(email, pass);

      let userId = userSession.uid;
      console.log("Logged In for user with ID: " + userId);

      let nav = this.props.navigator;
      this.askForTwitterUser(userId, function() {
        ref.finishLoading();
        firestack.analytics.setUser(userId);
        nav.push({
          component: MapViewComponent,
          passProps: {
            title: "Map",
            userId: userId
          }
        });
      });
    } catch (error) {
      this.setState({ loading: false });
      Alert.alert("Login error", error.message);
    }
  }

  // This method will add a delay, call it only on success
  finishLoading() {
    setTimeout(
      function() {
        ref.setState({ loading: false });
      },
      500
    ); // enable the buttons later for a smoother animation
  }

  askForTwitterUser(userId, successCallback) {
    Database.getUser(userId, function(value) {
      // First, check if there is an existing twitter username
      if (value != null && value.twitterUsername != null) {
        successCallback();
        return;
      }

      AlertIOS.prompt(
        "Twitter username or your name",
        "The name will be shown next to your marker. Please use your Twitter username if you have one, as it will be used to fetch your profile picture.\n\nIf you don't have a Twitter account, just enter your real name",
        [
          {
            text: "OK",
            onPress: function(twitterUsername) {
              twitterUsername = twitterUsername.replace("@", "");
              Database.setUserTwitterName(userId, twitterUsername);
              successCallback();
            }
          }
        ],
        "plain-text"
      );
    });
  }

  onPressRegister = () => {
    this.signup(this.state.email, this.state.password);
  };

  onPressLogin = () => {
    this.login(this.state.email, this.state.password);
  };

  dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  render() {
    return (
      <View style={styles.container} onPress={this.dismissKeyboard}>
        <Image
          source={require("./assets/headerImage.jpg")}
          style={styles.loginHeaderImage}
        >
          <Text style={styles.loginHeaderTitle}>
            wwdc.family
          </Text>
        </Image>
        <TouchableOpacity
          onPress={this.dismissKeyboard}
          style={styles.dismissKeyboardView}
        />
        <TextInput
          style={styles.email}
          placeholder="Email"
          keyboardType="email-address"
          onChangeText={email => this.setState({ email })}
          value={this.state.email}
        />
        <TextInput
          style={styles.password}
          placeholder="Password"
          secureTextEntry={true}
          onChangeText={password => this.setState({ password })}
          value={this.state.password}
        />
        <View style={styles.buttonContainer}>
          <Button
            disabled={this.state.loading}
            onPress={this.onPressLogin}
            title="Login"
            style={styles.button}
            accessibilityLabel="Login"
          />
          <View style={{ marginLeft: 40 }} />
          <Button
            disabled={this.state.loading}
            onPress={this.onPressRegister}
            title="Register"
            style={styles.button}
            accessibilityLabel="Signup"
          />
        </View>
        <ActivityIndicator
          animating={this.state.loading}
          style={[styles.centering, { height: 80 }]}
          size="large"
        />
      </View>
    );
  }
}

module.exports = LoginComponent;
