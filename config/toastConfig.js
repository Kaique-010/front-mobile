import { BaseToast } from 'react-native-toast-message'

export const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#10a2a7' }}
      contentContainerStyle={{ backgroundColor: '#1a2f3d' }}
      text1Style={{ color: '#fff' }}
      text2Style={{ color: '#ddd' }}
    />
  ),
  error: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#ff0000' }}
      contentContainerStyle={{ backgroundColor: '#1a2f3d' }}
      text1Style={{ color: '#fff' }}
      text2Style={{ color: '#ddd' }}
    />
  ),
  warning: (props) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#ffcc00' }}
      contentContainerStyle={{ backgroundColor: '#1a2f3d' }}
      text1Style={{ color: '#fff' }}
      text2Style={{ color: '#ddd' }}
    />
  ),
}