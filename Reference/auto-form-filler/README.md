# Auto Form Filler - Chrome Extension

A Chrome extension for automatically filling web forms with AI-powered suggestions, built with modern web technologies.

## Features

- AI-powered form field suggestions
- Context-aware field matching
- Optimized HTML processing for AI efficiency
- Customizable form templates
- Secure data storage
- Cross-device sync

## Tech Stack

- **Runtime:** Bun
- **Extension Framework:** WXT
- **Frontend:** React
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Data Storage:** chrome.storage.sync
- **AI Integration:** OpenAI API

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-repo/auto-form-filler.git
```

2. Install dependencies:

```bash
bun install
```

3. Start development server:

```bash
bun dev
```

4. Build for production:

```bash
bun build
```

## Configuration

Create a `.env` file with your OpenAI API key:

```bash
VITE_OPENAI_API_KEY=your-api-key
```

## Usage

1. Click the extension icon to open the popup
2. Select a form template or create a new one
3. Navigate to any web form
4. Click the "Fill Form" button to automatically populate fields

## API Documentation

### Form Filler Service

```typescript
interface FormField {
  name: string;
  type: string;
  value: string;
}

async function fillForm(fields: FormField[]): Promise<void> {
  // Implementation
}
```

### AI Service

```typescript
async function getFieldSuggestions(field: FormField): Promise<string> {
  // Implementation
}
```

## Project Structure

- `entrypoints/` - Extension entry points (popup, background, content scripts)
- `components/` - Reusable React components
- `utils/` - Core utilities and services
- `assets/` - Static assets
- `public/` - Public files
- `types/` - TypeScript type definitions

## Contribution Guidelines

1. Fork the repository
2. Create a feature branch
3. Follow coding standards:
   - TypeScript for type safety
   - React best practices
   - Tailwind CSS utility classes
   - Accessibility (WCAG) compliance
4. Write unit tests for new features
5. Submit a pull request

## License

MIT License
