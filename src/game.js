(function(exports) {

  var Progression = {
    easy: [
      _ = [1,1,4,4], _, _, _,
      [1,1,4,5], [1,1,4,6],
      [1,1,4,4], // breather
      _ = [1,1,5,5], _, _, _,
      [1,1,4,4], // breather
      [1,1,5,6], [1,1,5,7], 
      _ = [1,1,6,6], _, _, _,
      [1,1,5,5], // breather
      [1,1,6,8], [1,1,6,10],
      _ = [1,1,8,8], _, _, _,
      [1,1,8,10], [1,1,8,12],
      [1,1,6,6], // breather
      _ = [1,1,10,10], _, _, _,
      [1,1,10,12], [1,1,10,14],
      [1,1,8,8], // breather
      _ = [1,1,12,12], _, _, _,
      [1,1,12,14], [1,1,12,16],
      [1,1,10,10], // breather
      [1,1,15,15]
    ],

    medium: [
      [1,1,5,5], [1,1,5,7],
      [1,1,6,6], [1,1,6,10],
      [1,1,8,8], [1,1,8,12],
      [1,1,10,10], [1,1,10,14],
      [1,1,6,6], // breather
      _ = [1,2,3,3], _, _, _,
      [1,2,3,4], [1,2,3,5],
      [1,1,10,10], // breather
      _ = [1,2,4,4], _, _, _,
      [1,2,4,5], [1,2,4,6],
      [1,1,10,10], // breather
      _ = [1,3,4,4], _, _, _,
      [1,3,4,5], [1,3,4,6],
      [1,1,12,12], // breather
      _ = [1,3,5,5], _, _, _,
      [1,1,12,12], // breather
      _ = [2,2,3,3], _, _, _,
      [2,2,3,4], [2,2,3,5],
      [1,1,12,12], // breather
      _ = [2,2,4,4], _, _, _,
      [2,2,4,5], [2,2,4,6],
      [1,1,15,15], // breather
      [2,3,3,3], [3,2,3,3], [3,3,3,3],
      _ = [3,3,3,3], _, _, _,
      [3,3,3,4],
      [3,4,4,4], [4,3,4,4], [4,4,4,4]
    ],

    hard: [
      [1,2,3,3],[1,2,3,3],
      [1,2,3,4],[1,2,3,4],
      [1,2,4,4],[1,2,4,4],
      [1,1,10,10],
      [1,3,3,3],[1,3,3,4],[1,3,4,4],
      _ = [2,2,3,3], _, _,
      [1,1,10,10],
      [2,2,3,4],[2,2,3,4],
      _ = [2,2,4,4], _, _,
      [1,1,10,10],
      [2,3,3,3],[2,3,3,4],
      _ = [2,3,4,4], _, _,
      [1,1,10,10],
      _ = [3,3,3,3], _, _,
      [1,1,10,10],
      [3,3,3,4],[3,3,4,4],[3,4,3,3],[3,4,3,4],
      [3,4,4,4],[3,4,4,5],
      [1,1,10,10],
      _ = [4,4,3,3], _, _,
      [4,4,3,4],[4,4,3,4]
      [1,1,10,10],
      _ = [4,4,4,4], _, _
    ]
  };

  var Game = function(canvas_id, difficulty) {
    var self = this;

    this.canvas = document.getElementById(canvas_id);
    this.rand = new MersenneTwister;
    this.board = new Board(this.canvas);

    window.addEventListener("resize", function() { self.stretchCanvas(); });
    this.stretchCanvas();

    var timeTag = document.getElementById('timeRemaining');
    timeTag.addEventListener("click", function() { self.togglePause(); });

    var aboutTag = document.getElementById('about');
    aboutTag.addEventListener("click", function() { self.togglePause(); });

    var self = this;
    this.board.exitedMaze = function() { self.exitedMaze(); };
    this.board.grabbedStar = function(effect) { self.grabbedStar(effect); };
    this.board.acted = function() { self.userActed(); };
    this.board.pausing = function() { self.userPausing(); };
    this.board.unpausing = function() { self.userUnpausing(); };

    this.resetGame(difficulty);
  }

  Game.prototype.resetGame = function(difficulty) {
    if (this.timer) {
      window.clearInterval(this.timer);
      delete(this.timer);
    }

    this.difficulty = difficulty;

    this.score = 0;
    this.stage = 0;
    this.stageStars = 0;
    this.duration = 60 * 1000;
    this.bonusTime = 0;

    this.levels = Progression[difficulty];
    this.board.reset(this.gridForStage(this.stage));
    this.board.refresh();

    this.countdown();
    this.refreshScore();
    this.refreshStage();
  }

  Game.prototype.stretchCanvas = function() {
    var canvas = document.getElementById("grid");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 50;

    this.board.recomputeMetrics();
    this.board.refresh();
  }

  Game.prototype.exitedMaze = function() {
    this.score += 5;
    this.refreshScore();
    this.advanceStage();
  }

  Game.prototype.grabbedStar = function(effect) {
    if (effect == "score") {
      this.stageStars++;
      this.score += this.stageStars * this.stageStars;
      this.refreshScore();

    } else if (effect == "time") {
      this.bonusTime += 10;
    }
  }

  Game.prototype.userActed = function() {
    if (!this.timer) {
      this.started = this.started || Date.now();

      var self = this;
      this.timer = window.setInterval(function() { self.countdown(); }, 100);
    }
  }

  Game.prototype.userPausing = function() {
    this.pausedAfter = this.elapsedTime();
    window.clearInterval(this.timer);
    delete(this.timer);
    var div = document.getElementById("pauseCover");
    var rect = this.canvas.getBoundingClientRect();
    div.style.top = rect.top;
    div.style.left = rect.left;
    div.style.width = rect.width;
    div.style.height = rect.height;
    this.canvas.className = "hide";
    div.className = "show";
  }

  Game.prototype.userUnpausing = function() {
    var div = document.getElementById("pauseCover");
    div.className = "hide";
    this.canvas.className = "show";
    this.bonusTime = 0;
    this.started = Date.now() - this.pausedAfter;
    this.userActed();
  }

  Game.prototype.gameOver = function() {
    window.clearInterval(this.timer);

    this.canvas.style.opacity = 0.25;
    var timeTag = document.getElementById("timeRemaining");
    timeTag.innerHTML = "TIME UP";

    var blinkIntervals = [1, 0.5];
    var blink = -1;

    var blinkFn = function() {
      blink += 1;

      if (blink % 2 == 0)
        timeTag.style.display = "block";
      else
        timeTag.style.display = "none";

      setTimeout(blinkFn, blinkIntervals[blink % blinkIntervals.length] * 1000);
    };

    blinkFn();
  }

  Game.prototype.elapsedTime = function() {
    return Date.now() - this.started - this.bonusTime * 1000;
  }

  Game.prototype.countdown = function() {
    label = "1:00.0";
    var timeTag = document.getElementById("timeRemaining");

    if (this.started) {
      var elapsed = this.elapsedTime();
      var remaining = Math.round((this.duration - elapsed) / 100);

      if (remaining < 0) {
        this.gameOver();
        return;
      } else if (remaining < 100) {
        timeTag.className = "alert";
      } else if (remaining < 300) {
        timeTag.className = "warning";
      } else {
        timeTag.className = "";
      }

      var tenths = remaining % 10;
      var seconds = Math.floor(remaining / 10) % 60;
      var minutes = Math.floor(remaining / 600)

      label = "" + tenths;
      label = "" + seconds + "." + label;
      while (label.length < 4) label = "0" + label;
      label = "" + minutes + ":" + label;
    }

    timeTag.innerHTML = "[" + label + "]";
  }

  Game.prototype.refreshScore = function() {
    var scoreTag = document.getElementById("score");
    scoreTag.innerHTML = this.score;
  }

  Game.prototype.refreshStage = function() {
    var stageTag = document.getElementById("stage");
    stageTag.innerHTML = this.stage + 1;
  }

  Game.prototype.gridForStage = function(stage) {
    if (stage >= this.levels.length) stage = this.levels.length-1;

    var size = this.levels[stage];
    var swap = (size[3] > size[2]) && this.rand.flipCoin();
    var grid = new Grid(this.rand,
      size[0], size[1],
      swap ? size[3] : size[2],
      swap ? size[2] : size[3]);
    grid.growingTreeMix(0.25);

    return grid;
  }

  Game.prototype.advanceStage = function() {
    this.stage++;
    this.stageStars = 0;
    this.board.reset(this.gridForStage(this.stage));
    this.board.refresh();
    this.refreshStage();
  }

  Game.prototype.jumpToStage = function(stage) {
    this.stage = stage - 2;
    if (this.stage < -1) this.stage = -1;
    this.advanceStage();
  }

  exports.Game = Game;

})(this);
