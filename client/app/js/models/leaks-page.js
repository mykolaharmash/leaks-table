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