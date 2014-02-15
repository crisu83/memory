'use strict';

// Declare namespace.
var Memory = Memory || {
    states: {
        // todo: implement menu
        MENU: 'menu',
        GAME: 'game',
        // todo: implement scoreboard
        SCOREBOARD: 'scoreboard'
    }
};

/**
 * Memory table class.
 * @class Memory.Table
 * @augments Pew.Entity
 */
Memory.Table = Pew.Utils.inherit(Pew.Entity, {
    // Table states.
    states: {
        DEFAULT: 'default',
        LOCKED: 'locked',
        ENDED: 'ended'
    },

    /**
     * Creates a new board.
     * @param {number} rows
     * @param {number} cols
     * @param {Phaser.Game} game
     * @constructor
     */
    constructor: function (rows, cols, game) {
        this.rows = rows;
        this.cols = cols;
        this.game = game;
        this.numCardsTotal = 0;
        this.comboLength = 0;
        this.numMoves = 0;
        this.state = this.states.DEFAULT;
    },

    /**
     * @inheritDoc
     */
    create: function () {
        var deck = Phaser.Utils.shuffle([
            'card1', 'card1', 'card2', 'card2', 'card3', 'card3', 'card4', 'card4',
            'card5', 'card5', 'card6', 'card6', 'card7', 'card7', 'card8', 'card8'
        ]);

        var xs = 40,
            x = xs,
            y = 40,
            offset = 110,
            i, j, index, key;

        for (i = 0; i < this.rows; i++) {
            for (j = 0; j < this.cols; j++) {
                index = (i * this.rows) + j;
                key = deck.pop();
                this.getState().cards.add(new Memory.Card(index, x, y, key, this.game));
                this.numCardsTotal++;
                x += offset;
            }
            x = xs;
            y += offset;
        }
    },

    /**
     * @inheritDoc
     */
    update: function () {
        var self = this;

        // collect or flip cards back
        if (this.getState().flippedCards.count() === 2 && this.state === this.states.DEFAULT) {
            this.state = this.states.LOCKED;
            setTimeout(function () {
                if (self.compareCards(self.getState().flippedCards.get(0), self.getState().flippedCards.get(1))) {
                    self.collectCards(self.getState().flippedCards.getItems());
                } else {
                    self.flipCardsBack(self.getState().flippedCards.getItems());
                }
                self.getState().flippedCards.clear();
                self.state = self.states.DEFAULT;
            }, 2000);
        }

        // victory check
        if (this.state !== this.states.ENDED && this.getState().collectedCards.count() === this.numCardsTotal) {
            var bonusPoints = 0;
            if (this.numMoves < 30) {
                bonusPoints = 500;
            } else if (this.numMoves < 35) {
                bonusPoints = 400;
            } else if (this.numMoves < 40) {
                bonusPoints = 300;
            } else if (this.numMoves < 45) {
                bonusPoints = 200;
            } else if (this.numMoves < 50) {
                bonusPoints = 100;
            }
            if (bonusPoints > 0) {
                this.getState().gui.addPoints(bonusPoints);
            }
            this.state = this.states.ENDED;
            console.log('Well done!');
            setTimeout(function() {
                self.game.state.start(Memory.states.MENU);
            }, 5000);
        }
    },

    /**
     * Compares two cards.
     * @param {Card} a
     * @param {Card} b
     * @returns {boolean}
     */
    compareCards: function (a, b) {
        return a.key === b.key;
    },

    /**
     * Collects the flipped cards.
     * @param {Array} cards
     */
    collectCards: function (cards) {
        for (var i = 0, l = cards.length; i < l; i++) {
            cards[i].collect();
        }
        this.comboLength++;
        this.getState().gui.addPoints(100 * this.comboLength);
    },

    /**
     * Flips the given cards back.
     * @param {Array} cards
     */
    flipCardsBack: function (cards) {
        for (var i = 0, l = cards.length; i < l; i++) {
            cards[i].flipBack();
        }
        this.comboLength = 0;
    }
});

/**
 * Memory card class.
 * @class Memory.Card
 * @augments Pew.Entity
 */
Memory.Card = Pew.Utils.inherit(Pew.Entity, {
    // Card states
    states: {
        DEFAULT: 'default',
        FLIPPED: 'flipped',
        COLLECTED: 'collected'
    },

    /**
     * Creates a new card.
     * @param {number} index
     * @param {number} x
     * @param {number} y
     * @param {number} key
     * @param {Phaser.Game} game
     * @constructor
     */
    constructor: function (index, x, y, key, game) {
        this.index = index;
        this.key = key;
        this.game = game;

        var back = this.game.add.sprite(x, y, 'back');
        back.inputEnabled = true;
        back.events.onInputDown.add(this.flip, this);

        var front = this.game.add.sprite(x, y, key);
        front.visible = false;

        var flip = this.game.add.sprite(x, y, 'flip');
        flip.visible = false;
        flip.animations.add('flip');

        this.sprites = {
            back: back,
            front: front,
            flip: flip
        };

        this.state = this.states.DEFAULT;
    },

    /**
     * Flips this card.
     */
    flip: function () {
        if (this.state === this.states.DEFAULT && this.getState().flippedCards.count() < 2) {
            this.getState().table.numMoves++;
            this.sprites.back.visible = false;
            this.sprites.flip.animations.play('flip', 20);
            this.sprites.flip.visible = true;
            var self = this;
            setTimeout(function () {
                self.sprites.flip.visible = false;
                self.sprites.front.visible = true;
                self.state = self.states.FLIPPED;
                self.getState().flippedCards.add(self);
            }, 120);
        }
    },

    /**
     * Flips this card back.
     */
    flipBack: function () {
        if (this.state === this.states.FLIPPED) {
            this.sprites.front.visible = false;
            this.sprites.back.visible = true;
            this.state = this.states.DEFAULT;
        }
    },

    /**
     * Collects this card.
     */
    collect: function () {
        if (this.state !== this.states.COLLECTED) {
            this.getState().collectedCards.add(this);
            this.sprites.back.visible = false;
            this.sprites.front.visible = false;
            this.state = this.states.COLLECTED;
        }
    }
});

/**
 * Memory card group class.
 * @class Memory.CardGroup
 * @augments Pew.EntityGroup
 */
Memory.CardGroup = Pew.Utils.inherit(Pew.EntityGroup, {
    /**
     * @inheritDoc
     */
    preload: function() {
        this.game.load.image('back', 'img/card_back.png');
        this.game.load.image('card1', 'img/card_bulldozer.png');
        this.game.load.image('card2', 'img/card_firetruck.png');
        this.game.load.image('card3', 'img/card_police.png');
        this.game.load.image('card4', 'img/card_roadster.png');
        this.game.load.image('card5', 'img/card_sailboat.png');
        this.game.load.image('card6', 'img/card_steamboat.png');
        this.game.load.image('card7', 'img/card_submarine.png');
        this.game.load.image('card8', 'img/card_train.png');
        this.game.load.spritesheet('flip', 'img/card_flip.png', 100, 100, 6);
    }
});

/**
 * Memory GUI.
 * @class Memory.GUI
 * @augments Pew.Entity
 */
Memory.GUI = Pew.Utils.inherit(Pew.Entity, {
    /**
     * Creates a new GUI.
     * @param {Phaser.Game} game
     */
    constructor: function(game) {
        this.game = game;
        this.score = 0;
        this.scoreText = null;
    },

    /**
     * @inheritDoc
     */
    create: function() {
        this.renderScoreText();
    },

    /**
     * Adds points to the current score.
     * @param {number} amount
     */
    addPoints: function (amount) {
        this.score += amount;
        this.renderScoreText();
    },

    /**
     * Renders the score text.
     */
    renderScoreText: function () {
        if (this.scoreText) {
            this.game.world.remove(this.scoreText);
        }

        var style = {font: '20px Arial', fill: '#ffffff', align: 'left'},
            text = 'Score: ' + this.score;

        this.scoreText = this.game.add.text(40, this.game.height - 50, text, style);
    }
});

/**
 * Memory button entity.
 * @class Memory.Button
 * @augments Pew.Entity
 */
Memory.Button = Pew.Utils.inherit(Pew.Entity, {
    constructor: function(x, y, game) {
        Pew.Entity.prototype.constructor.apply(this, arguments);

        this.x = x;
        this.y = y;
        this.game = game;
        this.sprite = null;
        this.text = null;
    },

    /**
     * @inheritDoc
     */
    create: function() {
        var sprite = this.game.add.sprite(this.x, this.y, 'button');
        sprite.inputEnabled = true;
        sprite.events.onInputDown.add(this.startGame, this);
        this.sprite = sprite;

        var style = {font: '48px Arial', fill: '#ffffff', align: 'center'};
        this.game.add.text(this.x, this.y, 'START', style);
    },

    /**
     * Starts the game.
     */
    startGame: function() {
        this.game.state.start(Memory.states.GAME);
    }
});

// create the game.
var game = new Phaser.Game(510, 540, Phaser.AUTO, 'memory');

// add a menu state.
game.state.add(Memory.states.MENU, {
    /**
     * @type {Memory.Button}
     */
    newGame: null,
    /**
     * Performs preloading for the state.
     * @param {Phaser.Game} game
     */
    preload: function(game) {
        game.load.image('button', 'img/button.png');
        this.newGame = new Memory.Button(game.width / 2 - 70, game.height / 2 - 20, game);
    },
    /**
     * Creates the state.
     * @param {Phaser.Game} game
     */
    create: function(game) {
        this.newGame.create();
    }
});

// add a game state.
game.state.add(Memory.states.GAME, {
    /**
     * @type {Memory.Table}
     */
    table: null,
    /**
     * @type {Memory.CardGroup}
     */
    cards: null,
    /**
     * @type {Memory.GUI}
     */
    gui: null,
    /**
     * @type {Pew.Collection}
     */
    flippedCards: null,
    /**
     * @type {Pew.Collection}
     */
    collectedCards: null,
    /**
     * Performs preloading for the state.
     * @param {Phaser.Game} game
     */
    preload: function (game) {
        this.table = new Memory.Table(4, 4, game);
        this.cards = new Memory.CardGroup(game);
        this.cards.preload();
        this.gui = new Memory.GUI(game);
        this.flippedCards = new Pew.Collection();
        this.collectedCards = new Pew.Collection();
    },
    /**
     * Creates the state.
     * @param {Phaser.Game} game
     */
    create: function (game) {
        this.table.create();
        this.cards.create();
        this.gui.create();
    },
    /**
     * Updates the state.
     * @param {Phaser.Game} game
     */
    update: function (game) {
        this.table.update();
    }
});

// Start the game.
game.state.start(Memory.states.MENU);