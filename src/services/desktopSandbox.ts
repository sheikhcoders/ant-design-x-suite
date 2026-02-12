import { Sandbox } from '@e2b/desktop';

export interface DesktopSandboxConfig {
  app?: string;
  timeout?: number;
}

export interface DesktopStreamConfig {
  windowId?: string;
  requireAuth?: boolean;
  viewOnly?: boolean;
}

export interface DesktopSandboxInfo {
  id: string;
  streamUrl?: string;
  authKey?: string;
  isStreaming: boolean;
}

export interface MousePosition {
  x: number;
  y: number;
}

export interface TypingOptions {
  chunkSize?: number;
  delayInMs?: number;
}

export interface ScreenshotResult {
  data: Buffer;
  saveToFile(path: string): void;
}

class DesktopSandboxManager {
  private sandboxes: Map<string, Sandbox> = new Map();
  private streamConfigs: Map<string, DesktopStreamConfig> = new Map();

  async createSandbox(config: DesktopSandboxConfig = {}): Promise<DesktopSandboxInfo> {
    const opts: any = {};
    if (config.timeout) {
      opts.timeoutMs = config.timeout;
    }
    
    const desktop = await Sandbox.create(opts);
    
    // Access sandboxId from the sandbox instance
    const sandboxId = (desktop as any).sandboxId || Date.now().toString();
    
    const info: DesktopSandboxInfo = {
      id: sandboxId,
      isStreaming: false,
    };

    this.sandboxes.set(sandboxId, desktop);

    // Launch application if specified
    if (config.app) {
      await desktop.launch(config.app);
      // Wait for application to open
      await desktop.wait(10000);
    }

    return info;
  }

  // Stream Management
  async startStream(sandboxId: string, config: DesktopStreamConfig = {}): Promise<DesktopSandboxInfo> {
    const desktop = this.sandboxes.get(sandboxId);
    if (!desktop) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }

    const windowId = config.windowId || await desktop.getCurrentWindowId();
    
    await desktop.stream.start({
      windowId,
      requireAuth: config.requireAuth ?? true,
    });

    const authKey = desktop.stream.getAuthKey();
    const streamUrl = desktop.stream.getUrl({ 
      authKey,
      viewOnly: config.viewOnly 
    });

    const info: DesktopSandboxInfo = {
      id: sandboxId,
      streamUrl,
      authKey,
      isStreaming: true,
    };

    this.streamConfigs.set(sandboxId, config);
    return info;
  }

  async stopStream(sandboxId: string): Promise<void> {
    const desktop = this.sandboxes.get(sandboxId);
    if (!desktop) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }

    await desktop.stream.stop();
  }

  // Application Management
  async launchApp(sandboxId: string, app: string): Promise<void> {
    const desktop = this.sandboxes.get(sandboxId);
    if (!desktop) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }

    await desktop.launch(app);
    await desktop.wait(10000);
  }

  async openFile(sandboxId: string, filePath: string): Promise<void> {
    const desktop = this.sandboxes.get(sandboxId);
    if (!desktop) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }

    await desktop.open(filePath);
  }

  // Command Execution
  async executeCommand(sandboxId: string, command: string): Promise<string> {
    const desktop = this.sandboxes.get(sandboxId);
    if (!desktop) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }

    const result = await desktop.commands.run(command);
    return result.stdout || '';
  }

  // Mouse Interactions
  async doubleClick(sandboxId: string): Promise<void> {
    const desktop = this.sandboxes.get(sandboxId);
    if (!desktop) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }
    await desktop.doubleClick();
  }

  async leftClick(sandboxId: string, x?: number, y?: number): Promise<void> {
    const desktop = this.sandboxes.get(sandboxId);
    if (!desktop) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }
    if (x !== undefined && y !== undefined) {
      await desktop.leftClick(x, y);
    } else {
      await desktop.leftClick();
    }
  }

  async rightClick(sandboxId: string, x?: number, y?: number): Promise<void> {
    const desktop = this.sandboxes.get(sandboxId);
    if (!desktop) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }
    if (x !== undefined && y !== undefined) {
      await desktop.rightClick(x, y);
    } else {
      await desktop.rightClick();
    }
  }

  async middleClick(sandboxId: string, x?: number, y?: number): Promise<void> {
    const desktop = this.sandboxes.get(sandboxId);
    if (!desktop) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }
    if (x !== undefined && y !== undefined) {
      await desktop.middleClick(x, y);
    } else {
      await desktop.middleClick();
    }
  }

  async scroll(sandboxId: string, amount: number): Promise<void> {
    const desktop = this.sandboxes.get(sandboxId);
    if (!desktop) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }
    await desktop.scroll(amount);
  }

  async moveMouse(sandboxId: string, x: number, y: number): Promise<void> {
    const desktop = this.sandboxes.get(sandboxId);
    if (!desktop) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }
    await desktop.moveMouse(x, y);
  }

  async drag(sandboxId: string, from: MousePosition, to: MousePosition): Promise<void> {
    const desktop = this.sandboxes.get(sandboxId);
    if (!desktop) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }
    await desktop.drag([from.x, from.y], [to.x, to.y]);
  }

  async mousePress(sandboxId: string, button: 'left' | 'right' | 'middle' = 'left'): Promise<void> {
    const desktop = this.sandboxes.get(sandboxId);
    if (!desktop) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }
    await desktop.mousePress(button);
  }

  async mouseRelease(sandboxId: string, button: 'left' | 'right' | 'middle' = 'left'): Promise<void> {
    const desktop = this.sandboxes.get(sandboxId);
    if (!desktop) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }
    await desktop.mouseRelease(button);
  }

  // Keyboard Interactions
  async write(sandboxId: string, text: string, options?: TypingOptions): Promise<void> {
    const desktop = this.sandboxes.get(sandboxId);
    if (!desktop) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }
    await desktop.write(text, options);
  }

  async press(sandboxId: string, key: string | string[]): Promise<void> {
    const desktop = this.sandboxes.get(sandboxId);
    if (!desktop) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }
    await desktop.press(key);
  }

  // Window Management
  async getCurrentWindowId(sandboxId: string): Promise<string> {
    const desktop = this.sandboxes.get(sandboxId);
    if (!desktop) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }
    return await desktop.getCurrentWindowId();
  }

  async getApplicationWindows(sandboxId: string, app: string): Promise<string[]> {
    const desktop = this.sandboxes.get(sandboxId);
    if (!desktop) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }
    return await desktop.getApplicationWindows(app);
  }

  async getWindowTitle(sandboxId: string, windowId: string): Promise<string> {
    const desktop = this.sandboxes.get(sandboxId);
    if (!desktop) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }
    return await desktop.getWindowTitle(windowId);
  }

  // Screenshots
  async screenshot(sandboxId: string): Promise<Buffer> {
    const desktop = this.sandboxes.get(sandboxId);
    if (!desktop) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }
    return await desktop.screenshot();
  }

  // File Operations
  async writeFile(sandboxId: string, filePath: string, content: string): Promise<void> {
    const desktop = this.sandboxes.get(sandboxId);
    if (!desktop) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }
    await desktop.files.write(filePath, content);
  }

  async readFile(sandboxId: string, filePath: string): Promise<string> {
    const desktop = this.sandboxes.get(sandboxId);
    if (!desktop) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }
    return await desktop.files.read(filePath);
  }

  // Utility
  async wait(sandboxId: string, ms: number): Promise<void> {
    const desktop = this.sandboxes.get(sandboxId);
    if (!desktop) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }
    await desktop.wait(ms);
  }

  async killSandbox(sandboxId: string): Promise<void> {
    const desktop = this.sandboxes.get(sandboxId);
    if (desktop) {
      await desktop.kill();
      this.sandboxes.delete(sandboxId);
      this.streamConfigs.delete(sandboxId);
    }
  }

  getSandbox(sandboxId: string): Sandbox | undefined {
    return this.sandboxes.get(sandboxId);
  }

  listSandboxes(): string[] {
    return Array.from(this.sandboxes.keys());
  }
}

// Export singleton instance
export const desktopSandboxManager = new DesktopSandboxManager();

// Quick start with streaming
export async function quickStartDesktop(
  app: string = 'google-chrome',
  requireAuth: boolean = true,
  viewOnly: boolean = false
): Promise<DesktopSandboxInfo> {
  const desktop = await Sandbox.create();
  
  await desktop.launch(app);
  await desktop.wait(10000);

  const windowId = await desktop.getCurrentWindowId();
  
  await desktop.stream.start({
    windowId,
    requireAuth,
  });

  const authKey = desktop.stream.getAuthKey();
  const streamUrl = desktop.stream.getUrl({ authKey, viewOnly });

  // Use sandboxId from the desktop instance
  const sandboxId = (desktop as any).sandboxId || Date.now().toString();

  return {
    id: sandboxId,
    streamUrl,
    authKey,
    isStreaming: true,
  };
}

export default desktopSandboxManager;
