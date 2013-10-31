/**
 * Created by validity on 10/25/13.
 */
var MotionDetector = function(video) {

  //  Instance variables
  this.video = video;
  this.lastImageData;
  this.updateTimeout;
  this.movementThreshold;
  this.canvasSource = document.createElement("canvas");
  this.canvasBlended = document.createElement("canvas");
  this.contextSource = this.canvasSource.getContext('2d');
  this.contextBlended = this.canvasBlended.getContext('2d');
  this.areas = [];

  this.canvasSource.width = this.canvasBlended.width = video.width;
  this.canvasSource.height = this.canvasBlended.height = video.height;
};

MotionDetector.prototype = function() {
  function update() {
    drawVideo.call(this);
    blend.call(this);
    checkAreas.call(this);

    this.updateTimeout = setTimeout(function(_this) {
      update.call(_this);
    }, 1000 / 60, this); //60 times per second
  }

  function drawVideo() {
    var video = this.video;
    var ctxSource = this.contextSource;

    // use video element to draw image on canvas
    ctxSource.drawImage(video, 0, 0, video.width, video.height);
  }

  function blend() {
    var width = this.canvasSource.width;
    var height = this.canvasSource.height;
    var contextSource = this.contextSource;
    var lastImageData = this.lastImageData;

    var sourceData = contextSource.getImageData(0, 0, width, height);

    if (!lastImageData) {  // First time
      lastImageData = contextSource.getImageData(0, 0, width, height);
    }

    var blendedData = contextSource.createImageData(width, height);

    differenceAccuracy(blendedData.data, sourceData.data, lastImageData.data);
//        difference(blendedData.data, sourceData.data, lastImageData.data);

    this.contextBlended.putImageData(blendedData, 0, 0);

    this.lastImageData = sourceData;
  }


  /**
   * This is a more performant absolute value calculation than found in Math.abs();
   *
   * @param value - number to perform absolute value calculation on
   * @return {*}
   */
  function fastAbs(value) {
    return (value ^ (value >> 31)) - (value >> 31);
  }

  /**
   *
   * @param target - array containing result of the subtraction
   * @param data1 - array of pixels containing current webcam image
   * @param data2 - array of pixels containing previous webcam image
   * @return {*}
   */
  function difference(target, data1, data2) {

    // These should be the same
    if (data1.length != data2.length) {
      return null;  // Uh oh, there aren't
    }

    // Loop over the array of pixels, incrementing by 4 for all channels(red, green blue, alpha)
    var i = 0;
    while (i < (data1.length / 4)) {
      // Subtract the pixel values to calculate the blended image data
      // For performance, do not perform subtraction if if the color channel is already 0
      target[4 * i] = data1[4 * i] == 0 ? 0 : fastAbs(data1[4 * i] - data2[4 * i]);           // Red Channel
      target[4 * i + 1] = data1[4 * i + 1] == 0 ? 0 : fastAbs(data1[4 * i + 1] - data2[4 * i + 1]);   // Green Channel
      target[4 * i + 2] = data1[4 * i + 2] == 0 ? 0 : fastAbs(data1[4 * i + 2] - data2[4 * i + 2]);   // Blue Channel
      target[4 * i + 3] = 0xFF;  // Set alpha to 255
      ++i;
    }
  }

  /**
   *
   * @param target - array containing result of the subtraction
   * @param data1 - array of pixels containing current webcam image
   * @param data2 - array of pixels containing previous webcam image
   * @return {*}
   */
  function differenceAccuracy(target, data1, data2) {

    // These should be the same
    if (data1.length != data2.length) {
      return null;
    }

    var i = 0;

    // Loop over the array of pixels, incrementing by 4 for all channels(red, green blue, alpha)
    while (i < (data1.length / 4)) {
      // Average the three color channels for each image data
      var avg1 = (data1[4 * i] + data1[4 * i + 1] + data1[4 * i + 2]) / 3;
      var avg2 = (data2[4 * i] + data2[4 * i + 1] + data2[4 * i + 2]) / 3;

      // Calculate the difference, using the threshold function to return either a black or white pixel
      var diff = threshold(fastAbs(avg1 - avg2));

      target[4 * i] = diff;
      target[4 * i + 1] = diff;
      target[4 * i + 2] = diff;
      target[4 * i + 3] = 0xFF;   // Set alpha to 255
      ++i;
    }
  }

  /**
   * Changes the pixel color value to black or white depending on the threshold limit.
   *
   * @param value - pixel color value
   * @return {Number} either white or black color value
   */
  function threshold(value) {
    return (value > 0x15) ? 0xFF : 0;
  }

  function checkAreas() {
    for (var i = 0; i < this.areas.length; i++) {
      var area = this.areas[i];
      checkArea.call(this, area);
    }
  }

  function checkArea(area) {
    var blendedData = this.contextBlended.getImageData(area.dimension.x, area.dimension.y, area.dimension.w, area.dimension.h);

    var i = 0;
    var average = 0;
    // loop over the pixels
    while (i < (blendedData.data.length / 4)) {
      // make an average between the color channel
      average += (blendedData.data[i * 4] + blendedData.data[i * 4 + 1] + blendedData.data[i * 4 + 2]) / 3;
      ++i;
    }
    // calculate an average between of the color values of the note area
    average = Math.round(average / (blendedData.data.length / 4));
    if (average > area.threshold) {
//            obj.emitEvent('moved', [average]);
      if (area.callback) {
        area.callback(area, average);
      }
    }
  }

  /*
   * Allows for an area to be set to watch for motion.  An optional threshold
   * value can be set that omits detected motion below the threshold.
   */
  function detect(callback, threshold, area) {

    if (!this.updateTimeout) {
      update.call(this);
    }

    this.areas.push({
      dimension: area || {x: 0, y: 0, w: this.video.width, h: this.video.height},
      threshold: threshold || 2,
      callback: callback || function() {
      }
    });
  }

  function getBlendedCanvas() {
    return this.canvasBlended;
  }

  return {
    detect: detect,
    getBlendedCanvas: getBlendedCanvas
  }
}();