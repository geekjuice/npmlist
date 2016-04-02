"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clean = clean;
function clean(arr) {
  for (var i = 0; i < arr.length; ++i) {
    if (!arr[i]) {
      arr.splice(i, 1);
      --i;
    }
  }
  return arr;
}

exports.default = {
  clean: clean
};