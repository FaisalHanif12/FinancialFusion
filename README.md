# FinancialFusion

A comprehensive financial management app built with React Native and Expo SDK 53, featuring Khata (ledger) management, expense tracking, and multilingual support (English/Urdu).

## 🚀 Features

- **Khata Management**: Create and manage multiple ledgers for tracking money lent and borrowed
- **Expense Tracking**: Track daily expenses with categorization and monthly summaries
- **Multilingual Support**: Full English and Urdu language support with RTL text handling
- **Dark/Light Theme**: Automatic theme switching with manual override
- **Data Backup**: Built-in backup and restore functionality
- **Responsive Design**: Optimized for both mobile and tablet devices

## 🛠️ Tech Stack

- **Framework**: React Native 0.79.5
- **Expo SDK**: 53.0.20
- **React**: 19.1.1
- **Navigation**: Expo Router 5.1.4
- **State Management**: React Context API
- **Storage**: AsyncStorage
- **Styling**: Styled Components
- **Icons**: Expo Vector Icons
- **Language**: TypeScript

## 📱 Screenshots

- Home Screen with Khata overview
- Dasti Khata (Ledger) management
- Expense tracking with monthly summaries
- Settings with theme and language options
- Data backup and restore functionality

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI
- Expo Go app on your device

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FinancialFusion
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Run the setup script**
   ```bash
   npm run setup
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on your device**
   - Scan the QR code with Expo Go (Android/iOS)
   - Press 'a' for Android emulator
   - Press 'i' for iOS simulator
   - Press 'w' for web browser

## 🔧 Recent Fixes Applied

### Expo SDK 53 Compatibility
- Updated React to version 19.1.1 for compatibility with React Native 0.79.5
- Updated React DOM to version 19.1.1
- Updated React Test Renderer to version 19.1.1
- Added babel-plugin-module-resolver for proper module resolution

### Metro Configuration
- Added gesture handler alias in metro.config.js
- Configured proper module resolution for all platforms

### Babel Configuration
- Updated babel.config.js with module resolver plugin
- Ensured proper plugin order for React Native Reanimated

### Navigation Setup
- Wrapped app with GestureHandlerRootView for proper gesture handling
- Updated main layout to use proper gesture handler imports

### TypeScript Fixes
- Fixed IconSymbol component type issues
- Updated style prop types for MaterialIcons compatibility

## 📁 Project Structure

```
FinancialFusion/
├── app/                    # Expo Router app directory
│   ├── (tabs)/            # Tab navigation screens
│   ├── _layout.tsx        # Root layout
│   └── components/        # App-specific components
├── components/            # Shared components
│   ├── ui/               # UI components
│   └── ...               # Other components
├── context/              # Context providers
├── contexts/             # Additional contexts
├── constants/            # App constants
├── hooks/                # Custom hooks
├── utils/                # Utility functions
└── scripts/              # Build and setup scripts
```

## 🎯 Key Features Explained

### Khata Management
- Create multiple ledgers for different purposes
- Track money lent and borrowed
- Automatic balance calculations
- Transaction history with timestamps

### Expense Tracking
- Add expenses with descriptions and amounts
- Monthly expense summaries
- Categorized expense tracking
- Available balance calculations

### Multilingual Support
- English and Urdu language support
- RTL text handling for Urdu
- Automatic text transliteration
- Language persistence

### Theme System
- Automatic dark/light theme detection
- Manual theme override
- Theme persistence across app restarts
- Consistent theming across all components

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler errors**
   ```bash
   npx expo start --clear
   ```

2. **Dependency conflicts**
   ```bash
   rm -rf node_modules package-lock.json
   npm install --legacy-peer-deps
   ```

3. **TypeScript errors**
   ```bash
   npx tsc --noEmit
   ```

4. **Gesture handler issues**
   - Ensure GestureHandlerRootView wraps the app
   - Check metro.config.js for proper aliases

### Development Tips

- Use `npm run setup` to reset and reinstall dependencies
- Clear cache with `npx expo start --clear` when experiencing issues
- Check TypeScript errors with `npx tsc --noEmit`
- Use `npm run type-check` for quick type checking

## 📦 Build

### Android APK
```bash
npx expo run:android
```

### iOS
```bash
npx expo run:ios
```

### Web
```bash
npx expo start --web
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and type checks
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Expo team for the excellent development platform
- React Native community for the robust ecosystem
- Contributors and testers for feedback and improvements

---

**Note**: This app is fully functional with Expo SDK 53 and includes all necessary fixes for compatibility issues. The setup script will automatically handle dependency installation and configuration.
