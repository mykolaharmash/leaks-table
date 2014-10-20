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