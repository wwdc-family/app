import React, { Component } from 'react';
import * as firebase from "firebase";

const LoginComponent = require('./app/loginComponent')

import Firestack from 'react-native-firestack'
const firestack = new Firestack();

import {
  AppRegistry,
  View,
  StatusBar,
  Navigator
} from 'react-native';

firebase.initializeApp({
  apiKey: "AIzaSyDzt9p5P0olqMo6ISBXKLGAk8mTYVYhbWM",
  authDomain: "wwdc-family.firebaseapp.com",
  databaseURL: "https://wwdc-family.firebaseio.com",
  projectId: "wwdc-family",
  storageBucket: "wwdc-family.appspot.com",
  messagingSenderId: "48956287355"
});

export default class MainNavigator extends Component {
  componentDidMount() {
    firestack.analytics.logEventWithName("launch")
    firestack.analytics.logEventWithName("pageView", {
      'screen': 'MainNavigator'
    })
  }
  render() {
    return (
      <View style={{width: "100%", height: "100%"}}>
        <StatusBar barStyle="light-content" />
        <Navigator
          initialRoute={{component: LoginComponent}}
          renderScene={(route, navigator) => {
            return React.createElement(route.component, { ...this.props, ...route.passProps, navigator, route } );
          }}
        />
      </View>
    );
  }
}

AppRegistry.registerComponent('wwdcfamily', () => MainNavigator);
