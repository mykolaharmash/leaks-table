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
