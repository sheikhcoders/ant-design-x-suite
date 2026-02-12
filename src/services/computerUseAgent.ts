import OpenAI from 'openai';
import { desktopSandboxManager } from './desktopSandbox';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

export interface ComputerUseAction {
  type: 'click' | 'type' | 'keypress' | 'scroll' | 'wait' | 'screenshot' | 'launch';
  x?: number;
  y?: number;
  text?: string;
  keys?: string[];
  amount?: number;
  duration?: number;
  app?: string;
  reasoning?: string;
}

export interface ComputerUseResponse {
  reasoning: string;
  actions: ComputerUseAction[];
  isComplete: boolean;
}

export interface AgentMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  actions?: ComputerUseAction[];
  screenshot?: string;
  timestamp: number;
}

class ComputerUseAgent {
  private openai: OpenAI;
  private isRunning: boolean = false;
  private currentSandboxId: string | null = null;

  constructor() {
    this.openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });
  }

  async initialize(sandboxId: string): Promise<void> {
    this.currentSandboxId = sandboxId;
    this.isRunning = true;
  }

  async processInstruction(
    instruction: string,
    onAction: (action: ComputerUseAction) => void,
    onMessage: (message: string) => void,
    onComplete: () => void
  ): Promise<void> {
    if (!this.currentSandboxId || !this.isRunning) {
      throw new Error('Agent not initialized. Call initialize() first.');
    }

    try {
      // Take initial screenshot
      const screenshot = await desktopSandboxManager.screenshot(this.currentSandboxId);
      const screenshotBase64 = Buffer.from(screenshot).toString('base64');

      // Prepare the conversation
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        {
          role: 'system',
          content: `You are a Computer Use Agent that can interact with a virtual desktop environment. 

You have access to the following actions:
1. click - Click at specific coordinates (x, y)
2. type - Type text at the current cursor position
3. keypress - Press keyboard keys (e.g., ['enter'], ['ctrl', 'c'], ['alt', 'f4'])
4. scroll - Scroll up or down (positive = up, negative = down)
5. wait - Wait for a specified duration in milliseconds
6. screenshot - Take a screenshot to see the current state
7. launch - Launch an application by name (e.g., 'google-chrome', 'vscode', 'firefox')

When given an instruction, you should:
1. Analyze the current screenshot
2. Think step-by-step about what needs to be done
3. Provide clear reasoning for your actions
4. Execute actions one at a time
5. Wait for applications to load before interacting
6. Take screenshots after important actions to verify state

Respond in JSON format with the following structure:
{
  "reasoning": "Your detailed reasoning about what to do",
  "actions": [
    {"type": "click", "x": 100, "y": 200},
    {"type": "type", "text": "Hello World"},
    {"type": "keypress", "keys": ["enter"]},
    {"type": "wait", "duration": 2000}
  ],
  "isComplete": false
}

Set isComplete to true when the task is finished.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Instruction: ${instruction}\n\nCurrent screenshot is provided. Analyze it and take appropriate actions.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${screenshotBase64}`,
              },
            },
          ],
        },
      ];

      // Call OpenAI API with function calling
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages,
        response_format: { type: 'json_object' },
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const result: ComputerUseResponse = JSON.parse(content);
      
      // Send reasoning to the user
      onMessage(result.reasoning);

      // Execute actions
      for (const action of result.actions) {
        if (!this.isRunning) break;

        // Notify about the action
        onAction(action);

        // Execute the action on the sandbox
        await this.executeAction(action);

        // Wait a bit between actions
        if (action.type !== 'wait') {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Take final screenshot
      const finalScreenshot = await desktopSandboxManager.screenshot(this.currentSandboxId);
      
      if (result.isComplete) {
        onComplete();
      } else {
        // Continue processing if not complete
        onMessage('Taking another screenshot to continue...');
        await this.processInstruction(
          'Continue from where you left off',
          onAction,
          onMessage,
          onComplete
        );
      }

    } catch (error) {
      console.error('Computer Use Agent error:', error);
      onMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      onComplete();
    }
  }

  private async executeAction(action: ComputerUseAction): Promise<void> {
    if (!this.currentSandboxId) {
      throw new Error('No sandbox initialized');
    }

    const sandboxId = this.currentSandboxId;

    switch (action.type) {
      case 'click':
        if (action.x !== undefined && action.y !== undefined) {
          await desktopSandboxManager.leftClick(sandboxId, action.x, action.y);
        }
        break;

      case 'type':
        if (action.text) {
          await desktopSandboxManager.write(sandboxId, action.text, {
            chunkSize: 50,
            delayInMs: 25,
          });
        }
        break;

      case 'keypress':
        if (action.keys && action.keys.length > 0) {
          await desktopSandboxManager.press(sandboxId, action.keys);
        }
        break;

      case 'scroll':
        if (action.amount !== undefined) {
          await desktopSandboxManager.scroll(sandboxId, action.amount);
        }
        break;

      case 'wait':
        if (action.duration) {
          await desktopSandboxManager.wait(sandboxId, action.duration);
        }
        break;

      case 'screenshot':
        // Screenshots are taken automatically between actions
        await desktopSandboxManager.wait(sandboxId, 500);
        break;

      case 'launch':
        if (action.app) {
          await desktopSandboxManager.launchApp(sandboxId, action.app);
          // Wait for app to load
          await desktopSandboxManager.wait(sandboxId, 5000);
        }
        break;

      default:
        console.warn('Unknown action type:', action.type);
    }
  }

  stop(): void {
    this.isRunning = false;
  }

  isActive(): boolean {
    return this.isRunning;
  }

  getSandboxId(): string | null {
    return this.currentSandboxId;
  }
}

// Export singleton instance
export const computerUseAgent = new ComputerUseAgent();

// Example prompts for users
export const EXAMPLE_PROMPTS = [
  'Open Chrome and search for "TypeScript tutorials"',
  'Open VS Code and create a new file called "hello.txt"',
  'Take a screenshot of the current desktop',
  'Open the terminal and run "ls -la"',
  'Open Firefox and navigate to github.com',
  'Create a folder called "Projects" on the desktop',
  'Open GIMP and create a new image',
  'Type "Hello World" in the currently focused text field',
  'Close the currently open window',
  'Minimize all windows',
];

export default computerUseAgent;
