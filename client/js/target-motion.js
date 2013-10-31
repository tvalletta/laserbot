/**
 * Created by validity on 10/25/13.
 */

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
//    findColor(src, mask, )
    mask.ctx.putImageData(mask.data, 0, 0);

    src.prev = src.data;
  }

  function diff(src, mask) {
    console.time('diff');
    for (var i = 0; i < (src.data.data.length / 4); i+=3) {
      mask.data.data[4 * i] = abs(src.data.data[4 * i] - src.prev.data[4 * 1]);
      mask.data.data[4 * i + 1] = abs(src.data.data[4 * i + 1] - src.prev.data[4 * 1 + 1]);
      mask.data.data[4 * i + 2] = abs(src.data.data[4 * i + 2] - src.prev.data[4 * 1 + 2]);
      mask.data.data[4 * i + 3] = 0xFF;
    }
    console.timeEnd('diff');
  }

  function findColor(src, mask, rgba, threshold) {
    console.time('color');
    for (var i = 0; i < (src.data.data.length / 4); ++i) {
      if (abs(rgba.r - src.data.data[4 * 1]) < threshold &&
          abs(rgba.g - src.data.data[4 * 1 + 1]) < threshold &&
          abs(rgba.b - src.data.data[4 * 1 + 2]) < threshold) {
        mask.data.data[4 * i] = src.data.data[4 * 1];
        mask.data.data[4 * i + 1] = src.data.data[4 * 1 + 1];
        mask.data.data[4 * i + 2] = src.data.data[4 * 1 + 2];
        mask.data.data[4 * i + 3] = src.data.data[4 * 1 + 3];
      }
    }
    console.timeEnd('color');
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