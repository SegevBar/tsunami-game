import {
  GameSession,
  GameState,
  PublicGameState,
  Player,
  PlayerHand,
  ClientType,
  PLAYER_COLORS,
  createInitialSession,
} from '../types';
import { createDeck, shuffleDeck, drawCards } from '../game';

const INITIAL_HAND_SIZE = 5;

export class SessionManager {
  private session: GameSession = createInitialSession();
  private fullGameState: GameState | null = null;
  private socketClientType = new Map<string, ClientType>();
  private socketPlayerId = new Map<string, string>();
  private hostSocketId: string | null = null;

  getSession(): GameSession {
    return this.session;
  }

  getFullGameState(): GameState | null {
    return this.fullGameState;
  }

  getPublicGameState(): PublicGameState | null {
    if (!this.fullGameState) return null;

    return {
      turn: this.fullGameState.turn,
      deckCount: this.fullGameState.deck.length,
      hands: this.fullGameState.hands.map((hand) => ({
        playerId: hand.playerId,
        cardCount: hand.cards.length,
      })),
    };
  }

  getPlayerHand(playerId: string): PlayerHand | null {
    if (!this.fullGameState) return null;
    return this.fullGameState.hands.find((h) => h.playerId === playerId) || null;
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

  getCurrentPlayer(): Player | null {
    if (!this.session.gameState) return null;
    return this.session.players[this.session.gameState.turn.currentPlayerIndex] || null;
  }

  getCurrentPlayerId(): string | null {
    const player = this.getCurrentPlayer();
    return player?.id || null;
  }

  isPlayerTurn(playerId: string): boolean {
    return this.getCurrentPlayerId() === playerId;
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

    // Create and shuffle deck
    const playerCount = this.session.players.length;
    let deck = createDeck(playerCount);
    deck = shuffleDeck(deck);

    // Deal initial hands
    const hands: PlayerHand[] = [];
    for (const player of this.session.players) {
      const { drawn, remaining } = drawCards(deck, INITIAL_HAND_SIZE);
      hands.push({
        playerId: player.id,
        cards: drawn,
      });
      deck = remaining;
    }

    // Set full game state (server-side)
    this.fullGameState = {
      turn: {
        currentPlayerIndex: 0,
        turnNumber: 1,
        roundNumber: 1,
      },
      deck,
      hands,
    };

    // Set public game state (client-side)
    this.session.gameState = this.getPublicGameState();
  }

  endTurn(): { nextPlayer: Player; turnNumber: number; roundNumber: number } | null {
    if (!this.fullGameState || this.session.phase !== 'playing') {
      return null;
    }

    const { turn } = this.fullGameState;
    const playerCount = this.session.players.length;

    // Move to next player
    turn.currentPlayerIndex = (turn.currentPlayerIndex + 1) % playerCount;
    turn.turnNumber++;

    // Check if we completed a round (back to first player)
    if (turn.currentPlayerIndex === 0) {
      turn.roundNumber++;
    }

    // Update public game state
    this.session.gameState = this.getPublicGameState();

    const nextPlayer = this.session.players[turn.currentPlayerIndex];

    return {
      nextPlayer,
      turnNumber: turn.turnNumber,
      roundNumber: turn.roundNumber,
    };
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
