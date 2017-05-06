import React, { Component } from 'react';

import Firestack from 'react-native-firestack'
const firestack = new Firestack();
var Buglife = require('react-native-buglife');

const LoginComponent = require('./app/loginComponent')

import {
  AppRegistry,
  View,
  StatusBar,
  Navigator
} from 'react-native';

export default class MainNavigator extends Component {
  constructor(props) {
    super(props);

    Buglife.startWithAPIKey("QExxQmIHlxkC52QTdJOTjQtt");
    Buglife.setInvocationOptions(Buglife.invocationOptionsScreenshot);
  }

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
          configureScene={(route) => ({
            ...Navigator.SceneConfigs.HorizontalSwipeJump,
            gestures: false
          })}
          renderScene={(route, navigator) => {
            return React.createElement(route.component, { ...this.props, ...route.passProps, navigator, route } );
          }}
        />
      </View>
    );
  }
}

AppRegistry.registerComponent('wwdcfamily', () => MainNavigator);
