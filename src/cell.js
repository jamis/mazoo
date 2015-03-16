(function(exports) {

  var Cell = function (rand, world, level, row, column) {
    this.rand = rand;
    this.world = world;
    this.level = level;
    this.row = row;
    this.column = column;
    this._linked = {};
    this._links = [];
    this._paths = [];
    this.weight = rand.random(20);

    this.name = "w" + world + "l" + level + "r" + row + "c" + column;
  }

  Cell.prototype.exit = function(direction, name) {
    if (!this[direction]) {
      this[direction] = new Cell(this.rand);
      this[direction].name = name;
      this[direction][Opposite[direction]] = this;
      this.link(this[direction])
      return this[direction];
    }
  }

  Cell.prototype.exits = function() {
    map = {};

    if (this.isLinkedTo(this.north)) map.north = this.north;
    if (this.isLinkedTo(this.south)) map.south = this.south;
    if (this.isLinkedTo(this.east)) map.east = this.east;
    if (this.isLinkedTo(this.west)) map.west = this.west;
    if (this.isLinkedTo(this.up)) map.up = this.up;
    if (this.isLinkedTo(this.down)) map.down = this.down;
    if (this.isLinkedTo(this.hither)) map.hither = this.hither;
    if (this.isLinkedTo(this.yon)) map.yon = this.yon;

    return map;
  }

  Cell.prototype.neighbors = function() {
    list = [];
    if (this.north) list.push(this.north);
    if (this.south) list.push(this.south);
    if (this.east) list.push(this.east);
    if (this.west) list.push(this.west);
    if (this.up) list.push(this.up);
    if (this.down) list.push(this.down);
    if (this.hither) list.push(this.hither);
    if (this.yon) list.push(this.yon);
    return list;
  }

  Cell.prototype.link = function(cell) {
    this._links.push(cell);
    cell._links.push(this);
  }

  Cell.prototype.isLinkedTo = function(cell) {
    return this._links.indexOf(cell) >= 0;
  }

  Cell.prototype.isLinked = function() {
    return this._links.length > 0;
  }

  Cell.prototype.links = function() {
    return this._links.slice(0);
  }

  Cell.prototype.walk = function(direction) {
    this._paths.push(direction);
  }

  Cell.prototype.unwalk = function(direction) {
    var idx = this._paths.indexOf(direction);
    if (idx >= 0) this._paths.splice(idx, 1);
  }

  Cell.prototype.isWalked = function() {
    return this._paths.length > 0;
  }

  Cell.prototype.hasWalked = function(direction) {
    return this._paths.indexOf(direction) >= 0;
  }

  Cell.prototype.isDeadEnd = function() {
    return this._links.length <= 1;
  }

  Cell.prototype.unvisitedNeighbors = function() {
    var neighbors = this.neighbors();

    // filter unvisited
    var unvisited = [];
    for(var i = 0; i < neighbors.length; i++) {
      if (!neighbors[i].isLinked()) unvisited.push(neighbors[i]);
    }

    return this.rand.shuffle(unvisited);
  }

  Cell.prototype.randomUnvisitedNeighbor = function(strategy) {
    var neighbors = this.unvisitedNeighbors();

    if (neighbors.length > 0) {
      if (strategy === "level") {
        var prefs = [[], [], []];
        for(var i = 0; i < neighbors.length; i++) {
          var neighbor = neighbors[i];
          if (neighbor.world === this.world)
            if (neighbor.level === this.level)
              prefs[0].push(neighbor);
            else
              prefs[1].push(neighbor);
          else
            prefs[2].push(neighbor);
        }

        if (prefs[0].length > 0)
          neighbors = prefs[0];
        else if (prefs[1].length > 0)
          neighbors = prefs[1];
      }

      return this.rand.sample(neighbors);
    }

    return undefined;
  }

  Cell.prototype.floodFromHere = function(cutoff) {
    var matrix = new WeightMatrix(this);
    var frontier = [ this ];

    while (frontier.length > 0) {
      var newFrontier = [];

      for (var i = 0; i < frontier.length; i++) {
        var cell = frontier[i];
        var links = cell.links();
        var distance = matrix.of(cell);

        if (cutoff && cutoff[cell.name])
          return matrix;

        for (var n = 0; n < links.length; n++) {
          if (matrix.of(links[n]) == undefined) {
            matrix.add(links[n], distance + 1);
            newFrontier.push(links[n]);
          }
        }
      }

      frontier = newFrontier;
    }

    return matrix;
  }

  Cell.prototype.distanceFromPath = function(path) {
    var matrix = this.floodFromHere(path);
    return matrix.maximumWeight;
  }

  exports.Cell = Cell;

})(this);
