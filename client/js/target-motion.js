/**
 * Created by validity on 10/25/13.
 */
var rgb = {r: 204, g: 102, b: 0};
var ct = 5;
var lt = 25;

var TargetMotion = function(video) {

  var width = video.width;
  var height = video.height;

  var src = createCanvas(width, height);
  var mask = createCanvas(width, height);

  // --- Public Functions ------------------------------------------------------

  function go() {
    setTimeout(function() {
      update();
      go();
    }, 1000 / 10);
  }

  function getMask() {
    return mask;
  }

  // --- Private Functions -----------------------------------------------------

  function createCanvas(width, height) {
    var c = {};
    c.canvas = document.createElement('canvas');
    c.ctx = c.canvas.getContext('2d');
    c.canvas.width = width;
    c.canvas.height = height;
    return c;
  }

  function update() {
    src.ctx.drawImage(video, 0, 0, width, height);

    src.data = src.ctx.getImageData(0, 0, width, height);
    if (!src.prev) src.prev = src.ctx.getImageData(0, 0, width, height);

    mask.data = src.ctx.createImageData(width, height);
//    diff(src, mask);
    target(src, mask, rgb);
    mask.ctx.putImageData(mask.data, 0, 0);

    src.prev = src.data;
  }

  function diff(src, mask) {
    for (var i = 0; i < (src.data.data.length / 4); ++i) {
      mask.data.data[4 * i] = abs(src.data.data[4 * i] - src.prev.data[4 * 1]);
      mask.data.data[4 * i + 1] = abs(src.data.data[4 * i + 1] - src.prev.data[4 * 1 + 1]);
      mask.data.data[4 * i + 2] = abs(src.data.data[4 * i + 2] - src.prev.data[4 * 1 + 2]);
      mask.data.data[4 * i + 3] = 0xFF;
    }
  }

  function target(src, mask, rgb) {
    var tHSL = rgbToHsl(rgb.r, rgb.g, rgb.b);

    for (var i = 0; i < (src.data.data.length / 4); ++i) {
      var sHSL = rgbToHsl(
        src.data.data[4 * i],
        src.data.data[4 * i + 1],
        src.data.data[4 * i + 2]);

//      if (matchColor(sHSL, tHSL, 10, 50)) {
      if (matchColor(sHSL, tHSL, ct, lt)) {
        mask.data.data[4 * i] = src.data.data[4 * i];
        mask.data.data[4 * i + 1] = src.data.data[4 * i + 1];
        mask.data.data[4 * i + 2] = src.data.data[4 * i + 2];
        mask.data.data[4 * i + 3] = 0xFF;
      }
      else {
        mask.data.data[4 * i] = 204 + src.data.data[4 * i] / 5;
        mask.data.data[4 * i + 1] = 204 + src.data.data[4 * i + 1] / 5;
        mask.data.data[4 * i + 2] = 204 + src.data.data[4 * i + 2] / 5;
        mask.data.data[4 * i + 3] = 0xFF;
      }
    }
  }

  function matchColor(source, target, ct, lt) {
    if ((abs(100 * (source[0] - target[0])) <= ct) &&
      (abs(100 * (source[2] - target[2])) <= lt)) {
      return true;
    }
  }

  function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if (max == min) {
      h = s = 0; // achromatic
    } else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return [h, s, l];
  }

  // --- Utility Functions -----------------------------------------------------

  function abs(num) {
    var b = num >> 31;
    return (num ^ b) - b;
  }

  // --- Return ----------------------------------------------------------------

  return {
    go: go,
    getMask: getMask
  }
}