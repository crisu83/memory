(function () {

    'use strict';

    var CARDS_PER_ROW = 4,
        CARDS_PER_COLUMN = 4;

    /**
     * Creates a new board.
     * @param {number} rows
     * @param {number} cols
     * @param {Phaser.Game} game
     * @constructor
     */
    var Board = function (rows, cols, game) {
        this.rows = rows;
        this.cols = cols;
        this.game = game;
        this.cards = [];
        this.flippedCards = [];
        this.collectedCards = [];
        this.score = 0;
        this.comboLength = 0;
        this.disabled = false;

        this.init();
    };

    /**
     * Initializes the board.
     */
    Board.prototype.init = function () {
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

        var deck = [
            'card1', 'card1', 'card2', 'card2', 'card3', 'card3', 'card4', 'card4',
            'card5', 'card5', 'card6', 'card6', 'card7', 'card7', 'card8', 'card8'
        ];

        shuffle(deck);

        var xs = 50,
            x = xs,
            y = 50,
            offset = 90,
            i, j;

        for (i = 0; i < this.rows; i++) {
            for (j = 0; j < this.cols; j++) {
                this.cards.push(new Card((i * this.rows) + j, x, y, deck.pop(), this, this.game));
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
    Board.prototype.renderScoreText = function() {
        if (this.scoreText) {
            this.game.world.remove(this.scoreText);
        }

        var style = {font: '20px Arial', fill: '#ffffff', align: 'left'},
            text = 'Score: ' + this.score;

        this.scoreText = this.game.add.text(50, this.game.height - 50, text, style);
    };

    /**
     * Runs the logic for this board.
     */
    Board.prototype.update = function () {
        // collect or flip cards back
        if (this.flippedCards.length === 2 && !this.disabled) {
            var self = this,
                i, l;
            this.disabled = true;
            setTimeout(function () {
                if (self.compareCards(self.flippedCards[0], self.flippedCards[1])) {
                    for (i = 0, l = self.flippedCards.length; i < l; i++) {
                        self.flippedCards[i].collect();
                        self.collectedCards.push(self.flippedCards[i]);
                    }
                    self.comboLength++;
                    self.addPoints(100);
                } else {
                    for (i = 0, l = self.flippedCards.length; i < l; i++) {
                        self.flippedCards[i].flip();
                    }
                    self.comboLength = 0;
                }
                self.flippedCards = [];
                self.disabled = false;
            }, 2000);
        }

        // victory check
        if (this.collectedCards.length === (this.rows * this.cols)) {
            // game won
        }
    };

    /**
     * Adds points to the current score.
     * @param {number} amount
     */
    Board.prototype.addPoints = function(amount) {
        this.score += amount * this.comboLength;
        this.renderScoreText();
    };

    /**
     * Compares two cards.
     * @param {Card} a
     * @param {Card} b
     * @returns {boolean}
     */
    Board.prototype.compareCards = function(a, b) {
        return a.key === b.key;
    };

    /**
     * Creates a new card.
     * @param {number} index
     * @param {number} x
     * @param {number} y
     * @param {number} key
     * @param {Board} board
     * @param {Phaser.Game} game
     * @constructor
     */
    var Card = function (index, x, y, key, board, game) {
        var back = game.add.sprite(x, y, 'back');
        back.inputEnabled = true;
        back.events.onInputDown.add(this.flip, this);

        var front = game.add.sprite(x, y, key);
        front.visible = false;

        this.index = index;
        this.key = key;
        this.board = board;
        this.front = front;
        this.back = back;
        this.flipped = false;
        this.collected = false;
    };

    /**
     * Flips this card.
     */
    Card.prototype.flip = function () {
        if (this.collected) {
            return;
        }
        if (!this.flipped) {
            if (this.board.flippedCards.length < 2) {
                this.board.flippedCards.push(this);
                this.front.visible = true;
                this.back.visible = false;
                this.flipped = true;
            }
        } else {
            for (var i = 0, l = this.board.flippedCards.length; i < l; i++) {
                if (this.board.flippedCards === this) {
                    this.board.flippedCards.splice(i, 1);
                    break;
                }
            }
            this.front.visible = false;
            this.back.visible = true;
            this.flipped = false;
        }
    };

    /**
     * Collects this card.
     */
    Card.prototype.collect = function () {
        this.back.visible = false;
        this.front.visible = false;
        this.collected = true;
    };

    var board;

    /**
     *
     * @param {Phaser.Game} game
     */
    var preload = function (game) {
        game.load.image('logo', 'img/phaser.png');
        game.load.image('back', 'img/card_back.png');
        game.load.image('card1', 'img/card_bulldozer.png');
        game.load.image('card2', 'img/card_firetruck.png');
        game.load.image('card3', 'img/card_police.png');
        game.load.image('card4', 'img/card_roadster.png');
        game.load.image('card5', 'img/card_sailboat.png');
        game.load.image('card6', 'img/card_steamboat.png');
        game.load.image('card7', 'img/card_submarine.png');
        game.load.image('card8', 'img/card_train.png');
    };

    /**
     *
     * @param {Phaser.Game} game
     */
    var create = function (game) {
        board = new Board(CARDS_PER_ROW, CARDS_PER_COLUMN, game);
    };

    /**
     *
     * @param {Phaser.Game} game
     */
    var update = function (game) {
        board.update();
    };

    new Phaser.Game(450, 480, Phaser.AUTO, 'memory', {
        preload: preload,
        create: create,
        update: update
    });

})();