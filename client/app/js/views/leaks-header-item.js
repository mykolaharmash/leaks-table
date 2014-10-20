'use strict'

function LeaksHeaderItemView (opts) {
  var self = this
    , clickSelector
    , $document = $(document)
    ;

  this.template = _.template($("#leaks-header-item-view").html());
  this.columnKey = opts.columnKey;
  this.columnName = opts.columnName;
  this.sortable = opts.sortable;
  this.sortState = opts.sortState;

  clickSelector = ".leaks-header-item." + self.columnKey;

  $document.on("click.leaksHeaderItem", clickSelector, function (e) {
    self.toggleCollumnSort();
  });

  $document.on("resetSortState.leaksHeaderItem", function (e) {
    self.resetSortState();
  });
}

LeaksHeaderItemView.prototype.resetSortState = function () {
  this.el.removeClass("up down");
}

LeaksHeaderItemView.prototype.toggleCollumnSort = function () {
  var self = this
    , $document = $(document)
    , newSortState
    ;

  $document.trigger("resetSortState.leaksHeaderItem");
  if (!self.sortState || self.sortState == "down") {
    newSortState = "up";
  } else {
    newSortState = "down";
  }

  self.sortState = newSortState;
  self.el.addClass(newSortState);

  $document.trigger("leaksList.updateSortState", {
    columnKey: self.columnKey,
    sortState: newSortState
  });
  $document.trigger("leaksList.refresh");
}

LeaksHeaderItemView.prototype.render = function () {
  var self = this;

  self.el = $(self.template(self));
  return self.el;
}

module.exports = LeaksHeaderItemView;