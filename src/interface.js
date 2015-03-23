(function(exports) {

  var Interface = function() {
    var self = this;

    this.currentGame = null;
    this.currentPanel = document.getElementById("intro");

    var choices = document.getElementsByClassName("choices")[0];
    choices.addEventListener("click",
      function(event) { self.choiceClicked(event); });

    var info = document.getElementById("info");
    info.addEventListener("click",
      function(event) { self.doneClicked(event); });
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

  Interface.prototype.choiceClicked = function(event) {
    event.preventDefault();

    switch(event.target.className) {
      case "opt-easy":
      case "opt-medium":
      case "opt-hard":
        var difficulty = event.target.className.slice(4);

        if (this.currentGame) {
          this.currentGame.resetGame(difficulty);
        } else {
          this.currentGame = new Game("grid", difficulty);
        }

        var board = document.getElementById("board");
        this.selectPanel(board);
        break;
      case "opt-info":
        var info = document.getElementById("info");
        this.selectPanel(info);
        break;
    }
  }

  window.addEventListener("load", function() { new Interface(); });

})(this);
