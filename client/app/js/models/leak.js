'use strict'

function LeakModel (opts) {
  this.data = opts.data || {};
}

LeakModel.prototype.getData = function () {
  return this.data;
}

module.exports = LeakModel;
