# Exquizite

A beautiful language learning app for creating and practicing word sets with AI-powered translations.

## Links

- **Web App**: [https://app.exquizite.app](https://app.exquizite.app)
- **Landing Page**: [https://www.exquizite.app](https://www.exquizite.app)

## Features

- Create custom word sets for language learning
- AI-powered translations using OpenAI
- Practice mode with audio pronunciation
- Share word sets with others via unique share codes
- Multi-language support (20+ languages)
- Cross-platform (iOS, Android, Web)
- Dark mode support

## Development

### Prerequisites

- Node.js 18+
- Expo CLI
- Supabase account (for backend)
- OpenAI API key (for translations)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/shaggspeare/exquizite-app.git
cd exquizite-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see [instructions/BACKEND_INTEGRATION.md](instructions/BACKEND_INTEGRATION.md))

4. Start the development server:
```bash
npm start
```

### Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web
- `npm run build:web` - Build for web production
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Documentation

See the [instructions](instructions/) directory for detailed guides on:
- Backend integration with Supabase
- Setting up email authentication
- Implementing the sharing feature
- Internationalization (i18n)
- And more...

## Tech Stack

- **Framework**: React Native + Expo
- **Routing**: Expo Router
- **Backend**: Supabase
- **AI**: OpenAI API
- **Languages**: TypeScript
- **Styling**: React Native (StyleSheet)
- **State Management**: React Context

## License

Private

## Contact

For questions or support, visit [https://www.exquizite.app](https://www.exquizite.app)
