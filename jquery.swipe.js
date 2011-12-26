/**
 * pageSwipe 1.0 - jQuery UI Widget
 * https://github.com/torkiljohnsen/swipe
 *
 * Adapted from https://github.com/sgentile/jquery.swipe
 *
 * Copyright (c) 2011 Torkil Johnsen (http://twitter.com/torkiljohnsen)
 * Copyright (c) 2011 Steve Gentile (http://twitter.com/stevemgentile)
 * Dual licensed under the MIT and GPL licenses
 */

(function ($) {
	$.widget("ui.swipe", {
		options: {
			minSwipeLength: 65, // the shortest distance the user may swipe - the lower the number the more sensitive
			preventDefault: false, //used on TouchStart - setting this to true would negate things like button press from working, etc...
		},

		touchesCount: 0, //number of finders
		startTouchXPosition: 0, //initial start location  x
		startTouchYPosition: 0, //initial start location  x
		currentXTouchPosition: 0,
		currentYTouchPosition: 0,
		swipeLength: 0,
		previousPosition: {},

		swiped: function (e, ui) { },

		_create: function () {
			var self = this;
			var $touch = this.element;

			$touch.bind({
				"touchstart": function (event) {
					//http://stackoverflow.com/questions/671498/jquery-live-removing-iphone-touch-event-attributes
					self.touchStart(event.originalEvent);
				},
				"touchmove": function (event) {
					self.touchMove(event.originalEvent);

				},
				"touchcancel": function (event) {
					self.touchCancel(event.originalEvent);
				},
				"touchend": function (event) {
					self.touchEnd(event.originalEvent, function (swipe) {
						self._trigger("swiped", event, { swipeDirection: swipe });
					});
				}
			});
		},

		touchStart: function (event) {
			var self = this;

			// get the total number of fingers touching the screen
			self.touchesCount = event.touches.length;
			// since we're looking for a swipe (single finger) and not a gesture (multiple fingers),
			// check that only one finger was used
			if (self.touchesCount == 1) {
				// get the coordinates of the touch
				self.startTouchXPosition = event.touches[0].pageX;
				self.startTouchYPosition = event.touches[0].pageY;
			} else {
				// more than one finger touched so cancel
				self.touchCancel(event);
			}
		},

		touchMove: function (event) {
			var self = this;
			
			if (event.touches.length == 1) {
				self.currentXTouchPosition = event.touches[0].pageX;
				self.currentYTouchPosition = event.touches[0].pageY;
				var deltaY = self.currentYTouchPosition - self.startTouchYPosition;

				if (Math.abs(deltaY) < 15) {
					// We're not moving vertically, preventing default
					event.preventDefault();
				}
			} else {
				self.touchCancel(event);
			}
		},

		touchEnd: function (event, callback) {
			var self = this;
			
			// check to see if more than one finger was used and that there is an ending coordinate
			if (self.touchesCount == 1 && self.currentXTouchPosition != 0) {
				self.swipeLength = self.calculateSwipeAngle(self.startTouchXPosition, self.currentXTouchPosition, self.startTouchYPosition, self.currentYTouchPosition);
				// if the user swiped more than the minimum length, perform the appropriate action
				if (self.swipeLength >= self.options.minSwipeLength) {
					var swipeAngle = self.getSwipeAngle(self.startTouchXPosition, self.currentXTouchPosition, self.startTouchYPosition, self.currentYTouchPosition);
					var swipeDirection = self.determineSwipeDirection(swipeAngle);
					callback(swipeDirection); // callback with the swipe direction
					self.touchCancel(event); // reset the variables
				} else {
					// swipe was too short
					self.touchCancel(event);
				}
			} else {
				self.touchCancel(event);
			}
		},

		touchCancel: function (event) {
			var self = this;
			// reset the variables back to default values
			self.touchesCount = 0;
			self.startTouchXPosition = 0;
			self.startTouchYPosition = 0;
			self.currentXTouchPosition = 0;
			self.currentYTouchPosition = 0;
			self.swipeLength = 0;
		},

		calculateSwipeAngle: function (startXPos, currentXPos, startYPos, currentYPos) {
			// determine the length of the swipe using distance formula
			return Math.round(Math.sqrt(Math.pow(currentXPos - startXPos, 2) + Math.pow(currentYPos - startYPos, 2)));
		},

		getSwipeAngle: function (startXPos, currentXPos, startYPos, currentYPos) {
			var x = startXPos - currentXPos;
			var y = currentYPos - startYPos;
			var r = Math.atan2(y, x); //angle in radians (Cartesian system)
			var swipeAngle = Math.round(r * 180 / Math.PI); //angle in degrees
			if (swipeAngle < 0) { swipeAngle = 360 - Math.abs(swipeAngle); }
			return swipeAngle;
		},

		determineSwipeDirection: function (swipeAngle) {
			if ((swipeAngle <= 45) && (swipeAngle >= 0)) {
				return 'left';
			} else if ((swipeAngle <= 360) && (swipeAngle >= 315)) {
				return 'left';
			} else if ((swipeAngle >= 135) && (swipeAngle <= 225)) {
				return 'right';
			} else if ((swipeAngle > 45) && (swipeAngle < 135)) {
				return 'down';
			} else {
				return 'up';
			}
		}
	});
})(jQuery);