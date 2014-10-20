(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/Nikolay/dev/table/client/app/js/models/leak.js":[function(require,module,exports){
'use strict'

function LeakModel (opts) {
  this.data = opts.data || {};
}

LeakModel.prototype.getData = function () {
  return this.data;
}

module.exports = LeakModel;

},{}],"/Users/Nikolay/dev/table/client/app/js/models/leaks-page.js":[function(require,module,exports){
'use strict'

var LeakModel = require("./leak");

function LeaksPageModel (opts) {
  this.pageSize = 20;
  this.leaks = [];
  this.pageNum = opts.pageNum;
}

LeaksPageModel.prototype.fetch = function () {
  var self = this;
  var params = {
    pageNum: self.pageNum,
    pageSize: self.pageSize,
    sort: window.App.leaksModel.getSortState()
  }
  return $.get("/leaks/fetch", params)
    .then(function (res) {
      if (!_.isEmpty(res)) {
        self.parseCollection(res);
      }
      return res;
    })
}

LeaksPageModel.prototype.parseCollection = function (data) {
  var self = this;
    data.forEach(function (item) {
      var leak = new LeakModel({
        data: item
      })
      self.leaks.push(leak)
    });
  }

LeaksPageModel.prototype.getLeaks = function () {
  return this.leaks;
}

module.exports = LeaksPageModel;
},{"./leak":"/Users/Nikolay/dev/table/client/app/js/models/leak.js"}],"/Users/Nikolay/dev/table/client/app/js/models/leaks.js":[function(require,module,exports){
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
},{"./leaks-page":"/Users/Nikolay/dev/table/client/app/js/models/leaks-page.js"}],"/Users/Nikolay/dev/table/client/app/js/models/settings.js":[function(require,module,exports){
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

},{}],"/Users/Nikolay/dev/table/client/app/js/storage.js":[function(require,module,exports){
'use strict'

function Storage () {
  this.defaultStorage = "localStorage";
  if (window[this.defaultStorage]) {
    this.storage = window[this.defaultStorage];
  } else {
    this.storage = {};
  }
}

Storage.prototype.get = function (key) {
  var value;

  if (this.storage[key]) {
    try {
      value = JSON.parse(this.storage[key]);
    } catch (err) {
      value = this.storage[key];
    }
  }
  return value;
}

Storage.prototype.set = function (key, value) {
  var val = value;
  if (_.isObject(value)) {
    val = JSON.stringify(value);
  }
  return this.storage[key] = val;
}

module.exports = Storage;

},{}],"/Users/Nikolay/dev/table/client/app/js/views/app.js":[function(require,module,exports){
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
},{"./leaks-header":"/Users/Nikolay/dev/table/client/app/js/views/leaks-header.js","./leaks-page":"/Users/Nikolay/dev/table/client/app/js/views/leaks-page.js","./settings-columns-sort":"/Users/Nikolay/dev/table/client/app/js/views/settings-columns-sort.js"}],"/Users/Nikolay/dev/table/client/app/js/views/leak-item.js":[function(require,module,exports){
'use strict'

function LeakItemView (leakModel) {
  this.template = _.template($("#leak-item-view").html());
  this.model = leakModel;
  this.cellEl = "<span>";
  this.formatters = {
    "credit": this.creditFormatter,
    "actual": this.actualFormatter
  }
}

LeakItemView.prototype.render = function () {
  var self = this
    , modelData = self.model.getData()
    , leakHtml = []
    ;

  App.leaksModel.getColumnsOrder().forEach(function (itemName) {
    var cellEl = $(self.cellEl)
      , formatter = self.formatters[itemName]
      , formatted
      ;

    if (formatter) {
      formatted = formatter.call(self, modelData[itemName], cellEl)
    } else {
      formatted = {
        data: modelData[itemName],
        el: cellEl
      }
    }

    formatted.el.append(formatted.data);
    formatted.el.addClass(itemName);
    leakHtml.push($("<div>").append(formatted.el).html());
  });
  return this.template({ leak: leakHtml.join("") });
}

LeakItemView.prototype.creditFormatter = function (data, el) {
  var parsedData;

  parsedData = parseFloat(data) || 0;
  if (parsedData) {
    parsedData = parsedData.toFixed(2);
  }

  if (parsedData < 0) {
    el.addClass("negative-credit");
  }

  if (parsedData > 0) {
    el.addClass("positive-credit");
  }

  return {
    data: parsedData,
    el: el
  }
}

LeakItemView.prototype.actualFormatter = function (data, el) {
  var formatted;

  if (data) {
    formatted = "yes";
  } else {
    formatted = "no";
  }

  return {
    data: formatted,
    el: el
  }
}

module.exports = LeakItemView;
},{}],"/Users/Nikolay/dev/table/client/app/js/views/leaks-header-item.js":[function(require,module,exports){
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
},{}],"/Users/Nikolay/dev/table/client/app/js/views/leaks-header.js":[function(require,module,exports){
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
},{"./leaks-header-item":"/Users/Nikolay/dev/table/client/app/js/views/leaks-header-item.js"}],"/Users/Nikolay/dev/table/client/app/js/views/leaks-page.js":[function(require,module,exports){
'use strict'

var LeakItemView = require("./leak-item");

function LeaksPageView (pageModel) {
  this.template = _.template($("#leaks-view").html());
  this.model = pageModel;
}

LeaksPageView.prototype.render = function () {
  var self = this
    , html = []
    , pageEl
    , leaks = self.model.getLeaks()
    ;

  leaks.forEach(function (leakModel) {
    var leakView = new LeakItemView(leakModel);
    html.push(leakView.render());
  });
  pageEl = $(self.template({
    leakItems: html.join(""),
    pageNum: self.model.pageNum
  }));
  return pageEl;
}

module.exports = LeaksPageView;

},{"./leak-item":"/Users/Nikolay/dev/table/client/app/js/views/leak-item.js"}],"/Users/Nikolay/dev/table/client/app/js/views/settings-columns-sort.js":[function(require,module,exports){
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

},{}],"/Users/Nikolay/dev/table/client/app/main.js":[function(require,module,exports){
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
},{"./js/models/leaks":"/Users/Nikolay/dev/table/client/app/js/models/leaks.js","./js/models/settings":"/Users/Nikolay/dev/table/client/app/js/models/settings.js","./js/storage":"/Users/Nikolay/dev/table/client/app/js/storage.js","./js/views/app":"/Users/Nikolay/dev/table/client/app/js/views/app.js"}]},{},["/Users/Nikolay/dev/table/client/app/main.js"]);
