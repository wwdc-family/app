import React, { Component } from 'react';

import Firestack from 'react-native-firestack'
const firestack = new Firestack();

const LoginComponent = require('./app/loginComponent')

import {
  AppRegistry,
  View,
  StatusBar,
  Navigator
} from 'react-native';

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
