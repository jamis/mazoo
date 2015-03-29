(function(exports) {

  var Interface = function() {
    var self = this;

    this.currentGame = null;
    this.currentPanel = document.getElementById("intro");

    var choices = document.getElementsByClassName("choices")[0];
    choices.addEventListener("click",
      function(event) { self.choiceClicked(event); });

    var anchors = document.getElementsByClassName("done");
    for(var i = 0; i < anchors.length; i++) {
      var anchor = anchors[i];
      if (anchor.tagName == "A") {
        anchor.addEventListener("click",
          function(event) { self.doneClicked(event); });
      }
    }

    var operations = document.getElementsByClassName("operations")[0];
    operations.addEventListener("click",
      function(event) { self.operationClicked(event); });
  }

  Interface.prototype.selectPanel = function(panel) {
    this.previousPanel = this.currentPanel;
    this.currentPanel.style.display = "none";
    panel.style.display = "block";

    this.currentPanel = panel;
  }

  Interface.prototype.doneClicked = function(event) {
    if (event.target.className.match(/\bdone\b/)) {
      event.preventDefault();
      this.selectPanel(this.previousPanel);
    }
  }

  Interface.prototype.operationClicked = function(event) {
    event.preventDefault();

    var operation = event.target.dataset.operation;
    switch(operation) {
      case "resume":
        this.currentGame.board.togglePause();
        break;
      case "quit":
        this.selectPanel(document.getElementById("intro"));
        break;
    }
  }

  Interface.prototype.choiceClicked = function(event) {
    event.preventDefault();

    var mode = event.target.dataset.mode;
    switch(mode) {
      case "easy":
      case "medium":
      case "hard":
        if (this.currentGame) {
          this.currentGame.resetGame(mode);
        } else {
          this.currentGame = new Game("grid", mode);
        }

        var board = document.getElementById("board");
        this.selectPanel(board);
        break;
      case "how":
      case "info":
        var panel = document.getElementById(mode);
        this.selectPanel(panel);
        break;
    }
  }

  window.addEventListener("load", function() { window.gameUI = new Interface(); });

})(this);
