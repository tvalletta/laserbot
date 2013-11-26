/**
 * Created by validity on 10/25/13.
 */
//var rgb = {r: 240, g: 180, b: 117}; // Orange Ball
//var rgb = {r: 225, g: 100, b: 30}; // Orange Ball
//var rgb = {r: 27, g: 160, b: 120}; // Green Marker
//var rgb = {r: 27, g: 160, b: 200}; // Blue Shirt
//var rgb = {r: 85, g: 123, b: 95}; // Green shirt on Bus
//var rgb = {r: 255, g: 255, b: 255}; // White
//var rgb = {r: 247, g: 255, b: 40}; // Tennis Ball in the light
var rgb = {r: 48, g: 255, b: 210}; // Tennis Ball in the light

//var hsl = [3, 0, 40];
var diffMult = [1000, 10, 100];

var _cam = {
  xDeg: 46,
  yDeg: 36
}
var _serv = {
  xDeg: 170,
  yDeg: 180
}

var TargetMotion = function(video) {

  var width = video.width;
  var height = video.height;

  var src = createCanvas(width, height);
  var mask = createCanvas(width, height);

  // --- Public Functions ------------------------------------------------------

  function go(socket) {
    setTimeout(function() {
      update(socket);
      go(socket);
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

  function update(socket) {
    /* width
     * height
     * 4  - one value for each: r g b a
     * 25 - one score for each 4 x 4 sector
     * 4  - one array spot for each Uint32 value
     */
    var bufferLength = ((((width * height) * 4) / 25) * 4);
    var buffer = new ArrayBuffer(bufferLength);
    var scores = new Uint32Array(buffer);

    /* width
     * height
     * 4  - one value for each: r g b a
     * 25 - one score for each 4 x 4 sector
     * 4  - one array spot for each Uint32 value
     */
    var bufferLength2 = bufferLength;
    var buffer2 = new ArrayBuffer(bufferLength2);
    var scores2 = new Uint32Array(buffer2);


    src.ctx.drawImage(video, 0, 0, width, height);
    src.data = src.ctx.getImageData(0, 0, width, height);

    mask.data = src.ctx.createImageData(width, height);
//    diff(src, mask);
//    isolate(src, mask, rgb);
//    heatmapOld(src, mask, scores, rgb);
//    heatmap(src, mask, scores, rgb);
    var tgt = target(src, mask, scores, scores2, rgb);
    if (socket) socket.emit('target', tgt);

    mask.ctx.putImageData(mask.data, 0, 0);
  }


  // Output formats ------------------------------------------------------------

  /**
   *
   * @param src
   * @param mask
   */
  function diff(src, mask) {
    for (var i = 0; i < (src.data.data.length / 4); ++i) {
      mask.data.data[4 * i] = abs(src.data.data[4 * i] - src.prev.data[4 * 1]);
      mask.data.data[4 * i + 1] = abs(src.data.data[4 * i + 1] - src.prev.data[4 * 1 + 1]);
      mask.data.data[4 * i + 2] = abs(src.data.data[4 * i + 2] - src.prev.data[4 * 1 + 2]);
      mask.data.data[4 * i + 3] = 0xFF;
    }
  }

  /**
   *
   * @param src
   * @param mask
   * @param rgb
   */
  function isolate(src, mask, rgb) {
    var tHSL = rgbToHsl(rgb.r, rgb.g, rgb.b);
    var ct = 3;
    var lt = 40;

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
        mask.data.data[4 * i] = src.data.data[4 * i] / 5;
        mask.data.data[4 * i + 1] = src.data.data[4 * i + 1] / 5;
        mask.data.data[4 * i + 2] = src.data.data[4 * i + 2] / 5;
        mask.data.data[4 * i + 3] = 0xFF;
      }
    }
  }

  /**
   *
   * @param src
   * @param mask
   * @param scores
   * @param rgb
   */
  function heatmapOld(src, mask, scores, rgb) {
    var tHSL = rgbToHsl(rgb.r, rgb.g, rgb.b);

    for (var i = 0; i < (src.data.data.length / 4); ++i) {
      var row = Math.floor((i / mask.data.width) / 5);
      var col = Math.floor((i % mask.data.width) / 5);
      var sIndex = (row * (mask.data.width / 5)) + col;
      var sHSL = rgbToHsl(
        src.data.data[4 * i],
        src.data.data[4 * i + 1],
        src.data.data[4 * i + 2]);

      scores[sIndex] += colorDistance(sHSL, tHSL, diffMult);
    }

    var high = 0;
    var low = 999;
    for (var i = 0; i < scores.length; ++i) {
      high = Math.max(scores[i], high);
      low = Math.min(scores[i], low);
    }

    for (var i = 0; i < (src.data.data.length / 4); ++i) {
      var row = Math.floor((i / mask.data.width) / 5);
      var col = Math.floor((i % mask.data.width) / 5);
      var sIndex = (row * (mask.data.width / 5)) + col;

      var score = scores[sIndex];
      var color = abs((3 * Math.log(score)) * (255 / (3 * Math.log(high))));

      mask.data.data[4 * i] = 255 - color;
      mask.data.data[4 * i + 1] = 0;
      mask.data.data[4 * i + 2] = color;
      mask.data.data[4 * i + 3] = 0xFF;
    }
  }

  /**
   *
   * @param src
   * @param mask
   * @param scores
   * @param rgb
   */
  function heatmap(src, mask, scores, rgb) {
    var tHSL = rgbToHsl(rgb.r, rgb.g, rgb.b);

    for (var i = 0; i < (src.data.data.length / 4); ++i) {
      var row = Math.floor((i / mask.data.width) / 5);
      var col = Math.floor((i % mask.data.width) / 5);
      var sIndex = (row * (mask.data.width / 5)) + col;
      var sHSL = rgbToHsl(
        src.data.data[4 * i],
        src.data.data[4 * i + 1],
        src.data.data[4 * i + 2]);

      scores[sIndex] += colorDistance(sHSL, tHSL, diffMult);
    }

    var high = 0;
    var low = 999;
    for (var i = 0; i < scores.length; ++i) {
      high = Math.max(scores[i], high);
      low = Math.min(scores[i], low);
    }

    for (var i = 0; i < (src.data.data.length / 4); ++i) {
      var row = Math.floor((i / mask.data.width) / 5);
      var col = Math.floor((i % mask.data.width) / 5);
      var sIndex = (row * (mask.data.width / 5)) + col;

      var score = scores[sIndex];
      var color = abs((3 * Math.log(score)) * (511 / (3 * Math.log(high))));

      mask.data.data[4 * i] = Math.max(0, 255 - color);
      mask.data.data[4 * i + 1] = 256 - abs(color - 256);
      mask.data.data[4 * i + 2] = Math.max(0, color - 256);
      mask.data.data[4 * i + 3] = 0xFF;
    }
  }

  /**
   *
   * @param src
   * @param mask
   * @param scores
   * @param rgb
   */
  function targetOverlay(src, mask, scores, scores2, rgb) {
    var crosshairs = document.getElementsByClassName('crosshairs')[0];

    console.time('target');
    var tHSL = rgbToHsl(rgb.r, rgb.g, rgb.b);

    var focusWidth = mask.data.width / 5;

    for (var i = 0; i < (src.data.data.length / 4); ++i) {
      var row = Math.floor((i / mask.data.width) / 5);
      var col = Math.floor((i % mask.data.width) / 5);
      var sIndex = (row * focusWidth) + col;
      var sHSL = rgbToHsl(
        src.data.data[4 * i],
        src.data.data[4 * i + 1],
        src.data.data[4 * i + 2]);

      scores[sIndex] += colorDistance(sHSL, tHSL, diffMult);
    }

    var high = 0;
    var low = 999;
    for (var i = 0; i < scores.length; ++i) {
      high = Math.max(scores[i], high);
      low = Math.min(scores[i], low);
    }

    for (var i = 0; i < scores2.length; ++i) {
      for (var y = -4; y < 5; ++y) {
        for (var x = -4; x < 5; ++x) {
          var index = i + (y * focusWidth) + x;
          if (scores[index]) {
            scores2[i] = scores2[i] + (high - scores[index]);
          }
        }
      }
    }

    var high2 = 0;
    var low2 = 999;
    for (var i = 0; i < scores2.length; ++i) {
      high2 = Math.max(scores2[i], high2);
      low2 = Math.min(scores2[i], low2);
    }

    for (var i = 0; i < (src.data.data.length / 4); ++i) {
      var row = Math.floor((i / mask.data.width) / 5);
      var col = Math.floor((i % mask.data.width) / 5);
      var sIndex = (row * (mask.data.width / 5)) + col;

      var score = high2 - scores2[sIndex];
      var color = abs((3 * Math.log(score)) * (511 / (3 * Math.log(high2))));

      mask.data.data[4 * i] = Math.max(0, 255 - color);
      mask.data.data[4 * i + 1] = 256 - abs(color - 256);
      mask.data.data[4 * i + 2] = Math.max(0, color - 256);
      mask.data.data[4 * i + 3] = 0xFF;
    }

    for (var i = 0; i < scores2.length; ++i) {
      if (scores2[i] === high2) {
        var coords = getCoordinates(i, mask.data.width);
        crosshairs.style.left = coords.x + 'px';
        crosshairs.style.top = coords.y + 'px';
        return;
      }
    }

    console.timeEnd('target');
  }


  /**
   *
   * @param src
   * @param mask
   * @param scores
   * @param rgb
   */
  function target(src, mask, scores, scores2, rgb) {
    var crosshairs = document.getElementsByClassName('crosshairs')[0];

    var tHSL = rgbToHsl(rgb.r, rgb.g, rgb.b);
    var focusWidth = mask.data.width / 5;

    for (var i = 0; i < (src.data.data.length / 4); ++i) {
      var row = Math.floor((i / mask.data.width) / 5);
      var col = Math.floor((i % mask.data.width) / 5);
      var sIndex = (row * focusWidth) + col;
      var sHSL = rgbToHsl(
        src.data.data[4 * i],
        src.data.data[4 * i + 1],
        src.data.data[4 * i + 2]);

      scores[sIndex] += colorDistance(sHSL, tHSL, diffMult);
    }

    var high = 0;
    var low = 999;
    for (var i = 0; i < scores.length; ++i) {
      high = Math.max(scores[i], high);
      low = Math.min(scores[i], low);
    }

    for (var i = 0; i < scores2.length; ++i) {
      for (var y = -4; y < 5; ++y) {
        for (var x = -4; x < 5; ++x) {
          var index = i + (y * focusWidth) + x;
          if (scores[index]) {
            scores2[i] = scores2[i] + (high - scores[index]);
          }
        }
      }
    }

    var high2 = 0;
    var low2 = 999;
    for (var i = 0; i < scores2.length; ++i) {
      high2 = Math.max(scores2[i], high2);
      low2 = Math.min(scores2[i], low2);
    }

    for (var i = 0; i < scores2.length; ++i) {
      if (scores2[i] === high2) {
        var coords = getCoordinates(i, mask.data.width);
        crosshairs.style.left = coords.x + 'px';
        crosshairs.style.top = coords.y + 'px';
        return getCameraAngle(coords);
      }
    }
  }


  // Utility Functions ---------------------------------------------------------

  function getCoordinates(i, width) {
    i*=5;
    var coords = {
      y: Math.floor((i * 5) / width),
      x: i % width
    }
    return coords;
  }

  function getCameraAngle(coords) {
    var marginX = (_serv.xDeg - _cam.xDeg) / 2;
    var x = (coords.x * (_cam.xDeg / width)) + marginX;
    var marginY = (_serv.yDeg - _cam.yDeg) / 2;
    var y = (coords.y * (_cam.yDeg / height)) + marginY;
    return {x: _serv.xDeg - x, y: y};
  }

  function getCenterZeroAngle(coords) {
    return {
      y: (coords.y - (height / 2)) * (_cam.yAngle / height),
      x: (coords.x - (width / 2)) * (_cam.xAngle / width)
    }
  }

  function matchColor(source, target, ct, lt) {
    if ((abs(100 * (source[0] - target[0])) <= ct) &&
      (abs(100 * (source[2] - target[2])) <= lt)) {
      return true;
    }
  }

  function colorDistance(src, tgt, diffMult) {
    var hue = abs(diffMult[0] * (src[0] - tgt[0]));
    var sat = abs(diffMult[1] * (src[1] - tgt[1]));
    var lit = abs(diffMult[2] * (src[2] - tgt[2]));
    return hue + sat + lit;
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