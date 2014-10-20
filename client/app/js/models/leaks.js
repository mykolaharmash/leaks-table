'use strict'

var LeaksPageModel = require("./leaks-page");

function LeaksModel () {
  var self = this;
  self.clear();
  self.lockedColumns = ["name"];
  self.defaultColumnsOrder = [
    "name",
    "card",
    "pin",
    "date_till",
    "credit",
    "actual",
    "phone"
  ];
  self.defaultSortState = {};

  $(document).on("leaksList.updateSortState", function (e, sortState) {
    self.updateSortState(sortState);
  });

  $(document).on("settings.save", function (e, columnsOrder) {
    self.updateColumnsOrder(columnsOrder);
  });
}

LeaksModel.prototype.updateSortState = function (columnSortState) {
  var self = this
    , sortState = {}
    ;

  sortState[columnSortState.columnKey] = columnSortState.sortState;
  window.App.storage.set("sort_state", sortState);
}

LeaksModel.prototype.updateColumnsOrder = function (columnsOrder) {
  window.App.storage.set("columns_order", columnsOrder);
  $(document).trigger("leaksList.refreshAll");
}

LeaksModel.prototype.getColumnsOrder = function () {
  return window.App.storage.get("columns_order") || this.defaultColumnsOrder
}

LeaksModel.prototype.getSortState = function () {
  return window.App.storage.get("sort_state") || this.defaultSortState
}

LeaksModel.prototype.addPage = function () {
  var self = this;
  var opts = {
    pageNum: ++this.pageNum
  };
  var page = new LeaksPageModel(opts);
  page.fetch().then(function (res) {
    if (!_.isEmpty(res)) {
      self.pages.push(page)
      $(document).trigger("leaksPage.added", page);
    }
  });
}

LeaksModel.prototype.clear = function () {
  this.pages = [];
  this.pageNum = 0;
  $(document).trigger("leaksList.cleared");
}

LeaksModel.prototype.refresh = function () {
  this.clear();
  this.addPage();
}

module.exports = LeaksModel;