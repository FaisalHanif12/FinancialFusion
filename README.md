# FinancialFusion

A sleek, intuitive React Native app designed to effortlessly manage financial records (Khata). This app enables users to create a Khata, store financial details, and track expenses seamlessly.

## Features

- **Create Khata**: Easily create a new financial record with name, date, and total amount
- **Track Expenses**: Add expenses to each Khata with source and amount
- **Real-time Balance**: Automatically updates remaining balance as expenses are added
- **Persistent Storage**: All data is stored locally using AsyncStorage

## Tech Stack

- **React Native (Expo)**: For cross-platform mobile app development
- **AsyncStorage**: For local persistent storage
- **React Navigation**: For smooth navigation between screens
- **Styled Components**: For styling the UI components
- **Context API**: For state management

## Screenshots

[Screenshots will be added here]

## Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/FinancialFusion.git
cd FinancialFusion
```

2. **Install dependencies**

```bash
npm install
```

3. **Set execution policy (for Windows users)**

```bash
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

4. **Start the application**

```bash
npm start
```

## Usage

1. **Home Screen**:
   - View all your Khatas
   - Tap the "+" button to create a new Khata

2. **Creating a Khata**:
   - Enter the name of the person/entity
   - Enter the total amount
   - Tap "Create" to save

3. **Viewing a Khata**:
   - Tap on any Khata card to view details
   - See the total amount and all expenses
   - Add new expenses

4. **Adding an Expense**:
   - Enter the source of expense
   - Enter the amount
   - Tap "Add Expense" to save

## Development

### Project Structure

```
FinancialFusion/
├── app/                  # Main application screens
│   ├── (tabs)/           # Tab screens
│   ├── khata/            # Khata detail screens
│   └── add-expense/      # Add expense screens
├── components/           # Reusable UI components
├── constants/            # Theme and constants
├── context/              # Context providers
│   ├── KhataContext.tsx  # Khata state management
│   └── ThemeProvider.tsx # Styled-components theme provider
└── assets/               # Images, fonts, etc.
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Expo](https://expo.dev/)
- [React Native](https://reactnative.dev/)
- [Styled Components](https://styled-components.com/)
