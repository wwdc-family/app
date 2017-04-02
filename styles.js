const React = require('react-native')
const {StyleSheet} = React
const constants = {
  
};

const styles = StyleSheet.create({
  email: {
    textAlign: 'center',
    height: 50,
    borderStyle: 'solid',
    borderWidth: 1,
    margin: 30,
    marginBottom: 0,
    marginTop: 100
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
  }
});

module.exports = styles
module.exports.constants = constants;
