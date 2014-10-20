'use strict'

var LeaksHeaderItemView = require("./leaks-header-item");

function LeaksHeaderView () {
  this.sortableColumns = ["date_till", "credit"]
}

LeaksHeaderView.prototype.render = function () {
  var self = this
    , columnsOrder = App.leaksModel.getColumnsOrder()
    , sortState = App.leaksModel.getSortState()
    , headerColumns = []
    ;

  columnsOrder.forEach(function (columnKey) {
    var sortable = self.sortableColumns.indexOf(columnKey) !== -1
      , columnName = window.App.columnsNames[columnKey]
      , column
      ;

    column = new LeaksHeaderItemView({
      columnKey: columnKey,
      columnName: columnName,
      sortable: sortable,
      sortState: sortState[columnKey]
    });
    headerColumns.push(column.render());
  });
  return headerColumns;
}

module.exports = LeaksHeaderView;