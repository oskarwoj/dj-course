# Azor ChatDog (TypeScript)

Interactive AI chat assistant in TypeScript - migrated from Python. Azor is your friendly dog assistant with great capabilities!

## Features

- 🐶 Interactive chat with AI assistant (Azor)
- 🔄 Session management (create, switch, load, save)
- 💾 Persistent chat history with JSON storage
- 📝 Write-Ahead Log (WAL) for transaction tracking
- 📊 Token usage tracking and display
- 📄 Export sessions to PDF
- 🎨 Colorful terminal output with chalk
- 🔌 Support for multiple LLM backends:
  - Google Gemini
  - Local LLaMA (via node-llama-cpp)

## Prerequisites

- Node.js 20+
- npm or yarn
- Google Gemini API key (for Gemini engine)
- LLaMA model file in GGUF format (for LLaMA engine)

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. Configure your `.env` file with your API keys and settings

## Configuration

### Gemini Configuration

```env
ENGINE=GEMINI
GEMINI_API_KEY=your_api_key_here
MODEL_NAME=gemini-2.0-flash-exp
```

### LLaMA Configuration

```env
ENGINE=LLAMA_CPP
LLAMA_MODEL_NAME=llama-3.1-8b-instruct
LLAMA_MODEL_PATH=/path/to/model.gguf
LLAMA_GPU_LAYERS=1
LLAMA_CONTEXT_SIZE=2048
```

## Usage

### Development Mode

```bash
npm run dev
```

### Build and Run

```bash
npm run build
npm start
```

### Run with Specific Session

```bash
npm run dev -- --session-id=<SESSION_ID>
```

## Available Commands

### Chat Commands

- `/help` - Display available commands
- `/exit` or `/quit` - Exit the chat
- `/switch <SESSION_ID>` - Switch to a different session

### Session Management

- `/session list` - List all available sessions
- `/session display` - Display full conversation history
- `/session pop` - Remove last exchange (user + assistant)
- `/session clear` - Clear current session history
- `/session new` - Start a new session
- `/session remove` - Remove current session and start fresh

### Export

- `/pdf` - Export current session to PDF

## Project Structure

```
azor-chatdog-ts/
├── src/
│   ├── index.ts                 # Entry point
│   ├── chat.ts                  # Main loop
│   ├── commandHandler.ts        # Command routing
│   ├── types.ts                 # TypeScript type definitions
│   ├── assistant/
│   │   ├── assistant.ts
│   │   └── azor.ts
│   ├── session/
│   │   ├── index.ts            # Session manager singleton
│   │   ├── chatSession.ts
│   │   └── sessionManager.ts
│   ├── llm/
│   │   ├── geminiClient.ts
│   │   ├── geminiValidation.ts
│   │   ├── llamaClient.ts
│   │   └── llamaValidation.ts
│   ├── cli/
│   │   ├── args.ts
│   │   ├── console.ts
│   │   └── prompt.ts
│   ├── commands/
│   │   ├── welcome.ts
│   │   ├── sessionList.ts
│   │   ├── sessionDisplay.ts
│   │   ├── sessionSummary.ts
│   │   ├── sessionToPdf.ts
│   │   └── sessionRemove.ts
│   └── files/
│       ├── config.ts
│       ├── sessionFiles.ts
│       ├── wal.ts
│       └── pdf/
│           ├── pdf.ts
│           └── fonts/           # Lato fonts
├── dist/                        # Compiled output
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Session Storage

Sessions are stored in `~/.azor/` directory:
- Session files: `~/.azor/<session-id>-log.json`
- WAL file: `~/.azor/azor-wal.json`
- PDF exports: `~/.azor/output/`

## Development

### Type Checking

```bash
npx tsc --noEmit
```

### Running Tests

```bash
npm test
```

## Migration from Python

This is a TypeScript port of the original Python `azor-chatdog` project. Key changes:

- **Type Safety**: Full TypeScript support with strict typing
- **Module System**: ESM modules with proper `.js` extensions
- **Async/Await**: Consistent async patterns throughout
- **Libraries**:
  - `colorama` → `chalk`
  - `prompt_toolkit` → `@inquirer/prompts`
  - `argparse` → `commander`
  - `pydantic` → `zod`
  - `fpdf` → `pdfkit`

## Troubleshooting

### LLaMA Model Issues

If you encounter issues loading LLaMA models:
- Ensure your model is in GGUF format
- Check that the path in `.env` is correct
- Adjust `LLAMA_GPU_LAYERS` based on your hardware

### Gemini API Issues

- Verify your API key is valid
- Check internet connectivity
- Ensure the model name is correct

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
