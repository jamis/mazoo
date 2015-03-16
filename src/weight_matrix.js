(function(exports) {

  var WeightMatrix = function(root) {
    this.root = root;
    this.heaviest = null;
    this.maximumWeight = 0;
    this.add(root, 0);
  }

  WeightMatrix.prototype.of = function(cell) {
    return this[cell.name];
  }

  WeightMatrix.prototype.add = function(cell, weight) {
    this[cell.name] = weight;

    if (weight > this.maximumWeight) {
      this.heaviest = cell;
      this.maximumWeight = weight;
    }
  }

  WeightMatrix.prototype.pathTo = function(goal) {
    var path = [ goal ];
    path[goal.name] = this[goal.name];

    while (path[0] != this.root) {
      var links = path[0].links();
      var d = this[path[0].name];
      for (var i = 0; i < links.length; i++) {
        var neighbor = links[i];
        if (this[neighbor.name] < d) {
          path.unshift(neighbor);
          path[neighbor.name] = this[neighbor.name];
          break;
        }
      }
    }

    return path;
  }

  exports.WeightMatrix = WeightMatrix;

})(this);
