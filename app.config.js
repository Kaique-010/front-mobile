const VERSION = '1.0.9'
const BUILD = 9

export default {
  expo: {
    name: 'SpsMobile',
    slug: 'front-mobile-sps',
    owner: 'leokaique10',

    version: VERSION,

    ios: {
      bundleIdentifier: 'com.leokaique.SpsMobile',
      buildNumber: String(BUILD),
    },

    android: {
      package: 'com.leokaique.SpsMobile',
      versionCode: BUILD,
    },

    extra: {
      eas: {
        projectId: '6da51109-274a-4c0f-b576-6d58f471d972',
      },
    },

    updates: {
      url: 'https://u.expo.dev/6da51109-274a-4c0f-b576-6d58f471d972',
    },

    runtimeVersion: {
      policy: 'appVersion',
    },
  },
}
