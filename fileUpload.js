import * as firebase from "firebase";
import RNFetchBlob from 'react-native-fetch-blob'

const Blob = RNFetchBlob.polyfill.Blob
const fs = RNFetchBlob.fs
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
window.Blob = Blob

class FileUpload {
  static uploadImage(uri, imageName, mime = 'image/jpg') {
    return new Promise((resolve, reject) => {
      console.log(uri)
      const uploadUri = uri.replace('file://', '')
      let uploadBlob = null
      const imageRef = firebase.storage().ref('images').child(imageName)
      fs.readFile(uploadUri, 'base64')
      .then((data) => {
        return Blob.build(data, { type: `${mime};BASE64` })
      })
      .then((blob) => {
        uploadBlob = blob
        return imageRef.put(blob, { contentType: mime })
      })
      .then(() => {
        uploadBlob.close()
        return imageRef.getDownloadURL()
      })
      .then((url) => {
        resolve(url)
      })
      .catch((error) => {
        reject(error)
      })
    })
  }
}

module.exports = FileUpload;

