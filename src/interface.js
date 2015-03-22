(function(exports) {

  var Interface = function() {
    var choices = document.getElementsByClassName("choices")[0];
    var self = this;

    this.currentGame = null;
    this.currentPanel = document.getElementById("intro");

    choices.addEventListener("click",
      function(event) { self.choiceClicked(event); });
  }

  Interface.prototype.selectPanel = function(panel) {
    this.currentPanel.style.display = "none";
    panel.style.display = "block";

    this.currentPanel = panel;
  }

  Interface.prototype.choiceClicked = function(event) {
    event.preventDefault();

    switch(event.target.className) {
      case "opt-easy":
      case "opt-medium":
      case "opt-hard":
        var difficulty = event.target.className.slice(4);
        this.currentGame = new Game("grid", difficulty);

        var board = document.getElementById("board");
        this.selectPanel(board);
        break;
      case "opt-about":
        alert("FIXME");
        break;
    }
  }

  window.addEventListener("load", function() { new Interface(); });

})(this);
