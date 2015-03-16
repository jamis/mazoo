(function(exports) {

  var Board = function(canvas) {
    this.canvas = canvas;
    this.active = true;

    var self = this;
    document.body.addEventListener("keypress", function(event) {
      self.onKeyPress(event);
      event.preventDefault();
    });

    this.canvas.addEventListener("mousedown", function(event) {
      self.onMouseDown(event);
      event.preventDefault();
    });
    this.canvas.addEventListener("mousemove", function(event) {
      self.onMouseMove(event);
      event.preventDefault();
    });
    this.canvas.addEventListener("mouseup", function(event) {
      self.onMouseUp(event);
      event.preventDefault();
    });

    this.canvas.addEventListener("touchstart", function(event) {
      self.onTouchStart(event);
      event.preventDefault();
    });
    this.canvas.addEventListener("touchmove", function(event) {
      self.onTouchMove(event);
      event.preventDefault();
    });
    this.canvas.addEventListener("touchend", function(event) {
      self.onTouchEnd(event);
      event.preventDefault();
    });
  }

  Board.prototype.reset = function(grid) {
    this.grid = grid;
    this.recomputeMetrics();

    this.current = grid.at(0,0,0,0);

    this.start = this.current.exit("west", "entrance.cell");
    this.finish = grid.at(grid.worlds-1,grid.levels-1,grid.rows-1,grid.columns-1).exit("east", "exit.cell");

    // initial path into maze
    this.current.walk("west");

    this.matrix = this.start.floodFromHere();
    this.solution = this.matrix.pathTo(this.finish);

    var deadEnds = grid.rand.shuffleCopy(grid.deadEnds());
    /*
    for(var i = 0; i < deadEnds.length; i++) {
      deadEnds[i].distanceFromSolution = deadEnds[i].distanceFromPath(this.solution);
    }

    var orderedDeadEnds = deadEnds.sort(function(a, b) {
      return b.distanceFromSolution - a.distanceFromSolution; });
    */

    for(var i = 0; i < 3; i++) {
      if (i >= deadEnds.length) break;
      deadEnds[i].hasStar = (i == 2 ? "time" : "score");
    }
  }

  Board.prototype.hasFoundExit = function() {
    return (this.current === this.finish);
  }

  Board.prototype.exitedMaze = function() {
    console.log("exited maze");
  }

  Board.prototype.grabbedStar = function() {
    console.log("grabbed a star");
  }

  Board.prototype.acted = function() {
    console.log("acted");
  }

  Board.prototype.pausing = function() {
    console.log("pausing");
  }

  Board.prototype.unpausing = function() {
    console.log("unpausing");
  }

  Board.prototype.recomputeMetrics = function() {
    if (!this.grid) return;

    this.cellWidth = this.canvas.width /
      (this.grid.columns * this.grid.levels + 0.5 * (this.grid.levels + 1) + 2);
    this.cellHeight = this.canvas.height /
      (this.grid.rows * this.grid.worlds + 0.5 * (this.grid.worlds + 1));

    if (this.cellWidth > this.cellHeight)
      this.cellWidth = this.cellHeight;
    else if(this.cellHeight > this.cellWidth)
      this.cellHeight = this.cellWidth;

    this.marginX = this.cellWidth / 2;
    this.marginY = this.cellHeight / 2;

    this.levelWidth = this.grid.columns * this.cellWidth;
    this.levelHeight = this.grid.rows * this.cellHeight;

    this.worldWidth = this.levelWidth * this.grid.levels + (this.grid.levels + 1) * this.marginX;
    this.universeHeight = this.levelHeight * this.grid.worlds + (this.grid.worlds + 1) * this.marginY;

    this.offsetX = (this.canvas.width - this.worldWidth) / 2;
    this.offsetY = (this.canvas.height - this.universeHeight) / 2;
  }

  Board.prototype.refresh = function() {
    if (!this.grid) return;

    var PathColor = "#cfaf7f";

    var ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.lineCap = "round";
    var lineWidth = Math.round(this.cellWidth * 0.05);
    if (lineWidth < 1) lineWidth = 1;
    ctx.lineWidth = lineWidth;

    ctx.save();
    ctx.translate(this.offsetX, this.offsetY);

    var self = this;

    var position = function(cell) {
      var x = Math.floor(self.marginX +
        (cell.level * (self.levelWidth + self.marginX)) +
        self.cellWidth * cell.column);
      var y = Math.floor(self.marginY +
        (cell.world * (self.levelHeight + self.marginY)) +
        self.cellHeight * cell.row);

      return { x: x, y: y };
    }

    if (!this.hasFoundExit()) {
      // == highlight current cell ==
      var pos = position(this.current);
      ctx.fillStyle= "#ffffdf";
      ctx.fillRect(pos.x, pos.y, this.cellWidth, this.cellHeight);

      // == highlight adjacent cells ==
      ctx.fillStyle= "#fafadf";
      var exits = this.current.links();
      for(var i = 0; i < exits.length; i++) {
        var pos;

        if (exits[i] == this.finish) {
          pos = position(exits[i].links()[0]);
          pos.x += this.cellWidth;
        } else if (exits[i] == this.start) {
          pos = position(exits[i].links()[0]);
          pos.x -= this.cellWidth;
        } else {
          pos = position(exits[i]);
        }

        ctx.fillRect(pos.x, pos.y, this.cellWidth, this.cellHeight);
      }
    }

    // ==== starting point ===
    var pos = position(this.start.links()[0]);
    ctx.save();
      ctx.strokeStyle = PathColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(pos.x-this.cellWidth/2, pos.y+this.cellHeight/2);
      ctx.lineTo(pos.x, pos.y+this.cellHeight/2);
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = PathColor;
      ctx.fillStyle = "#7f5f3f";
      ctx.arc(pos.x-this.cellWidth/2, pos.y+this.cellHeight/2, this.cellWidth/4, 0, 2*Math.PI);
      ctx.fill();
      ctx.stroke();
    ctx.restore();

    // ==== exit point ===
    var pos = position(this.finish.links()[0]);
    ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = PathColor;
      ctx.fillStyle = "#7f5f3f";
      ctx.arc(pos.x+1.5*this.cellWidth, pos.y+this.cellHeight/2, this.cellWidth/4, 0, 2*Math.PI);
      ctx.fill();
      ctx.stroke();
    ctx.restore();

    this.grid.eachCell(function(cell) {
      var pos = position(cell);
      var x = pos.x;
      var y = pos.y;

      // === draw cell boundary walls ===
      ctx.beginPath();
      ctx.strokeStyle = "#000000";

        if (!cell.west) {
          ctx.moveTo(x+0.5, y);
          ctx.lineTo(x+0.5, y+self.cellHeight);
        }

        if (!cell.north) {
          ctx.moveTo(x, y+0.5);
          ctx.lineTo(x+self.cellWidth, y+0.5);
        }

        if (!cell.isLinkedTo(cell.east)) {
          ctx.moveTo(Math.floor(x+self.cellWidth)+0.5, y);
          ctx.lineTo(Math.floor(x+self.cellWidth)+0.5, y+self.cellHeight);
        }

        if (!cell.isLinkedTo(cell.south)) {
          ctx.moveTo(x, Math.floor(y+self.cellHeight)+0.5);
          ctx.lineTo(x+self.cellWidth, Math.floor(y+self.cellHeight)+0.5);
        }

      ctx.stroke();

      var insetX = self.cellWidth * 0.15;
      var insetY = self.cellHeight * 0.15;

      var x1 = x + insetX;
      var x2 = x + 2*insetX;
      var xm = x + self.cellWidth / 2;
      var x3 = x + self.cellWidth - 2*insetX;
      var x4 = x + self.cellWidth - insetX;

      var y1 = y + insetY;
      var y2 = y + 2*insetY;
      var ym = y + self.cellHeight / 2;
      var y3 = y + self.cellWidth - 2*insetY;
      var y4 = y + self.cellWidth - insetY;

      // === draw path through maze ===
      if (cell.isWalked()) {
        ctx.save();
        ctx.strokeStyle = PathColor;
        ctx.lineCap = "round";

        ctx.beginPath();
        ctx.lineWidth = 4;

          if (cell.hasWalked("east")) {
            ctx.moveTo(xm, ym);
            ctx.lineTo(x + self.cellWidth, ym);
          }

          if (cell.hasWalked("west")) {
            ctx.moveTo(x, ym);
            ctx.lineTo(xm, ym);
          }

          if (cell.hasWalked("north")) {
            ctx.moveTo(xm, y);
            ctx.lineTo(xm, ym);
          }

          if (cell.hasWalked("south")) {
            ctx.moveTo(xm, ym);
            ctx.lineTo(xm, y + self.cellHeight);
          }

          if (cell.hasWalked("down")) {
            ctx.moveTo(xm, ym);
            ctx.lineTo(x2, ym);
          }

          if (cell.hasWalked("up")) {
            ctx.moveTo(xm, ym);
            ctx.lineTo(x3, ym);
          }

          if (cell.hasWalked("hither")) {
            ctx.moveTo(xm, y2);
            ctx.lineTo(xm, ym);
          }

          if (cell.hasWalked("yon")) {
            ctx.moveTo(xm, ym);
            ctx.lineTo(xm, y3);
          }

        ctx.stroke();
        ctx.restore();
      }

      // === draw up/down and hither/yon arrows ===
      ctx.beginPath();
      ctx.strokeStyle = "#ff7f7f";
      ctx.fillStyle = "#ff7f7f";

        if (cell.isLinkedTo(cell.down)) {
          ctx.moveTo(x2, y2);
          ctx.lineTo(x2, y3);
          ctx.lineTo(x1, ym);
          ctx.closePath();
        }

        if (cell.isLinkedTo(cell.up)) {
          ctx.moveTo(x3, y2);
          ctx.lineTo(x3, y3);
          ctx.lineTo(x4, ym);
          ctx.closePath();
        }

        if (cell.isLinkedTo(cell.hither)) {
          ctx.moveTo(x2, y2);
          ctx.lineTo(x3, y2);
          ctx.lineTo(xm, y1);
          ctx.closePath();
        }

        if (cell.isLinkedTo(cell.yon)) {
          ctx.moveTo(x2, y3);
          ctx.lineTo(x3, y3);
          ctx.lineTo(xm, y4);
          ctx.closePath();
        }

      ctx.fill();
      ctx.stroke();

      // === draw star ===
      if (cell.hasStar) {
        ctx.beginPath();
        if (cell.hasStar == "score") {
          ctx.fillStyle = "#ffff00";
          ctx.strokeStyle = "#afaf00";
        } else {
          ctx.fillStyle = "#0000ff";
          ctx.strokeStyle = "#0000af";
        }
        var radius = self.cellWidth / 8;
        var points = 5;
        var inc = Math.PI / points;
        for(var point = 0; point < points; point++) {
          var outerX = xm + 2 * radius * Math.cos(inc*2*point);
          var outerY = ym + 2 * radius * Math.sin(inc*2*point);
          var innerX = xm + 0.75 * radius * Math.cos(inc*(2*point+1));
          var innerY = ym + 0.75 * radius * Math.sin(inc*(2*point+1));

          if (point == 0)
            ctx.moveTo(outerX, outerY);
          else
            ctx.lineTo(outerX, outerY);

          ctx.lineTo(innerX, innerY);
        }

        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // === draw current cell indicator ===
      if (cell === self.current) {
        ctx.beginPath();
        ctx.fillStyle = PathColor;
        ctx.arc(xm, ym, self.cellWidth/8, 0, 2*Math.PI);
        ctx.fill();
      }
    });

    ctx.restore();
  }

  Board.prototype.solve = function(start, finish) {
    start = start || this.start;
    finish = finish || this.finish;

    var matrix = start.floodFromHere();
    var path = matrix.pathTo(finish);

    for(var i = 0; i < path.length-1; i++) {
      var exits = path[i].exits();
      var found = false;

      for(direction in exits) {
        if (exits[direction] == path[i+1]) {
          path[i].walk(direction);
          path[i+1].walk(Opposite[direction]);
          break;
        }
      }
    }
  }

  Board.prototype.goTo = function(cell) {
    var exits = this.current.exits();
    for(var direction in exits) {
      if (cell === exits[direction]) {
        this.go(direction);
        return;
      }
    }
  }

  Board.prototype.go = function(direction) {
    if (this.active && this.current !== this.finish) {
      var target = this.current[direction];

      if (this.current.isLinkedTo(target) && target !== this.start) {
        if (this.current.hasWalked(direction)) {
          this.current.unwalk(direction);
          target.unwalk(Opposite[direction]);
        } else {
          this.current.walk(direction);
          target.walk(Opposite[direction]);
        }

        this.current = target;

        if (this.current.hasStar) {
          this.grabbedStar(this.current.hasStar);
          delete(this.current.hasStar);
        }

        this.refresh();

        this.acted();
        if (this.hasFoundExit())
          this.exitedMaze();
      }
    }
  }

  Board.prototype.togglePause = function() {
    if (this.paused) {
      this.paused = false;
      this.unpausing();
    } else if (this.active) {
      this.paused = true;
      this.pausing();
    }
  }

  Board.prototype.onKeyPress = function(event) {
    var self = this;
    var char;

    if (event.which == null) {
      char = String.fromCharCode(event.keyCode) // IE
    } else if (event.which!=0 && event.charCode!=0) {
      char = String.fromCharCode(event.which)   // the rest
    } else {
      return;
    }

    switch(char) {
      case " ": this.togglePause(); break;

      case "a": this.go("west"); break;
      case "d": this.go("east"); break;
      case "w": this.go("north"); break;
      case "s": this.go("south"); break;

      case "j": this.go("down"); break;
      case "l": this.go("up"); break;
      case "i": this.go("hither"); break;
      case "k": this.go("yon"); break;
    }
  }

  Board.prototype.emulateMouseEvent = function(event, type) {
    var first = event.changedTouches[0];

    var mouseEvent = new MouseEvent(type,
      { pageX: first.pageX, pageY: first.pageY,
        clientX: first.clientX, clientY: first.clientY,
        ctrlKey: false, shiftKey: false, altKey: false,
        metaKey: false, button: 0 });

    this.canvas.dispatchEvent(mouseEvent);
  }

  Board.prototype.onTouchStart = function(event) {
    this.emulateMouseEvent(event, 'mousedown');
  }

  Board.prototype.onTouchEnd = function(event) {
    this.emulateMouseEvent(event, 'mouseup');
  }

  Board.prototype.onTouchMove = function(event) {
    this.emulateMouseEvent(event, 'mousemove');
  }

  Board.prototype.onMouseDown = function(event) {
    this.touchStartX = event.pageX;
    this.touchStartY = event.pageY;
    this.mightBeTap = true;
  }

  Board.prototype.onMouseMove = function(event) {
    if (this.touchStartX) {
      var dx = event.pageX - this.touchStartX;
      var dy = event.pageY - this.touchStartY;

      var mx = Math.abs(dx);
      var my = Math.abs(dy);

      if (this.mightBeTap && (mx > this.cellWidth*0.75 || my > this.cellHeight*0.75))
        this.mightBeTap = false;

      if (!this.mightBeTap) {
        this.touchStartX = event.pageX;
        this.touchStartY = event.pageY;

        var pos = this.cellToPage(this.current);
        pos.x += this.cellWidth / 2;
        pos.y += this.cellHeight / 2;

        var dx = this.touchStartX - pos.x;
        var dy = this.touchStartY - pos.y;

        if (Math.sqrt(dx*dx + dy*dy) > 2*this.cellWidth)
          return;

        if (Math.abs(dx) > Math.abs(dy)) {
          var threshold = this.cellWidth * 0.5;
          if (dx < -threshold)
            this.go("west");
          else if(dx > threshold)
            this.go("east");
        } else {
          var threshold = this.cellHeight * 0.5;
          if (dy < -threshold)
            this.go("north");
          else if(dy > threshold)
            this.go("south");
        }
      }
    }
  }

  Board.prototype.cellToPage = function(cell) {
    var x = this.cellWidth * cell.column;
    var y = this.cellHeight * cell.row;

    x += this.marginX + cell.level * (this.levelWidth + this.marginX);
    y += this.marginY + cell.world * (this.levelHeight + this.marginY);

    x += this.offsetX + this.canvas.offsetLeft;
    y += this.offsetY + this.canvas.offsetTop;

    return {x:x, y:y};
  }

  Board.prototype.pageToLevel = function(pageX, pageY) {
    var rootX = pageX - this.canvas.offsetLeft - this.offsetX;
    var rootY = pageY - this.canvas.offsetTop - this.offsetY;

    var level = Math.floor((rootX - this.marginX) / (this.levelWidth + this.marginX));
    var world = Math.floor((rootY - this.marginY) / (this.levelHeight + this.marginY));

    var x = rootX - this.marginX - (level * (this.levelWidth + this.marginX));
    var y = rootY - this.marginX - (world * (this.levelHeight + this.marginY));

    return {world:world, level:level, x:x, y:y};
  }

  Board.prototype.cellAt = function(pageX, pageY) {
    var pos = this.pageToLevel(pageX, pageY);

    var row = Math.floor(pos.y / this.cellHeight);
    var column = Math.floor(pos.x / this.cellWidth);

    return this.grid.at(pos.world, pos.level, row, column) || this.finish;
  }

  Board.prototype.onMouseUp = function(event) {
    if (this.mightBeTap) {
      var cell = this.cellAt(event.pageX, event.pageY);
      this.goTo(cell);
    }

    delete(this.touchStartX);
    delete(this.touchStartY);
  }

  exports.Board = Board;

})(this);
