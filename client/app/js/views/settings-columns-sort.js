'use strict'

function SettingsColumnsSortView (settingsModel) {
  this.columnTemplate = _.template($("#settings-column-sort-item").html());
  this.listEl = $(".columns-order");
  this.model = settingsModel;
  this.columns = [];
}

SettingsColumnsSortView.prototype.render = function () {
  var self = this
    , columnsOrder = self.model.columnsOrder
    ;

  columnsOrder.forEach(function (columnKey) {
    var columnEl = $(self.columnTemplate({
      columnName: window.App.columnsNames[columnKey],
      locked: self.model.locked(columnKey)
    }));
    columnEl.data("column-key", columnKey);
    self.columns.push(columnEl);
  });
  return self.columns;
}

SettingsColumnsSortView.prototype.initSortable = function () {
  var self = this
    , opts
    ;

  opts = {
    items: ":not(.locked)"
  };
  self.listEl.sortable(opts).bind("sortupdate", function () {
    self.updateOrder()
  });
}

SettingsColumnsSortView.prototype.updateOrder = function () {
  var newOrder;

  newOrder = $.map(this.listEl.find(".order-column-item"), function (columnEl) {
    return $(columnEl).data("column-key");
  });
  this.model.updateColumnsOrder(newOrder);
}

module.exports = SettingsColumnsSortView;
