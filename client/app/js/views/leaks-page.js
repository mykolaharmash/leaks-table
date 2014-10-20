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
