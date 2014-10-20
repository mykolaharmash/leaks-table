'use strict'

var LeaksPageView = require("./leaks-page")
  , LeaksHeaderView = require("./leaks-header")
  , SettingsColumnsSortView = require("./settings-columns-sort")
  ;

function AppView () {
  var self = this;
  self.listEl = $("#leaks-list");
  self.listHeaderEl = $("#leaks-list-header");
  self.settingsOrderEl = $("#settings .columns-order");
  self.showSettingsColumnsOrder();
  self.showHeader();

  $(document).on("leaksPage.added", function (event, pageModel) {
    self.showPage(pageModel);
  });

  $(document).on("leaksList.cleared", function (event) {
    self.clearList();
  });

  $(document).on("leaksList.refresh", function (event, pageModel) {
    window.App.leaksModel.refresh();
  });

  $(document).on("leaksList.refreshAll", function (event, pageModel) {
    self.clearHeader();
    self.showHeader();
    window.App.leaksModel.refresh();
  });

  $("#load-more").on("click", function () {
    window.App.leaksModel.addPage();
  });

  $("#save-settings").on("click", function () {
    window.App.settings.save();
  });
}

AppView.prototype.showSettingsColumnsOrder = function () {
  var self = this
    , orderView = new SettingsColumnsSortView(window.App.settings)
    ;
  self.settingsOrderEl.append(orderView.render());
  orderView.initSortable();
}

AppView.prototype.showHeader = function () {
  var headerView = new LeaksHeaderView();
  this.listHeaderEl.append(headerView.render());
}

AppView.prototype.showPage = function (pageModel) {
  var pageView = new LeaksPageView(pageModel);
  this.listEl.append(pageView.render());
}

AppView.prototype.clearList = function (pageModel) {
  this.listEl.html("");
}

AppView.prototype.clearHeader = function (pageModel) {
  $(document).off(".leaksHeaderItem");
  this.listHeaderEl.html("");
}

module.exports = AppView;