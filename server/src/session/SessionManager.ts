import {
  GameSession,
  Player,
  ClientType,
  PLAYER_COLORS,
  createInitialSession,
} from '../types';

export class SessionManager {
  private session: GameSession = createInitialSession();
  private socketClientType = new Map<string, ClientType>();
  private socketPlayerId = new Map<string, string>();
  private hostSocketId: string | null = null;

  getSession(): GameSession {
    return this.session;
  }

  getClientType(socketId: string): ClientType | undefined {
    return this.socketClientType.get(socketId);
  }

  getPlayerId(socketId: string): string | undefined {
    return this.socketPlayerId.get(socketId);
  }

  isHostConnected(): boolean {
    return this.session.hostConnected;
  }

  canJoinAsPlayer(): { allowed: boolean; reason?: string } {
    if (this.session.players.length >= this.session.maxPlayers) {
      return { allowed: false, reason: 'Game is full' };
    }
    if (this.session.phase !== 'lobby') {
      return { allowed: false, reason: 'Game already in progress' };
    }
    return { allowed: true };
  }

  canStartGame(): { allowed: boolean; reason?: string } {
    if (this.session.players.length < this.session.minPlayers) {
      return {
        allowed: false,
        reason: `Need at least ${this.session.minPlayers} players to start`,
      };
    }
    return { allowed: true };
  }

  private getNextAvailableColor(): typeof PLAYER_COLORS[number] | null {
    const usedColors = new Set(this.session.players.map((p) => p.color));
    return PLAYER_COLORS.find((color) => !usedColors.has(color)) ?? null;
  }

  addHost(socketId: string): boolean {
    if (this.session.hostConnected) {
      return false;
    }

    this.session.hostConnected = true;
    this.hostSocketId = socketId;
    this.socketClientType.set(socketId, 'host');
    return true;
  }

  addPlayer(socketId: string, name: string): Player | null {
    const color = this.getNextAvailableColor();
    if (!color) {
      return null;
    }

    const player: Player = {
      id: socketId,
      name: name.trim() || `Player ${this.session.players.length + 1}`,
      color,
      isConnected: true,
    };

    this.session.players.push(player);
    this.socketClientType.set(socketId, 'player');
    this.socketPlayerId.set(socketId, player.id);

    return player;
  }

  startGame(): void {
    this.session.phase = 'playing';
  }

  removeClient(socketId: string): { type: ClientType | undefined; playerId?: string } {
    const clientType = this.socketClientType.get(socketId);

    if (clientType === 'host') {
      this.session.hostConnected = false;
      this.hostSocketId = null;
    } else if (clientType === 'player') {
      const playerId = this.socketPlayerId.get(socketId);
      if (playerId) {
        if (this.session.phase === 'lobby') {
          this.session.players = this.session.players.filter((p) => p.id !== playerId);
        } else {
          const player = this.session.players.find((p) => p.id === playerId);
          if (player) {
            player.isConnected = false;
          }
        }
        this.socketPlayerId.delete(socketId);
        return { type: clientType, playerId };
      }
    }

    this.socketClientType.delete(socketId);
    return { type: clientType };
  }
}

export const sessionManager = new SessionManager();

