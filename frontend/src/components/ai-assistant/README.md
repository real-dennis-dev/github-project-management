# AI Assistant Module

## Overview

The AI Assistant module provides intelligent project analysis,问答, reporting, and action suggestions powered by AI.

## Features

- 🤖 **Ask AI**: Get intelligent answers about your project
- 📊 **Project Analysis**: Deep analysis with focus areas
- 📝 **Report Generation**: Generate comprehensive reports
- 🎯 **Next Actions**: AI-suggested actions for your project
- 📈 **Trend Analysis**: Identify patterns and predictions

## Components

### AIAssistant

Main container component that orchestrates all AI features.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| projectId | string | - | Project UUID |
| className | string | '' | Additional CSS classes |

### AIQuestionForm

Form for asking questions to the AI.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| onSubmit | function | - | Submit handler |
| loading | boolean | false | Loading state |
| onClear | function | - | Clear response handler |

### AIResponseDisplay

Displays AI responses with formatting.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| response | object | - | AI response data |
| conversation | object | - | Conversation data |
| onViewHistory | function | - | History view handler |

### ProjectAnalysis

Project analysis component with focus areas.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| onAnalyze | function | - | Analysis trigger |
| analysis | object | null | Analysis results |
| loading | boolean | false | Loading state |

### ReportGenerator

Report generation interface.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| onGenerate | function | - | Report generation handler |
| report | object | null | Generated report |
| loading | boolean | false | Loading state |

### NextActions

Displays AI-suggested actions.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| actions | object | null | Action items |
| loading | boolean | false | Loading state |
| onRefresh | function | - | Refresh handler |

### TrendAnalysis

Shows project trend analysis.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| trends | object | null | Trend data |
| loading | boolean | false | Loading state |
| onRefresh | function | - | Refresh handler |

## Hooks

### useAIAssistant

Custom hook for AI assistant functionality.

**Returns:**
| Property | Type | Description |
|----------|------|-------------|
| conversations | array | Conversation history |
| currentResponse | object | Current AI response |
| analysis | object | Analysis results |
| report | object | Generated report |
| trends | object | Trend data |
| actions | object | Suggested actions |
| loading | boolean | Loading state |
| error | string | Error message |
| askQuestion | function | Ask AI a question |
| analyzeProject | function | Analyze project |
| generateReport | function | Generate report |
| getTrends | function | Get trend analysis |
| getNextActions | function | Get suggested actions |
| getConversationHistory | function | Get conversation history |
| clearResponse | function | Clear current response |
| resetState | function | Reset all states |

## Services

### aiService

Service layer for AI API calls.

**Methods:**
| Method | Description |
|--------|-------------|
| getStatus | Get AI assistant status |
| askQuestion | Ask AI a question |
| analyzeProject | Analyze a project |
| generateReport | Generate a report |
| getTrends | Get trend analysis |
| getNextActions | Get suggested actions |
| getConversations | Get conversation history |
| getConversation | Get specific conversation |
| summarizeText | Summarize text |

## Usage Example

```jsx
import { AIAssistant, useAIAssistant } from "./components/ai-assistant";

// As a component
function ProjectPage({ projectId }) {
  return (
    <div className="container">
      <AIAssistant projectId={projectId} />
    </div>
  );
}

// Using the hook
function CustomAIView({ projectId }) {
  const { askQuestion, currentResponse, loading, error } =
    useAIAssistant(projectId);

  return (
    <div>
      <button onClick={() => askQuestion("What are the risks?")}>Ask AI</button>
      {loading && <Spinner />}
      {currentResponse && <Response data={currentResponse} />}
    </div>
  );
}
```
