var Storage = require("./js/storage")
  , LeaksModel = require("./js/models/leaks")
  , SettingsModel = require("./js/models/settings")
  , AppView = require("./js/views/app")
  , App = {}
  ;

window.App = App;

App.init = function () {
  this.columnsNames = {
    "name": "Name",
    "pin": "PIN",
    "phone": "Phone Number",
    "date_till": "Date Till",
    "credit": "Balance",
    "card": "Card Number",
    "actual": "Actual"
  };

  this.storage = new Storage();
  this.leaksModel = new LeaksModel();
  this.settings = new SettingsModel();

  new AppView();

  this.leaksModel.addPage();
}

$(document).ready(function () {
  App.init()
});