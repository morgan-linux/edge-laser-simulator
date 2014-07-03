// Generated by CoffeeScript 1.7.1
var Game, HOST, Message, PORT, client, dgram, game;

HOST = '127.0.0.1';

PORT = 4242;

dgram = require('dgram');

client = dgram.createSocket('udp4');

Message = (function() {
  function Message(game) {
    this.game = game;
  }

  Message.prototype.send = function(msg) {
    return client.send(msg, 0, msg.length, PORT, HOST);
  };

  Message.prototype.hello = function() {
    console.log('[SAY] hello');
    return this.send(new Buffer('\0H' + this.game.name + '\0'));
  };

  Message.prototype.addCircle = function(x, y, diameter, color) {
    var message;
    message = new Buffer(24);
    message.writeUInt8(this.game.id, 0);
    message.write("C", 1, 1, "ascii");
    message.writeUInt16LE(x, 2);
    message.writeUInt16LE(y, 4);
    message.writeUInt16LE(diameter, 6);
    message.writeUInt8(color, 8);
    return this.send(message);
  };

  Message.prototype.addLine = function(x1, y1, x2, y2, color) {
    var message;
    message = new Buffer(24);
    message.writeUInt8(this.game.id, 0);
    message.write("L", 1, 1, "ascii");
    message.writeUInt16LE(x1, 2);
    message.writeUInt16LE(y1, 4);
    message.writeUInt16LE(x2, 6);
    message.writeUInt16LE(y2, 8);
    message.writeUInt8(color, 10);
    return this.send(message);
  };

  Message.prototype.addTxt = function(x, y, size, color, text) {
    var message;
    message = new Buffer(24);
    message.writeUInt8(this.game.id, 0);
    message.write("T", 1, 1, "ascii");
    message.writeUInt16LE(x, 2);
    message.writeUInt16LE(y, 4);
    message.writeUInt8(color, 6);
    message.write(text + '\0', 7, text.length + 1, "ascii");
    return this.send(message);
  };

  Message.prototype.refresh = function() {
    var message;
    message = new Buffer(24);
    message.writeUInt8(this.game.id, 0);
    message.write("R", 1, 1, "ascii");
    return this.send(message);
  };

  Message.prototype.stop = function() {
    console.log('[SAY] stop');
    return this.send(new Buffer(this.game.id + 'S'));
  };

  return Message;

})();

Game = (function() {
  function Game(name, id) {
    this.name = name;
    this.id = id;
    this.msg = new Message(this);
    this.stop = true;
    this.lastInteraction = null;
    this.color = {
      red: 0x1,
      lime: 0x2,
      green: 0x2,
      yellow: 0x3,
      blue: 0x4,
      fuchsia: 0x5,
      cyan: 0x6,
      white: 0x7
    };
    this.colors = [0x1, 0x2, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7];
    this.board = [null, null, null, null, null, null, null, null, null];
    this.isPlaying = false;
    this.states = {
      p1: {
        color: this.color.green,
        type: "o",
        cursor: 0
      },
      p2: {
        color: this.color.red,
        type: "x",
        cursor: 8
      }
    };
    this.state = this.states.p1;
  }

  Game.prototype.start = function() {
    console.log('[Start] ' + this.name);
    return this.msg.hello();
  };

  Game.prototype.stop = function() {
    console.log('[Stop] ' + this.name);
    this.msg.stop();
    return this.stop = true;
  };

  Game.prototype.delay = function(ms, func) {
    return setTimeout(func, ms);
  };

  Game.prototype.drawGrid = function() {
    this.msg.addLine(21845, 5000, 21845, 60535, this.color.cyan);
    this.msg.addLine(43690, 5000, 43690, 60535, this.color.cyan);
    this.msg.addLine(5000, 21845, 60535, 21845, this.color.cyan);
    return this.msg.addLine(5000, 43690, 60535, 43690, this.color.cyan);
  };

  Game.prototype.isFull = function() {
    return (this.board[0] != null) && (this.board[1] != null) && (this.board[2] != null) && (this.board[3] != null) && (this.board[4] != null) && (this.board[5] != null) && (this.board[6] != null) && (this.board[7] != null) && (this.board[8] != null);
  };

  Game.prototype.play = function() {
    var displayWinner, limiteDisplayWinner, looplay;
    this.isPlaying = true;
    game.stop = false;
    displayWinner = 0;
    limiteDisplayWinner = 50;
    looplay = (function(_this) {
      return function() {
        var position, _i;
        if (!game.stop) {
          if (_this.isWinner('x')) {
            if (displayWinner < limiteDisplayWinner) {
              _this.TextXIsWin();
            } else {
              _this.board = [null, null, null, null, null, null, null, null, null];
              displayWinner = 0;
            }
            displayWinner++;
          } else if (_this.isWinner('o')) {
            if (displayWinner < limiteDisplayWinner) {
              _this.TextOIsWin();
            } else {
              _this.board = [null, null, null, null, null, null, null, null, null];
              displayWinner = 0;
            }
            displayWinner++;
          } else if (_this.isFull()) {
            _this.board = [null, null, null, null, null, null, null, null, null];
          } else {
            _this.drawGrid();
            for (position = _i = 0; _i <= 8; position = ++_i) {
              switch (_this.board[position]) {
                case "x":
                  _this.addCross(position);
                  break;
                case "o":
                  _this.addCircle(position);
              }
            }
            _this.doSelect(_this.state.cursor, _this.state);
          }
          return _this.msg.refresh();
        } else {
          return _this.board = [null, null, null, null, null, null, null, null, null];
        }
      };
    })(this);
    return setInterval(looplay, 150);
  };

  Game.prototype.doSelect = function(position, state) {
    var color, x, y;
    x = y = 0;
    switch (position) {
      case 1:
        x = 21845;
        break;
      case 2:
        x = 43690;
        break;
      case 3:
        y = 21845;
        break;
      case 4:
        x = 21845;
        y = 21845;
        break;
      case 5:
        x = 43690;
        y = 21845;
        break;
      case 6:
        y = 43690;
        break;
      case 7:
        x = 21845;
        y = 43690;
        break;
      case 8:
        x = 43690;
        y = 43690;
    }
    color = this.colors[Math.floor(Math.random() * this.colors.length)];
    if (state === this.states.p1) {
      this.msg.addCircle(10923 + x, 7000 + y, 1500, color);
      this.msg.addLine(10923 + x, 12000 + y, 10923 + x, 9000 + y, color);
      this.msg.addLine(10000 + x, 10000 + y, 10923 + x, 12000 + y, color);
      return this.msg.addLine(11846 + x, 10000 + y, 10923 + x, 12000 + y, color);
    } else {
      this.msg.addLine(9923 + x, 6000 + y, 11923 + x, 8000 + y, color);
      this.msg.addLine(11923 + x, 6000 + y, 9923 + x, 8000 + y, color);
      this.msg.addLine(10923 + x, 12000 + y, 10923 + x, 9000 + y, color);
      this.msg.addLine(10000 + x, 10000 + y, 10923 + x, 12000 + y, color);
      return this.msg.addLine(11846 + x, 10000 + y, 10923 + x, 12000 + y, color);
    }
  };

  Game.prototype.TextXIsWin = function() {
    var color;
    color = this.colors[Math.floor(Math.random() * this.colors.length)];
    return this.addCross(4, color);
  };

  Game.prototype.TextOIsWin = function() {
    var color;
    color = this.colors[Math.floor(Math.random() * this.colors.length)];
    return this.addCircle(4, color);
  };

  Game.prototype.p1_right = function() {
    if (this.state.type === "o") {
      if (this.state.cursor < 8) {
        return this.state.cursor++;
      } else {
        return this.state.cursor = 0;
      }
    }
  };

  Game.prototype.p1_left = function() {
    if (this.state.type === "o") {
      if (this.state.cursor > 0) {
        return this.state.cursor--;
      } else {
        return this.state.cursor = 8;
      }
    }
  };

  Game.prototype.p1_up = function() {
    if (this.state.type === "o") {
      if (this.state.cursor > 2) {
        return this.state.cursor -= 3;
      } else {
        return this.state.cursor += 6;
      }
    }
  };

  Game.prototype.p1_down = function() {
    if (this.state.type === "o") {
      if (this.state.cursor < 6) {
        return this.state.cursor += 3;
      } else {
        return this.state.cursor -= 6;
      }
    }
  };

  Game.prototype.p1_select = function() {
    if (this.state.type === "o" && (this.board[this.state.cursor] == null)) {
      this.board[this.state.cursor] = "o";
      return this.state = this.states.p2;
    }
  };

  Game.prototype.p2_right = function() {
    if (this.state.type === "x") {
      if (this.state.cursor < 8) {
        return this.state.cursor++;
      } else {
        return this.state.cursor = 0;
      }
    }
  };

  Game.prototype.p2_left = function() {
    if (this.state.type === "x") {
      if (this.state.cursor > 0) {
        return this.state.cursor--;
      } else {
        return this.state.cursor = 8;
      }
    }
  };

  Game.prototype.p2_up = function() {
    if (this.state.type === "x") {
      if (this.state.cursor > 2) {
        return this.state.cursor -= 3;
      } else {
        return this.state.cursor += 6;
      }
    }
  };

  Game.prototype.p2_down = function() {
    if (this.state.type === "x") {
      if (this.state.cursor < 6) {
        return this.state.cursor += 3;
      } else {
        return this.state.cursor -= 6;
      }
    }
  };

  Game.prototype.p2_select = function() {
    if (this.state.type === "x" && (this.board[this.state.cursor] == null)) {
      this.board[this.state.cursor] = "x";
      return this.state = this.states.p1;
    }
  };

  Game.prototype.addCross = function(position, color) {
    switch (position) {
      case 0:
        this.msg.addLine(5923, 5923, 15923, 15923, color != null ? color : this.color.red);
        return this.msg.addLine(15923, 5923, 5923, 15923, color != null ? color : this.color.red);
      case 1:
        this.msg.addLine(27768, 5923, 37768, 15923, color != null ? color : this.color.red);
        return this.msg.addLine(27768, 15923, 37768, 5923, color != null ? color : this.color.red);
      case 2:
        this.msg.addLine(49613, 5923, 59613, 15923, color != null ? color : this.color.red);
        return this.msg.addLine(49613, 15923, 59613, 5923, color != null ? color : this.color.red);
      case 3:
        this.msg.addLine(5923, 27768, 15923, 37768, color != null ? color : this.color.red);
        return this.msg.addLine(15923, 27768, 5923, 37768, color != null ? color : this.color.red);
      case 4:
        this.msg.addLine(27768, 27768, 37768, 37768, color != null ? color : this.color.red);
        return this.msg.addLine(37768, 27768, 27768, 37768, color != null ? color : this.color.red);
      case 5:
        this.msg.addLine(49613, 27768, 59613, 37768, color != null ? color : this.color.red);
        return this.msg.addLine(49613, 37768, 59613, 27768, color != null ? color : this.color.red);
      case 6:
        this.msg.addLine(5923, 49613, 15923, 59613, color != null ? color : this.color.red);
        return this.msg.addLine(15923, 49613, 5923, 59613, color != null ? color : this.color.red);
      case 7:
        this.msg.addLine(27768, 49613, 37768, 59613, color != null ? color : this.color.red);
        return this.msg.addLine(37768, 49613, 27768, 59613, color != null ? color : this.color.red);
      case 8:
        this.msg.addLine(49613, 49613, 59613, 59613, color != null ? color : this.color.red);
        return this.msg.addLine(49613, 59613, 59613, 49613, color != null ? color : this.color.red);
    }
  };

  Game.prototype.addCircle = function(position, color) {
    switch (position) {
      case 0:
        return this.msg.addCircle(10923, 10923, 10000, color != null ? color : this.color.green);
      case 1:
        return this.msg.addCircle(32768, 10923, 10000, color != null ? color : this.color.green);
      case 2:
        return this.msg.addCircle(54613, 10923, 10000, color != null ? color : this.color.green);
      case 3:
        return this.msg.addCircle(10923, 32768, 10000, color != null ? color : this.color.green);
      case 4:
        return this.msg.addCircle(32768, 32768, 10000, color != null ? color : this.color.green);
      case 5:
        return this.msg.addCircle(54613, 32768, 10000, color != null ? color : this.color.green);
      case 6:
        return this.msg.addCircle(10923, 54613, 10000, color != null ? color : this.color.green);
      case 7:
        return this.msg.addCircle(32768, 54613, 10000, color != null ? color : this.color.green);
      case 8:
        return this.msg.addCircle(54613, 54613, 10000, color != null ? color : this.color.green);
    }
  };

  Game.prototype.interaction = function(message) {
    console.log(message.readUInt16LE(1));
    switch (message.readUInt16LE(1)) {
      case 32768:
        return this.p1_right();
      case 16384:
        return this.p1_left();
      case 8192:
        return this.p1_up();
      case 4096:
        return this.p1_down();
      case 2048:
        return this.p1_select();
      case 128:
        return this.p2_right();
      case 64:
        return this.p2_left();
      case 32:
        return this.p2_up();
      case 16:
        return this.p2_down();
      case 8:
        return this.p2_select();
    }
  };

  Game.prototype.isWinner = function(player) {
    if (player === this.board[0] && player === this.board[1] && player === this.board[2]) {
      return true;
    }
    if (player === this.board[3] && player === this.board[4] && player === this.board[5]) {
      return true;
    }
    if (player === this.board[6] && player === this.board[7] && player === this.board[8]) {
      return true;
    }
    if (player === this.board[0] && player === this.board[3] && player === this.board[6]) {
      return true;
    }
    if (player === this.board[1] && player === this.board[4] && player === this.board[7]) {
      return true;
    }
    if (player === this.board[2] && player === this.board[5] && player === this.board[8]) {
      return true;
    }
    if (player === this.board[0] && player === this.board[4] && player === this.board[8]) {
      return true;
    }
    if (player === this.board[2] && player === this.board[4] && player === this.board[6]) {
      return true;
    }
    return false;
  };

  return Game;

})();

game = new Game('Tic Tac Toe');

game.start();

client.on('message', function(message, remote) {
  console.log("[MSG] " + message + " " + message[1]);
  switch (String.fromCharCode(message[0])) {
    case "A":
      return game.id = message[1];
    case "G":
      return game.play();
    case "S":
      return game.stop = true;
    case "I":
      return game.interaction(message);
    default:
      return console.log("UNKNOW MESSAGE -> " + message);
  }
});

client.on('error', function(message, remote) {
  console.log("[MSG] !!!!!! error -> " + message);
  return game.stop();
});
