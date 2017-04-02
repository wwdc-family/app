const React = require('react-native')
const {StyleSheet} = React
const constants = {
  navBarHeight: 60, // not good
  gpsPadding: 10
};

const styles = StyleSheet.create({
  email: {
    textAlign: 'center',
    height: 50,
    borderStyle: 'solid',
    borderWidth: 1,
    margin: 30,
    marginBottom: 0,
    marginTop: constants.navBarHeight + 50
  },
  password: {
    textAlign: 'center',
    height: 50,
    borderStyle: 'solid',
    borderWidth: 1,
    margin: 30
  },
  map: {
    height: "100%",
    width: "100%"
  },
  gpsSender: {
    right: constants.gpsPadding,
    top: constants.navBarHeight + constants.gpsPadding,
    backgroundColor: "transparent",
    position: "absolute",
    transform: [{scaleX: -1}], // GPS should point inwards
    fontSize: 40
  }
});

module.exports = styles
module.exports.constants = constants;
