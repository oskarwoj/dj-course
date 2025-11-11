# Plan migracji azor-chatdog → TypeScript

## 1. Struktura projektu (azor-chatdog-ts/)

```
azor-chatdog-ts/
├── src/
│   ├── index.ts                    # Entry point (zastępuje run.py)
│   ├── chat.ts                     # Main loop
│   ├── commandHandler.ts           # Command routing
│   ├── assistant/
│   │   ├── assistant.ts
│   │   └── azor.ts
│   ├── session/
│   │   ├── index.ts               # Export session manager singleton
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
│           └── fonts/              # Lato fonts
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 2. Technologie i zależności

### Core
- TypeScript 5.x
- Node.js 20+ (dla native ESM)
- tsx (development), tsc (production build)

### Biblioteki
- `@google/generative-ai` - Gemini API
- `node-llama-cpp` - LLaMA binding dla Node.js
- `@inquirer/prompts` - Interactive CLI z autocomplete
- `chalk` - Kolorowy output
- `zod` - Walidacja konfiguracji (zamiennik Pydantic)
- `pdfkit` + `markdown-it` - PDF generation
- `commander` - CLI arguments
- `dotenv` - Environment variables

## 3. Kolejność implementacji

### Faza 1: Fundament
1. Inicjalizacja projektu (package.json, tsconfig.json z ESM)
2. `src/files/config.ts` - Konfiguracja katalogów
3. `src/cli/console.ts` - Kolorowy output (chalk)
4. Typy TypeScript dla history, messages, sessions

### Faza 2: Persistence
5. `src/files/sessionFiles.ts` - Load/save sesji (fs/promises)
6. `src/files/wal.ts` - Write-Ahead Log
7. `src/assistant/` - Assistant configuration

### Faza 3: LLM Clients
8. `src/llm/geminiValidation.ts` + `geminiClient.ts`
9. `src/llm/llamaValidation.ts` + `llamaClient.ts`
10. Unified LLM interface z wrapper klasami

### Faza 4: Session Management
11. `src/session/chatSession.ts` - Core session logic
12. `src/session/sessionManager.ts` - Lifecycle orchestration
13. `src/session/index.ts` - Singleton export

### Faza 5: CLI & Commands
14. `src/cli/args.ts` - Commander.js argument parsing
15. `src/cli/prompt.ts` - Inquirer interactive prompt
16. `src/commands/` - Wszystkie komendy slash
17. `src/commandHandler.ts` - Command routing

### Faza 6: Main Loop & PDF
18. `src/chat.ts` - Main loop i inicjalizacja
19. `src/files/pdf/pdf.ts` - PDF generation
20. `src/index.ts` - Entry point
21. Build scripts i testing

## 4. Kluczowe różnice w implementacji

### TypeScript vs Python
- Zamiast `@property` → gettery/settery
- Zamiast `@classmethod` → static methods
- Zamiast Pydantic models → Zod schemas + TypeScript interfaces
- Zamiast `atexit` → `process.on('exit', ...)` i `process.on('SIGINT', ...)`
- JSON serialization: Python's `json` → `JSON.stringify/parse`
- Path handling: `os.path` → `path` module z Node.js

### package.json config
```json
{
  "name": "azor-chatdog-ts",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "bin": {
    "azor": "./dist/index.js"
  },
  "scripts": {
    "dev": "tsx src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@google/generative-ai": "^0.21.0",
    "@inquirer/prompts": "^7.0.0",
    "chalk": "^5.3.0",
    "commander": "^12.0.0",
    "dotenv": "^16.4.0",
    "markdown-it": "^14.0.0",
    "node-llama-cpp": "^3.0.0",
    "pdfkit": "^0.15.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/pdfkit": "^0.13.0",
    "tsx": "^4.0.0",
    "typescript": "^5.6.0"
  }
}
```

### tsconfig.json (ESM)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node16",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## 5. Mapowanie kluczowych klas i funkcji

### Python → TypeScript

| Python | TypeScript | Uwagi |
|--------|-----------|-------|
| `chat.py::init_chat()` | `chat.ts::initChat()` | camelCase |
| `chat.py::main_loop()` | `chat.ts::mainLoop()` | async function |
| `ChatSession` class | `ChatSession` class | Gettery zamiast @property |
| `SessionManager` class | `SessionManager` class | Singleton pattern |
| `GeminiLLMClient` | `GeminiLLMClient` | Użyj @google/generative-ai |
| `LlamaClient` | `LlamaClient` | Użyj node-llama-cpp |
| `Assistant` dataclass | `Assistant` interface + class | TypeScript types |
| `get_session_manager()` | `getSessionManager()` | Module-level singleton |
| `command_handler.py` | `commandHandler.ts` | Switch/case lub object map |

### Typy które trzeba stworzyć

```typescript
// Message types
interface MessagePart {
  text: string;
}

interface Message {
  role: 'user' | 'model';
  parts: MessagePart[];
  timestamp?: string;
}

type ChatHistory = Message[];

// Session types
interface SessionMetadata {
  session_id: string;
  model: string;
  system_role: string;
  history: ChatHistory;
}

// Token info
interface TokenInfo {
  used: number;
  limit: number;
  percentage: number;
}

// LLM Response
interface LLMResponse {
  text: string;
  tokensUsed?: number;
}
```

## 6. Wyzwania specyficzne

### 6.1 LLaMA binding
`node-llama-cpp` ma znacząco inny API niż Python `llama-cpp-python`:
- Inicjalizacja modelu: `LlamaModel.load()`
- Chat session: `model.createChatSession()`
- Asynchroniczne API

Trzeba będzie stworzyć wrapper, który normalizuje interface.

### 6.2 PDF fonts
Fonty Lato (.ttf) trzeba skopiować z:
```
azor-chatdog/src/files/pdf/Lato/*.ttf
→ azor-chatdog-ts/src/files/pdf/fonts/*.ttf
```

W kodzie PDF:
```typescript
import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

doc.font(join(__dirname, 'fonts', 'Lato-Regular.ttf'));
```

### 6.3 Prompt autocomplete
`@inquirer/prompts` działa inaczej niż `prompt_toolkit`. Zamiast własnego Lexera i Completer:

```typescript
import { input } from '@inquirer/prompts';
import chalk from 'chalk';

// Prosta wersja bez autocomplete
const answer = await input({
  message: 'You: ',
  transformer: (value) => {
    // Highlight slash commands
    if (value.startsWith('/')) {
      return chalk.magenta(value);
    }
    return value;
  }
});
```

Dla pełnego autocomplete może być potrzebna biblioteka `inquirer-autocomplete-prompt`.

### 6.4 Token counting
- **Gemini:** SDK ma wbudowane `countTokens()` API
- **LLaMA:** `node-llama-cpp` zwraca tokeny w odpowiedzi, trzeba je sumować

### 6.5 Graceful shutdown
```typescript
// Zamiennik Python atexit
process.on('exit', (code) => {
  // Cleanup
});

process.on('SIGINT', () => {
  // Ctrl+C handler
  console.log('\nShutting down...');
  // Save session
  process.exit(0);
});

process.on('SIGTERM', () => {
  // Termination signal
  process.exit(0);
});
```

## 7. Testowanie po implementacji

### Po każdej fazie:

**Faza 1 - Fundament:**
- Sprawdź czy projekt się kompiluje: `npm run build`
- Sprawdź czy katalogi są tworzone poprawnie
- Test console output z kolorami

**Faza 2 - Persistence:**
- Test zapisu/odczytu sesji
- Test WAL logging
- Test list_sessions()

**Faza 3 - LLM Clients:**
- Test połączenia z Gemini (mocked lub real API)
- Test ładowania modelu LLaMA
- Test unified interface

**Faza 4 - Session Management:**
- Test create/switch sessions
- Test message send/receive
- Test token counting

**Faza 5 - CLI & Commands:**
- Test każdej komendy slash
- Test interactive prompt
- Test argument parsing

**Faza 6 - Main Loop & PDF:**
- Test pełnego flow: init → chat → save → exit
- Test PDF generation
- Test resume session

### Finalny test:
1. Stwórz sesję w Python wersji
2. Zapisz do JSON
3. Wczytaj w TypeScript wersji
4. Kontynuuj konwersację
5. Sprawdź czy wszystkie features działają

## 8. Migracja danych

Sesje zapisane przez Python version powinny być kompatybilne z TS version, ponieważ:
- Używamy tego samego formatu JSON
- Te same katalogi (`~/.azor/`)
- Ten sam format historii

Jedyna różnica: Python może używać `timestamp` jako string ISO, TypeScript też to obsłuży.

## 9. Dodatkowe usprawnienia (opcjonalne)

Po zakończeniu podstawowej migracji można rozważyć:

1. **Error handling:** Lepsze typy błędów z class hierarchy
2. **Logging:** Dodać `winston` lub `pino` dla strukturalnych logów
3. **Testing:** Dodać `vitest` dla unit testów
4. **CLI improvements:** Rich formatting z `cli-table3`
5. **Config file:** `.azorrc.json` zamiast tylko env vars
6. **Streaming responses:** Dla lepszego UX przy długich odpowiedziach
7. **Multiple assistants:** Możliwość przełączania między różnymi konfiguracjami

## 10. Checklist implementacji

- [ ] Inicjalizacja projektu (npm init, tsconfig, .gitignore)
- [ ] Instalacja wszystkich dependencies
- [ ] Skopiowanie fontów Lato
- [ ] Implementacja config.ts
- [ ] Implementacja console.ts
- [ ] Implementacja sessionFiles.ts
- [ ] Implementacja wal.ts
- [ ] Implementacja assistant classes
- [ ] Implementacja geminiClient.ts
- [ ] Implementacja llamaClient.ts
- [ ] Implementacja chatSession.ts
- [ ] Implementacja sessionManager.ts
- [ ] Implementacja args.ts
- [ ] Implementacja prompt.ts
- [ ] Implementacja wszystkich commands
- [ ] Implementacja commandHandler.ts
- [ ] Implementacja chat.ts
- [ ] Implementacja pdf.ts
- [ ] Implementacja index.ts
- [ ] Build i test całości
- [ ] Test z prawdziwymi API keys
- [ ] Dokumentacja README.md
- [ ] .env.example

## 11. Timeline

Przy pełnej koncentracji:
- **Faza 1-2:** 2-3 godziny (setup + persistence)
- **Faza 3:** 3-4 godziny (LLM clients - najbardziej złożone)
- **Faza 4:** 2-3 godziny (session management)
- **Faza 5:** 3-4 godziny (CLI + wszystkie commands)
- **Faza 6:** 2-3 godziny (main loop + PDF)
- **Testing:** 2-3 godziny

**Razem:** ~15-20 godzin efektywnej pracy

## 12. Potencjalne problemy

1. **node-llama-cpp może wymagać kompilacji natywnej** - długi czas instalacji
2. **ESM + TypeScript** - mogą być problemy z importami (szczególnie JSON)
3. **PDF generation** - pdfkit może mieć problemy z UTF-8/Polish characters
4. **Inquirer prompts** - może nie mieć takiego samego UX jak prompt_toolkit
5. **File paths** - różnice Windows/Unix trzeba obsłużyć

## 13. Referencje

- [Google Generative AI Node.js SDK](https://github.com/google/generative-ai-js)
- [node-llama-cpp](https://github.com/withcatai/node-llama-cpp)
- [Inquirer prompts](https://github.com/SBoudrias/Inquirer.js)
- [Chalk](https://github.com/chalk/chalk)
- [Zod](https://zod.dev/)
- [PDFKit](https://pdfkit.org/)
- [Commander.js](https://github.com/tj/commander.js)
