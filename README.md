# React Native Mobile App

A React Native mobile application with authentication screens (Login and Signup) built with Expo.

## Features

- 🔐 Login Screen with email and password
- 📝 Signup Screen with validation
- 🧭 React Navigation for screen transitions
- 📱 Cross-platform (iOS, Android, Web)
- 🎨 Modern UI with clean design

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo Go app (for testing on physical device)

## Installation

1. Install dependencies:
```bash
npm install
```

## Running the App

### Start the development server:
```bash
npm start
```

### Run on specific platforms:
```bash
npm run android  # Run on Android
npm run ios      # Run on iOS
npm run web      # Run on web browser
```

### Testing on Physical Device:
1. Install Expo Go app from App Store or Google Play
2. Run `npm start`
3. Scan the QR code with your device

## Project Structure

```
reactnative-app/
├── screens/
│   ├── LoginScreen.js      # Login page
│   ├── SignupScreen.js     # Signup page
│   └── HomeScreen.js       # Home page (after login)
├── assets/                 # Images and other assets
├── App.js                  # Main app with navigation
├── app.json                # Expo configuration
├── package.json            # Dependencies
└── babel.config.js         # Babel configuration
```

## Screens

### Login Screen
- Email and password input fields
- Login button
- Navigation to Signup screen

### Signup Screen
- Full name, email, password, and confirm password fields
- Form validation
- Navigation back to Login screen

### Home Screen
- Welcome message
- Logout functionality

## Technologies Used

- React Native
- Expo
- React Navigation
- Expo Status Bar

## Notes

- This is a demo app with basic validation
- In production, you should connect to a real authentication API
- Add proper error handling and loading states
- Consider adding password recovery and social login options

## License

ISC
