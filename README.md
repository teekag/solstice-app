# Solstice: Wellness Routine Builder

Solstice is a powerful wellness routine builder app that helps users create personalized wellness routines by importing content from various sources, organizing exercises/steps into structured sequences, and tracking progress.

## Features

- **Authentication & User Profiles**: Secure user accounts with customizable profiles
- **Content Import**: Save exercises and wellness content from YouTube, blogs, and other sources
- **Routine Builder**: Create structured wellness routines with drag-and-drop card arrangement
- **Content Repository**: Maintain a personal library of wellness content
- **Tagged Organization**: Categorize routines and content with customizable tags
- **Performance Tracking**: Record and monitor routine completions and progress
- **Social Sharing**: Share routines with the Solstice community

## Getting Started

### Prerequisites

- Node.js (v16.0.0 or higher)
- npm or Yarn
- Expo CLI
- A Supabase account for the backend

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/SolsticeApp.git
   cd SolsticeApp
   ```

2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   ```

4. Set up the Supabase database:
   - Create a new Supabase project
   - Run the database schema in `database_schema.sql`
   - Run the seed data script in `database_seed.sql`

5. Start the development server:
   ```
   npm start
   ```
   or
   ```
   expo start
   ```

## Architecture

Solstice is built with the following technology stack:

- **Frontend**: React Native with Expo
- **State Management**: React Context API
- **Navigation**: React Navigation
- **Database & Authentication**: Supabase
- **Storage**: Supabase Storage

### Project Structure

```
SolsticeApp/
├── App.tsx                # Main app component
├── app.json               # Expo configuration
├── assets/                # Images, fonts, etc.
├── components/            # Reusable UI components
│   ├── cards/             # Card components for routines
│   ├── common/            # Common UI elements
│   └── tags/              # Tag-related components
├── contexts/              # React Context providers
├── hooks/                 # Custom React hooks
├── navigation/            # Navigation configuration
├── screens/               # App screens
│   ├── auth/              # Authentication screens
│   ├── builder/           # Routine builder screens
│   ├── home/              # Home and discovery screens
│   ├── perform/           # Routine performance screens
│   ├── profile/           # User profile screens
│   └── repository/        # Content repository screens
├── services/              # API and service integrations
│   ├── supabaseService.ts # Supabase client and operations
│   └── repositoryService.ts # Content repository logic
├── styles/                # Global styles and theme
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## Database Schema

The Solstice app uses a relational database with the following main tables:

- **user_profiles**: Extended user information beyond auth
- **tags**: Categories for organizing content
- **cards**: Individual content items (exercises, meditations, etc.)
- **card_tags**: Junction table connecting cards and tags
- **cues**: Instructions or prompts for cards
- **routines**: Collections of cards in a sequence
- **routine_tags**: Junction table connecting routines and tags
- **routine_cards**: Junction table connecting routines and cards with order
- **routine_completions**: Records of completed routines
- **file_uploads**: User-uploaded files

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Expo team for their amazing React Native toolkit
- Supabase for the powerful open-source backend
- All contributors to the project 