import { Sandbox } from '@vercel/sandbox';

export interface SandboxExecutionResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
}

export interface SandboxSession {
  id: string;
  sandbox: Sandbox;
  createdAt: number;
  lastUsedAt: number;
}

export type Runtime = 'node24' | 'node22' | 'python3.13';

class SandboxManager {
  private sessions: Map<string, SandboxSession> = new Map();
  private maxSessions: number = 5;
  private sessionTimeout: number = 30 * 60 * 1000; // 30 minutes

  async createSession(runtime: Runtime = 'node24'): Promise<string> {
    // Clean up old sessions if at limit
    if (this.sessions.size >= this.maxSessions) {
      this.cleanupOldestSession();
    }

    const sandbox = await Sandbox.create({
      runtime,
    });

    const sessionId = `sandbox-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const session: SandboxSession = {
      id: sessionId,
      sandbox,
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
    };

    this.sessions.set(sessionId, session);
    return sessionId;
  }

  async executeCommand(
    sessionId: string,
    command: string,
    args: string[] = []
  ): Promise<SandboxExecutionResult> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.lastUsedAt = Date.now();
    const startTime = Date.now();

    try {
      const result = await session.sandbox.runCommand(command, args);
      
      // stdout and stderr are async functions
      const stdout = await result.stdout();
      const stderr = await result.stderr();

      return {
        stdout: stdout || '',
        stderr: stderr || '',
        exitCode: result.exitCode,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        stdout: '',
        stderr: error instanceof Error ? error.message : 'Unknown error',
        exitCode: 1,
        duration: Date.now() - startTime,
      };
    }
  }

  async executeCode(
    sessionId: string,
    code: string,
    runtime: Runtime = 'node24'
  ): Promise<SandboxExecutionResult> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.lastUsedAt = Date.now();
    const startTime = Date.now();

    try {
      let command: string;
      let args: string[];

      if (runtime.startsWith('node')) {
        command = 'node';
        args = ['-e', code];
      } else if (runtime.startsWith('python')) {
        command = 'python3';
        args = ['-c', code];
      } else {
        throw new Error(`Unsupported runtime: ${runtime}`);
      }

      const result = await session.sandbox.runCommand(command, args);
      
      // stdout and stderr are async functions
      const stdout = await result.stdout();
      const stderr = await result.stderr();

      return {
        stdout: stdout || '',
        stderr: stderr || '',
        exitCode: result.exitCode,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        stdout: '',
        stderr: error instanceof Error ? error.message : 'Unknown error',
        exitCode: 1,
        duration: Date.now() - startTime,
      };
    }
  }

  async destroySession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      // Sandbox doesn't have kill, it auto-cleans up
      this.sessions.delete(sessionId);
    }
  }

  getSessionInfo(sessionId: string): { id: string; createdAt: number; lastUsedAt: number } | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    
    return {
      id: session.id,
      createdAt: session.createdAt,
      lastUsedAt: session.lastUsedAt,
    };
  }

  listSessions(): string[] {
    return Array.from(this.sessions.keys());
  }

  private cleanupOldestSession(): void {
    let oldest: SandboxSession | null = null;
    let oldestId: string = '';

    for (const [id, session] of this.sessions.entries()) {
      if (!oldest || session.lastUsedAt < oldest.lastUsedAt) {
        oldest = session;
        oldestId = id;
      }
    }

    if (oldest) {
      this.destroySession(oldestId);
    }
  }

  async cleanupInactiveSessions(): Promise<void> {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [id, session] of this.sessions.entries()) {
      if (now - session.lastUsedAt > this.sessionTimeout) {
        toDelete.push(id);
      }
    }

    for (const id of toDelete) {
      await this.destroySession(id);
    }
  }
}

// Export singleton instance
export const sandboxManager = new SandboxManager();

// Quick execution for one-off commands
export async function quickExecute(
  code: string,
  runtime: Runtime = 'node24'
): Promise<SandboxExecutionResult> {
  const sandbox = await Sandbox.create({ runtime });
  
  try {
    const startTime = Date.now();
    let command: string;
    let args: string[];

    if (runtime.startsWith('node')) {
      command = 'node';
      args = ['-e', code];
    } else if (runtime.startsWith('python')) {
      command = 'python3';
      args = ['-c', code];
    } else {
      throw new Error(`Unsupported runtime: ${runtime}`);
    }

    const result = await sandbox.runCommand(command, args);
    
    // stdout and stderr are async functions
    const stdout = await result.stdout();
    const stderr = await result.stderr();
    
    return {
      stdout: stdout || '',
      stderr: stderr || '',
      exitCode: result.exitCode,
      duration: Date.now() - startTime,
    };
  } finally {
    // Sandbox auto-cleans up
  }
}

export default sandboxManager;
