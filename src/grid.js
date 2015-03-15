(function(exports) {

  Grid = function (worlds, levels, rows, columns) {
    this.rand = new MersenneTwister;
    this.worlds = worlds;
    this.levels = levels;
    this.rows = rows;
    this.columns = columns;
    this.size = worlds * levels * rows * columns;
    this.cells = [];

    for(var world = 0; world < worlds; world++) {
      this.cells[world] = worldArray = [];

      for(var level = 0; level < levels; level++) {
        worldArray[level] = levelArray = [];

        for(var row = 0; row < rows; row++) {
          levelArray[row] = rowArray = [];

          for(var column = 0; column < columns; column++) {
            rowArray[column] = new Cell(this.rand, world, level, row, column);
          }
        }
      }
    }

    _this = this;
    this.eachCell(function(cell) {
      var world  = cell.world;
      var level  = cell.level;
      var row    = cell.row;
      var column = cell.column;

      cell.west   = _this.at(world, level, row, column-1);
      cell.east   = _this.at(world, level, row, column+1);
      cell.north  = _this.at(world, level, row-1, column);
      cell.south  = _this.at(world, level, row+1, column);
      cell.down   = _this.at(world, level-1, row, column);
      cell.up     = _this.at(world, level+1, row, column);
      cell.hither = _this.at(world-1, level, row, column);
      cell.yon    = _this.at(world+1, level, row, column);
    });
  }

  Grid.prototype.at = function(world, level, row, column) {
    if (world < 0 || world >= this.worlds) return;
    if (level < 0 || level >= this.levels) return;
    if (row < 0 || row >= this.rows) return;
    if (column < 0 || column >= this.columns) return;

    return this.cells[world][level][row][column];
  }

  Grid.prototype.randomCell = function() {
    var world  = this.rand.random(this.worlds);
    var level  = this.rand.random(this.levels);
    var row    = this.rand.random(this.rows);
    var column = this.rand.random(this.columns);

    return this.at(world, level, row, column);
  }

  Grid.prototype.deadEnds = function() {
    var list = []

    this.eachCell(function(cell) {
      if (cell.isDeadEnd())
        list.push(cell);
    });

    return list;
  }

  Grid.prototype.eachCell = function(callback) {
    for(var world = 0; world < this.worlds; world++) {
      for(var level = 0; level < this.levels; level++) {
        for(var row = 0; row < this.rows; row++) {
          for(var column = 0; column < this.columns; column++) {
            var cell = this.cells[world][level][row][column];
            if (callback(cell) == false) return;
          }
        }
      }
    }
  }

  Grid.prototype.growingTreeMix = function(p) {
    p = p || 0.5;
    var list = [];
    list.push(this.randomCell());

    while (list.length > 0) {
      var cellIndex;

      if (this.rand.random() < p) {
        cellIndex = -1;
        var minWeight = 100000;
        for(var i = 0; i < list.length; i++) {
          if (list[i].weight < minWeight) {
            cellIndex = i;
            minWeight = list[i].weight;
          }
        }
      } else {
        cellIndex = list.length-1;
      }

      var cell = list[cellIndex];
      var target = cell.randomUnvisitedNeighbor("level");

      if (target) {
        cell.link(target);
        list.push(target);
      } else {
        list.splice(cellIndex, 1);
      }
    }
  }

  Grid.prototype.backtracker = function() {
    var stack = [];
    stack.push(this.randomCell());

    while (stack.length > 0) {
      var current = stack[stack.length-1];
      var target = cell.randomUnvisitedNeighbor();

      if (target) {
        current.link(target);
        stack.push(target);
      } else {
        stack.pop();
      }
    }
  }

  exports.Grid = Grid;

})(this);
