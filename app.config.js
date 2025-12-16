const VERSION = '1.0.12'
const BUILD = 12

export default {
  expo: {
    name: 'SpsMobile',
    slug: 'front-mobile-sps',
    owner: 'leokaique10',

    version: VERSION,

    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',

    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#000000',
    },

    ios: {
      bundleIdentifier: 'com.leokaique.SpsMobile',
      buildNumber: String(BUILD),
      supportsTablet: true,
      infoPlist: {
        NSCameraUsageDescription:
          'Este aplicativo precisa de permissão para usar a câmera para capturar fotos das ordens de serviço.',
        NSLocationWhenInUseUsageDescription:
          'Este aplicativo precisa de permissão para acessar sua localização para geolocalizar as fotos das ordens de serviço.',
        ITSAppUsesNonExemptEncryption: false,
        NSPhotoLibraryUsageDescription:
          'Este aplicativo precisa de permissão para acessar a biblioteca de fotos para selecionar fotos das ordens de serviço.',
        NSLocationAlwaysAndWhenInUseUsageDescription:
          'Nosso aplicativo usa sua localização para registrar o local de uma ordem de serviço em segundo plano.',
        NSLocationUsageDescription:
          'Este aplicativo precisa de permissão para acessar sua localização para geolocalizar as ordens de serviço.',
        NSLocationAlwaysUsageDescription:
          'Nosso aplicativo usa sua localização para registrar o local de uma ordem de serviço em segundo plano.',
      },
    },

    android: {
      package: 'com.leokaique.SpsMobile',
      versionCode: BUILD,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#000000',
      },
    },

    updates: {
      url: 'https://u.expo.dev/6da51109-274a-4c0f-b576-6d58f471d972',
    },

    runtimeVersion: {
      policy: 'appVersion',
    },

    extra: {
      eas: {
        projectId: '6da51109-274a-4c0f-b576-6d58f471d972',
      },
    },

    plugins: [
      'expo-font',
      'expo-location',
      'expo-speech-recognition',
      [
        'expo-camera',
        {
          cameraPermission: 'Permitir acesso à câmera',
          microphonePermission: 'Permitir acesso ao microfone',
          recordAudioAndroid: false,
        },
      ],
      [
        'expo-build-properties',
        {
          android: {
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            buildToolsVersion: '35.0.0',
          },
        },
      ],
    ],
  },
}
