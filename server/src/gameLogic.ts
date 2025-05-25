import { v4 as uuidv4 } from 'uuid';
import { 
  Card, 
  CardColor, 
  CardType, 
  GameState, 
  Player, 
  Building, 
  GameMove, 
  BuildMove, 
  ReinforceMove, 
  AttackMove, 
  MoveValidation 
} from './types.js';

export class TsunamiGameLogic {
  private static readonly COLORS: CardColor[] = ['red', 'blue', 'green', 'yellow'];
  private static readonly BUILDINGS_PER_PLAYER = 6;
  private static readonly INITIAL_HAND_SIZE = 5;
  private static readonly MAX_HAND_SIZE = 10;

  // Deck Creation
  static createDeck(numPlayers: number): { deck: Card[], tsunamiNumbers: number[] } {
    const cards: Card[] = [];
    
    // Create basic deck for each player
    for (let playerDeck = 0; playerDeck < numPlayers; playerDeck++) {
      // Add foundation cards (2 per color)
      for (const color of this.COLORS) {
        for (let i = 0; i < 2; i++) {
          cards.push({
            id: uuidv4(),
            type: 'foundation',
            color,
            value: 0
          });
        }
      }

      // Add regular cards (1-5 for each color)
      for (const color of this.COLORS) {
        for (let value = 1; value <= 5; value++) {
          cards.push({
            id: uuidv4(),
            type: 'regular',
            color,
            value
          });
        }
      }

      // Add roof cards (1 per color)
      for (const color of this.COLORS) {
        cards.push({
          id: uuidv4(),
          type: 'roof',
          color,
          value: 6
        });
      }
    }

    // Shuffle the regular cards
    this.shuffleArray(cards);

    // Generate 3 random tsunami numbers (1-6)
    const tsunamiNumbers = this.generateTsunamiNumbers();
    
    // Calculate tsunami positions
    const deckSize = cards.length;
    const reducedSize = deckSize - (numPlayers * 5);
    
    const firstTsunamiPos = Math.floor(reducedSize / 6) + Math.floor(Math.random() * (reducedSize / 3));
    const secondTsunamiPos = Math.floor(reducedSize / 2) + Math.floor(Math.random() * (reducedSize / 3));
    const thirdTsunamiPos = cards.length; // Last card

    // Insert tsunami cards
    const tsunamiCards = tsunamiNumbers.map(value => ({
      id: uuidv4(),
      type: 'tsunami' as CardType,
      value
    }));

    // Insert tsunamis in reverse order to maintain positions
    cards.splice(thirdTsunamiPos, 0, tsunamiCards[2]);
    cards.splice(secondTsunamiPos, 0, tsunamiCards[1]);
    cards.splice(firstTsunamiPos, 0, tsunamiCards[0]);

    return { deck: cards, tsunamiNumbers };
  }

  private static generateTsunamiNumbers(): number[] {
    const numbers = new Set<number>();
    while (numbers.size < 3) {
      numbers.add(Math.floor(Math.random() * 6) + 1);
    }
    return Array.from(numbers);
  }

  private static shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Player Management
  static createPlayer(id: string, socketId: string, nickname: string, email?: string): Player {
    return {
      id,
      socketId,
      nickname,
      email,
      hand: [],
      neighborhood: this.createEmptyNeighborhood(),
      score: 0,
      isIdle: false,
      attacksThisTurn: 0
    };
  }

  private static createEmptyNeighborhood(): Building[] {
    return Array.from({ length: this.BUILDINGS_PER_PLAYER }, (_, i) => ({
      id: i,
      cards: [],
      isProtected: false,
      modifiedThisTurn: false
    }));
  }

  // Game State Management
  static initializeGame(gameId: string, players: Player[], maxPlayers: number, createdBy: string): GameState {
    const { deck, tsunamiNumbers } = this.createDeck(players.length);
    
    // Randomize turn order
    const turnOrder = [...players.map(p => p.id)];
    this.shuffleArray(turnOrder);

    const gameState: GameState = {
      id: gameId,
      players,
      currentPlayerIndex: 0,
      deck,
      discardPile: [],
      maxPlayers,
      status: 'playing',
      turnOrder,
      createdBy,
      createdAt: new Date(),
      tsunamiNumbers
    };

    // Deal initial hands
    players.forEach(player => {
      this.drawCards(gameState, player.id, this.INITIAL_HAND_SIZE);
    });

    return gameState;
  }

  // Card Drawing
  static drawCards(gameState: GameState, playerId: string, count: number): { drawnCards: Card[], tsunamiTriggered?: Card } {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) throw new Error('Player not found');

    const drawnCards: Card[] = [];
    let tsunamiTriggered: Card | undefined;

    for (let i = 0; i < count && gameState.deck.length > 0; i++) {
      const card = gameState.deck.pop()!;
      
      if (card.type === 'tsunami') {
        tsunamiTriggered = card;
        break;
      }

      drawnCards.push(card);
      
      // Respect hand size limit
      if (player.hand.length + drawnCards.length >= this.MAX_HAND_SIZE) {
        break;
      }
    }

    player.hand.push(...drawnCards);
    return { drawnCards, tsunamiTriggered };
  }

  // Move Validation
  static validateMove(gameState: GameState, playerId: string, move: GameMove): MoveValidation {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) {
      return { isValid: false, error: 'Player not found' };
    }

    if (gameState.turnOrder[gameState.currentPlayerIndex] !== playerId) {
      return { isValid: false, error: 'Not your turn' };
    }

    switch (move.type) {
      case 'build':
        return this.validateBuildMove(gameState, player, move);
      case 'reinforce':
        return this.validateReinforceMove(gameState, player, move);
      case 'attack':
        return this.validateAttackMove(gameState, player, move);
      case 'end-turn':
        return { isValid: true };
      default:
        return { isValid: false, error: 'Invalid move type' };
    }
  }

  private static validateBuildMove(gameState: GameState, player: Player, move: BuildMove): MoveValidation {
    // Check building exists and is empty
    const building = player.neighborhood[move.buildingId];
    if (!building) {
      return { isValid: false, error: 'Building does not exist' };
    }
    if (building.cards.length > 0) {
      return { isValid: false, error: 'Building is not empty' };
    }

    // Check player has the cards
    const cardIds = move.cards.map(c => c.id);
    const hasAllCards = cardIds.every(id => player.hand.some(c => c.id === id));
    if (!hasAllCards) {
      return { isValid: false, error: 'Player does not have all required cards' };
    }

    // Validate foundation rules
    if (move.cards.length === 1) {
      // Single card must be foundation
      if (move.cards[0].type !== 'foundation') {
        return { isValid: false, error: 'Single card must be foundation' };
      }
    } else {
      // Multiple cards must have same value
      const firstValue = move.cards[0].value;
      if (!move.cards.every(c => c.value === firstValue)) {
        return { isValid: false, error: 'Multiple cards must have same value' };
      }
    }

    return { isValid: true };
  }

  private static validateReinforceMove(gameState: GameState, player: Player, move: ReinforceMove): MoveValidation {
    // Check building exists and is not empty
    const building = player.neighborhood[move.buildingId];
    if (!building) {
      return { isValid: false, error: 'Building does not exist' };
    }
    if (building.cards.length === 0) {
      return { isValid: false, error: 'Building is empty' };
    }
    if (building.modifiedThisTurn) {
      return { isValid: false, error: 'Building already modified this turn' };
    }

    // Check player has the cards
    const cardIds = move.cards.map(c => c.id);
    const hasAllCards = cardIds.every(id => player.hand.some(c => c.id === id));
    if (!hasAllCards) {
      return { isValid: false, error: 'Player does not have all required cards' };
    }

    // Check value is higher than top card
    const topCard = building.cards[building.cards.length - 1];
    const reinforceValue = move.cards[0].value;
    
    if (reinforceValue <= topCard.value) {
      return { isValid: false, error: 'Reinforcement must be higher value than top card' };
    }

    // If multiple cards, check they have same value
    if (move.cards.length > 1) {
      if (!move.cards.every(c => c.value === reinforceValue)) {
        return { isValid: false, error: 'Multiple cards must have same value' };
      }
    }

    return { isValid: true };
  }

  private static validateAttackMove(gameState: GameState, player: Player, move: AttackMove): MoveValidation {
    // Find target player and building
    const targetPlayer = gameState.players.find(p => p.id === move.targetPlayerId);
    if (!targetPlayer) {
      return { isValid: false, error: 'Target player not found' };
    }
    if (targetPlayer.id === player.id) {
      return { isValid: false, error: 'Cannot attack your own buildings' };
    }

    const targetBuilding = targetPlayer.neighborhood[move.targetBuildingId];
    if (!targetBuilding) {
      return { isValid: false, error: 'Target building does not exist' };
    }
    if (targetBuilding.cards.length === 0) {
      return { isValid: false, error: 'Target building is empty' };
    }
    if (targetBuilding.isProtected) {
      return { isValid: false, error: 'Target building is protected' };
    }

    // Check player has the attack card
    const hasCard = player.hand.some(c => c.id === move.card.id);
    if (!hasCard) {
      return { isValid: false, error: 'Player does not have attack card' };
    }

    // Check attack rules
    const topCard = targetBuilding.cards[targetBuilding.cards.length - 1];
    if (move.card.color !== topCard.color) {
      return { isValid: false, error: 'Attack card must match target building color' };
    }
    if (move.card.value < topCard.value) {
      return { isValid: false, error: 'Attack card value must be equal or higher than target' };
    }

    return { isValid: true };
  }

  // Move Execution
  static executeMove(gameState: GameState, playerId: string, move: GameMove): void {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player) throw new Error('Player not found');

    switch (move.type) {
      case 'build':
        this.executeBuildMove(gameState, player, move);
        break;
      case 'reinforce':
        this.executeReinforceMove(gameState, player, move);
        break;
      case 'attack':
        this.executeAttackMove(gameState, player, move);
        break;
      case 'end-turn':
        this.executeEndTurn(gameState, player);
        break;
    }
  }

  private static executeBuildMove(gameState: GameState, player: Player, move: BuildMove): void {
    const building = player.neighborhood[move.buildingId];
    
    // Remove cards from hand
    move.cards.forEach(card => {
      const index = player.hand.findIndex(c => c.id === card.id);
      if (index !== -1) {
        player.hand.splice(index, 1);
      }
    });

    // Add cards to building
    building.cards.push(...move.cards);
    building.modifiedThisTurn = true;

    // Set protection for foundation
    if (move.cards.length === 1 && move.cards[0].type === 'foundation') {
      building.isProtected = true;
    }
  }

  private static executeReinforceMove(gameState: GameState, player: Player, move: ReinforceMove): void {
    const building = player.neighborhood[move.buildingId];
    
    // Remove cards from hand
    move.cards.forEach(card => {
      const index = player.hand.findIndex(c => c.id === card.id);
      if (index !== -1) {
        player.hand.splice(index, 1);
      }
    });

    // Add cards to building
    building.cards.push(...move.cards);
    building.modifiedThisTurn = true;

    // Check if roof was added (permanent protection)
    if (move.cards.some(c => c.type === 'roof')) {
      building.isProtected = true;
    }
  }

  private static executeAttackMove(gameState: GameState, player: Player, move: AttackMove): void {
    const targetPlayer = gameState.players.find(p => p.id === move.targetPlayerId)!;
    const targetBuilding = targetPlayer.neighborhood[move.targetBuildingId];

    // Remove attack card from player's hand
    const cardIndex = player.hand.findIndex(c => c.id === move.card.id);
    if (cardIndex !== -1) {
      player.hand.splice(cardIndex, 1);
    }

    // Remove top card from target building
    const attackedCard = targetBuilding.cards.pop()!;

    // Add both cards to discard pile
    gameState.discardPile.push(move.card, attackedCard);

    // Track attack for card drawing
    player.attacksThisTurn++;
  }

  private static executeEndTurn(gameState: GameState, player: Player): { drawnCards: Card[], tsunamiTriggered?: Card } {
    // Reset building protections and modifications
    player.neighborhood.forEach(building => {
      building.modifiedThisTurn = false;
      // Remove temporary protection (foundation), keep permanent (roof)
      if (building.isProtected && building.cards.length > 0) {
        const hasRoof = building.cards.some(c => c.type === 'roof');
        if (!hasRoof) {
          building.isProtected = false;
        }
      }
    });

    // Calculate cards to draw
    let cardsToDraw = 1 + player.attacksThisTurn;
    if (player.hand.length === 0) {
      cardsToDraw = this.INITIAL_HAND_SIZE;
    }

    // Draw cards
    const result = this.drawCards(gameState, player.id, cardsToDraw);

    // Reset attacks counter
    player.attacksThisTurn = 0;

    // Move to next player
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;

    return result;
  }

  // Tsunami Logic
  static executeTsunami(gameState: GameState, tsunamiValue: number): { playerId: string; buildingId: number; cards: Card[] }[] {
    const destroyedCards: { playerId: string; buildingId: number; cards: Card[] }[] = [];

    gameState.players.forEach(player => {
      player.neighborhood.forEach(building => {
        if (building.isProtected) return; // Protected buildings are safe

        const cardsToDestroy: Card[] = [];
        const remainingCards: Card[] = [];

        building.cards.forEach(card => {
          if (card.value < tsunamiValue) {
            cardsToDestroy.push(card);
          } else {
            remainingCards.push(card);
          }
        });

        if (cardsToDestroy.length > 0) {
          destroyedCards.push({
            playerId: player.id,
            buildingId: building.id,
            cards: cardsToDestroy
          });

          building.cards = remainingCards;
          gameState.discardPile.push(...cardsToDestroy);
        }
      });
    });

    return destroyedCards;
  }

  // Game End Logic
  static checkGameEnd(gameState: GameState): boolean {
    if (gameState.deck.length === 0) {
      // Check if all players are idle
      return gameState.players.every(player => player.isIdle);
    }
    return false;
  }

  static calculateScores(gameState: GameState): { player: Player; score: number }[] {
    return gameState.players.map(player => {
      const score = player.neighborhood.reduce((total, building) => {
        return total + building.cards.length;
      }, 0);
      
      player.score = score;
      return { player, score };
    });
  }

  static getWinner(gameState: GameState): Player {
    const scores = this.calculateScores(gameState);
    return scores.reduce((winner, current) => 
      current.score > winner.score ? current : winner
    ).player;
  }
} 