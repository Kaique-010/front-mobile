import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { screenConfigs } from './screenConfig'

const Stack = createNativeStackNavigator()

const MainStackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      {screenConfigs.map((screen) => (
        <Stack.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={screen.options}
        />
      ))}
    </Stack.Navigator>
  )
}

export default MainStackNavigator
