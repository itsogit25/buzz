import { Alert } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

export async function selectImage() {
  return new Promise((resolve) => {
    Alert.alert(
      'Select Image',
      'Choose how to upload your image',
      [
        {
          text: 'Camera',
          onPress: async () => {
            try {
              const result = await launchCamera({
                mediaType: 'photo',
                quality: 0.8,
                cameraType: 'front',
              });
              const asset = result.assets?.[0];
              resolve(asset || null);
            } catch (error) {
              Alert.alert('Camera Error', error.message);
              resolve(null);
            }
          },
        },
        {
          text: 'Gallery',
          onPress: async () => {
            try {
              const result = await launchImageLibrary({
                mediaType: 'photo',
                quality: 0.8,
              });
              const asset = result.assets?.[0];
              resolve(asset || null);
            } catch (error) {
              Alert.alert('Gallery Error', error.message);
              resolve(null);
            }
          },
        },
        {
          text: 'Cancel',
          onPress: () => resolve(null),
          style: 'cancel',
        },
      ]
    );
  });
}
