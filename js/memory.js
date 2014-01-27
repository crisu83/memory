(function () {

    'use strict';

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

    /**
     * Creates a new collection.
     * @constructor
     */
    var Collection = function (items) {
        this.items = items || [];
    };

    /**
     * Adds an item to this collection.
     * @param {*} item
     */
    Collection.prototype.add = function (item) {
        this.items.push(item);
    };

    /**
     * Returns all the items in this collection.
     * @returns {Array}
     */
    Collection.prototype.getItems = function () {
        return this.items;
    };

    /**
     * Returns a specific item in this collection.
     * @param {Number} index
     * @returns {*}
     */
    Collection.prototype.get = function (index) {
        return this.items[index];
    };

    /**
     * Removes a specific item from this collection.
     * @param {*} item
     */
    Collection.prototype.remove = function (item) {
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i] === item) {
                this.items.splice(i, 1);
            }
        }
    };

    /**
     * Removes all items from this collection.
     */
    Collection.prototype.clear = function () {
        this.items.length = 0;
    };

    /**
     * Returns the number of items in this collection.
     * @returns {Number}
     */
    Collection.prototype.count = function () {
        return this.items.length;
    };

    var globals = {
        flippedCards: new Collection(),
        collectedCards: new Collection(),
        board: null
    };

    /**
     * Creates a new board.
     * @param {number} rows
     * @param {number} cols
     * @param {Phaser.Game} game
     * @constructor
     */
    var Board = function (rows, cols, game) {
        this.states = {
            DEFAULT: 'default',
            LOCKED: 'locked'
        };

        this.rows = rows;
        this.cols = cols;
        this.game = game;
        this.numCardsTotal = 0;
        this.score = 0;
        this.comboLength = 0;
        this.state = this.states.DEFAULT;

        this.init();
    };

    /**
     * Initializes the board.
     */
    Board.prototype.init = function () {
        var deck = [
            'card1', 'card1', 'card2', 'card2', 'card3', 'card3', 'card4', 'card4',
            'card5', 'card5', 'card6', 'card6', 'card7', 'card7', 'card8', 'card8'
        ];

        shuffle(deck);

        var xs = 40,
            x = xs,
            y = 40,
            offset = 110,
            i, j, index, key, card;

        for (i = 0; i < this.rows; i++) {
            for (j = 0; j < this.cols; j++) {
                index = (i * this.rows) + j;
                key = deck.pop();
                new Card(index, x, y, key, this.game);
                this.numCardsTotal++;
                x += offset;
            }
            x = xs;
            y += offset;
        }

        this.renderScoreText();
    };

    /**
     * Renders the score text.
     */
    Board.prototype.renderScoreText = function () {
        if (this.scoreText) {
            this.game.world.remove(this.scoreText);
        }

        var style = {font: '20px Arial', fill: '#ffffff', align: 'left'},
            text = 'Score: ' + this.score;

        this.scoreText = this.game.add.text(40, this.game.height - 50, text, style);
    };

    /**
     * Runs the logic for this board.
     */
    Board.prototype.update = function () {
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
            // game won
        }
    };

    /**
     * Compares two cards.
     * @param {Card} a
     * @param {Card} b
     * @returns {boolean}
     */
    Board.prototype.compareCards = function (a, b) {
        return a.key === b.key;
    };

    /**
     * Collects the flipped cards.
     * @param {Array} cards
     */
    Board.prototype.collectCards = function (cards) {
        for (var i = 0, l = cards.length; i < l; i++) {
            cards[i].collect();
        }
        this.comboLength++;
        this.addPoints(100);
    };

    /**
     * Flips the given cards back.
     * @param {Array} cards
     */
    Board.prototype.flipCardsBack = function (cards) {
        for (var i = 0, l = cards.length; i < l; i++) {
            cards[i].flipBack();
        }
        this.comboLength = 0;
        this.removePoints(25);
    };

    /**
     * Adds points to the current score.
     * @param {number} amount
     */
    Board.prototype.addPoints = function (amount) {
        this.score += amount * this.comboLength;
        this.renderScoreText();
    };

    /**
     * Removes points from the current score.
     * @param {number} amount
     */
    Board.prototype.removePoints = function (amount) {
        this.score -= amount;
        if (this.score < 0) {
            this.score = 0;
        }
        this.renderScoreText();
    };

    /**
     * Creates a new card.
     * @param {number} index
     * @param {number} x
     * @param {number} y
     * @param {number} key
     * @param {Phaser.Game} game
     * @constructor
     */
    var Card = function (index, x, y, key, game) {
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
    };

    /**
     * Flips this card.
     */
    Card.prototype.flip = function () {
        if (this.state === this.states.DEFAULT) {
            if (globals.flippedCards.count() < 2) {
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
        }
    };

    /**
     * Flips this card back.
     */
    Card.prototype.flipBack = function () {
        if (this.state === this.states.FLIPPED) {
            this.sprites.front.visible = false;
            this.sprites.back.visible = true;
            this.state = this.states.DEFAULT;
        }
    };

    /**
     * Collects this card.
     */
    Card.prototype.collect = function () {
        if (this.state !== this.states.COLLECTED) {
            globals.collectedCards.add(this);
            this.sprites.back.visible = false;
            this.sprites.front.visible = false;
            this.state = this.states.COLLECTED;
        }
    };

    /**
     * Performs preloading for the game.
     * @param {Phaser.Game} game
     */
    var preload = function (game) {
        game.load.image('back', 'img/card_back.png');
        game.load.image('card1', 'img/card_bulldozer.png');
        game.load.image('card2', 'img/card_firetruck.png');
        game.load.image('card3', 'img/card_police.png');
        game.load.image('card4', 'img/card_roadster.png');
        game.load.image('card5', 'img/card_sailboat.png');
        game.load.image('card6', 'img/card_steamboat.png');
        game.load.image('card7', 'img/card_submarine.png');
        game.load.image('card8', 'img/card_train.png');
        game.load.spritesheet('flip', 'img/card_flip', 100, 100, 6);
    };

    /**
     * Creates the game.
     * @param {Phaser.Game} game
     */
    var create = function (game) {
        globals.board = new Board(4, 4, game);
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