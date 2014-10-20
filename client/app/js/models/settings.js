'use strict'

function SettingsModel () {
  this.columnsOrder = window.App.leaksModel.getColumnsOrder();
  this.lockedColumns = window.App.leaksModel.lockedColumns;
}

SettingsModel.prototype.updateColumnsOrder = function (order) {
  this.columnsOrder = order;
}

SettingsModel.prototype.locked = function (columnKey) {
  return this.lockedColumns.indexOf(columnKey) !== -1
}

SettingsModel.prototype.save = function () {
  $(document).trigger("settings.save", [this.columnsOrder]);
}

module.exports = SettingsModel;
