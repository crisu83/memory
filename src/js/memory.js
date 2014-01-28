(function () {

    'use strict';

    /**
     * Creates a new object by inheriting another object.
     * @param {Object} parent
     * @param {Object} props
     * @returns {Object}
     */
    var inherit = function (parent, props) {
        parent = parent || function() {};
        var child;
        if (props && _.has(props, 'constructor')) {
            child = props.constructor;
        } else {
            child = function() { return parent.apply(this, arguments) };
        }
        child.prototype = Object.create(parent.prototype);
        _.extend(child.prototype, props);
        child.__super__ = parent.prototype;
        return child;
    };

    /**
     * Shuffles the given array using "Fisher-Yates".
     * @param {Array} array
     * @returns {Array}
     */
    var shuffle = function (array) {
        var counter = array.length,
            temp, index;

        while (counter > 0) {
            index = Math.floor(Math.random() * counter);
            counter--;
            temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }

        return array;
    };

    // shared vars
    var globals = {
        flippedCards: null,
        collectedCards: null,
        board: null,
        cards: null,
        hud: null
    };

    /**
     * @class Collection
     */
    var Collection = inherit(null, {
        /**
         * Creates a new collection.
         * @param {Array} items
         * @constructor
         */
        constructor: function (items) {
            this.items = items || [];
        },

        /**
         * Adds an item to this collection.
         * @param {*} item
         */
        add: function (item) {
            this.items.push(item);
        },

        /**
         * Returns a specific item in this collection.
         * @param {Number} index
         * @returns {*}
         */
        get: function (index) {
            return this.items[index];
        },

        /**
         * Removes a specific item from this collection.
         * @param {*} item
         */
        remove: function (item) {
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i] === item) {
                    this.items.splice(i, 1);
                }
            }
        },

        /**
        * Removes all items from this collection.
        */
        clear: function () {
            this.items.length = 0;
        },

        /**
         * Returns the number of items in this collection.
         * @returns {Number}
         */
        count: function () {
            return this.items.length;
        },

        /**
         * Returns all the items in this collection.
         * @returns {Array}
         */
        getItems: function () {
            return this.items;
        }
    });

    /**
     * @class Entity
     */
    var Entity = inherit(null, {
        /**
         * Entity base class.
         * @param {Phaser.Game} game
         * @constructor
         */
        constructor: function(game) {
            this.game = game;
        },

        /**
         * Performs preloading of this entity.
         */
        preload: function () {},

        /**
         * Invoked when the game is created.
         */
        create: function () {},

        /**
         * Invoked when the game is updated.
         */
        update: function () {}
    });

    /**
     * @class EntityGroup
     */
    var EntityGroup = inherit(null, {
        /**
         * Creates a new entity group.
         * @param {Phaser.Game} game
         * @constructor
         */
        constructor: function(game) {
            this.game = game;
            this.entities = [];
        },

        /**
         * Adds an entity to this group.
         * @param {Entity} entity
         */
        add: function(entity) {
            this.entities.push(entity);
        },

        /**
         * Performs preloading for this group.
         */
        preload: function () {
            for (var i = 0, l = this.entities.length; i < l; i++) {
                this.entities[i].preload();
            }
        },

        /**
         * Invoked when the game is created.
         */
        create: function () {
            for (var i = 0, l = this.entities.length; i < l; i++) {
                this.entities[i].create();
            }
        },

        /**
         * Invoked when the game is updated.
         */
        update: function () {
            for (var i = 0, l = this.entities.length; i < l; i++) {
                this.entities[i].update();
            }
        }
    });

    /**
     * @augments Entity
     * @class Board
     */
    var Board = inherit(Entity, {
        /**
         * Creates a new board.
         * @param {number} rows
         * @param {number} cols
         * @param {Phaser.Game} game
         * @constructor
         */
        constructor: function (rows, cols, game) {
            this.states = {
                DEFAULT: 'default',
                LOCKED: 'locked'
            };

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
            var deck = [
                'card1', 'card1', 'card2', 'card2', 'card3', 'card3', 'card4', 'card4',
                'card5', 'card5', 'card6', 'card6', 'card7', 'card7', 'card8', 'card8'
            ];

            shuffle(deck);

            var xs = 40,
                x = xs,
                y = 40,
                offset = 110,
                i, j, index, key;

            for (i = 0; i < this.rows; i++) {
                for (j = 0; j < this.cols; j++) {
                    index = (i * this.rows) + j;
                    key = deck.pop();
                    globals.cards.add(new Card(index, x, y, key, this.game));
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
            // collect or flip cards back
            if (globals.flippedCards.count() === 2 && this.state === this.states.DEFAULT) {
                this.state = this.states.LOCKED;
                var self = this;
                setTimeout(function () {
                    if (self.compareCards(globals.flippedCards.get(0), globals.flippedCards.get(1))) {
                        self.collectCards(globals.flippedCards.getItems());
                    } else {
                        self.flipCardsBack(globals.flippedCards.getItems());
                    }
                    globals.flippedCards.clear();
                    self.state = self.states.DEFAULT;
                }, 2000);
            }

            // victory check
            if (globals.collectedCards.length === this.numCardsTotal) {
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
                    globals.hud.addPoints(bonusPoints);
                }
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
            globals.hud.addPoints(100 * this.comboLength);
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
     * @augments Entity
     * @class Card
     */
    var Card = inherit(Entity, {
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
            this.states = {
               DEFAULT: 'default',
               FLIPPED: 'flipped',
               COLLECTED: 'collected'
            };

            var back = game.add.sprite(x, y, 'back');
            back.inputEnabled = true;
            back.events.onInputDown.add(this.flip, this);

            var front = game.add.sprite(x, y, key);
            front.visible = false;

            var flip = game.add.sprite(x, y, 'flip');
            flip.visible = false;
            flip.animations.add('flip');

            this.sprites = {
               back: back,
               front: front,
               flip: flip
            };

            this.index = index;
            this.key = key;
            this.state = this.states.DEFAULT;
        },

        /**
         * Flips this card.
         */
        flip: function () {
            if (this.state === this.states.DEFAULT && globals.flippedCards.count() < 2) {
                globals.board.numMoves++;
                this.sprites.back.visible = false;
                this.sprites.flip.animations.play('flip', 20);
                this.sprites.flip.visible = true;
                var self = this;
                setTimeout(function () {
                    self.sprites.flip.visible = false;
                    self.sprites.front.visible = true;
                    self.state = self.states.FLIPPED;
                    globals.flippedCards.add(self);
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
                globals.collectedCards.add(this);
                this.sprites.back.visible = false;
                this.sprites.front.visible = false;
                this.state = this.states.COLLECTED;
            }
        }
    });

    /**
     * @augments EntityGroup
     * @class CardGroup
     */
    var CardGroup = inherit(EntityGroup, {
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
     * @augments Entity
     * @class HUD
     */
    var HUD = inherit(Entity, {
        /**
         * Creates a new HUD.
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
     * Performs preloading for the game.
     * @param {Phaser.Game} game
     */
    var preload = function (game) {
        globals.board = new Board(4, 4, game);

        globals.cards = new CardGroup(game);
        globals.cards.preload();

        globals.hud = new HUD(game);

        globals.flippedCards = new Collection();
        globals.collectedCards = new Collection();
    };

    /**
     * Creates the game.
     * @param {Phaser.Game} game
     */
    var create = function (game) {
        globals.board.create();
        globals.cards.create();
        globals.hud.create();
    };

    /**
     * Updates the game.
     * @param {Phaser.Game} game
     */
    var update = function (game) {
        globals.board.update();
    };

    // Create the actual game.
    new Phaser.Game(510, 540, Phaser.AUTO, 'memory', {
        preload: preload,
        create: create,
        update: update
    });

})();