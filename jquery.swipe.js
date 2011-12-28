/**
 * pageSwipe 1.0
 * https://github.com/torkiljohnsen/swipe
 *
 * Adapted from https://github.com/sgentile/jquery.swipe
 * Borrowed some ideas from https://github.com/bradbirdsall/Swipe
 *
 * Dual licensed under the MIT and GPL licenses
 */

(function ($) {
    $.widget("ui.swipe", {
        options: {
            minSwipeLength: 65  // the shortest distance the user may swipe - the lower the number the more sensitive
        },

        touchesCount: 0,        // number of finders
        startTouchXPosition: 0, // initial start location  x
        startTouchYPosition: 0, // initial start location  x
        elementPosition: undefined,
        currentXTouchPosition: 0,
        currentYTouchPosition: 0,
        swipeLength: 0,
        previousPosition: {},
        isScrolling: undefined,

        swiped: function (e, ui) { },

        _create: function () {
            var self = this;
            var $touch = this.element;

            $touch.bind({
                "touchstart": function (event) {
                    // http://stackoverflow.com/questions/671498/jquery-live-removing-iphone-touch-event-attributes
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
                
                // get the elements current position
                if (typeof self.elementPosition == 'undefined') {
                    self.elementPosition = self.element.position().left;
                }

                // get the coordinates of the touch
                self.startTouchXPosition = event.touches[0].pageX;
                self.startTouchYPosition = event.touches[0].pageY;
                self.isScrolling = undefined;

            } else {
                // more than one finger touched so cancel
                self.touchCancel(event);
            }
        },

        touchMove: function (event) {
            var self = this;
            
            // One finger is swiping
            if (event.touches.length == 1) {
                self.currentXTouchPosition = event.touches[0].pageX;
                self.currentYTouchPosition = event.touches[0].pageY;

                var deltaX = self.currentXTouchPosition - self.startTouchXPosition;
                var deltaY = self.currentYTouchPosition - self.startTouchYPosition;

                if (typeof self.isScrolling == 'undefined') {
                    self.isScrolling = !!(self.isScrolling || Math.abs(deltaX) < Math.abs(deltaY));
                }
                
                // move the element 
                if (!this.isScrolling) {
                    event.preventDefault();

                    self.element.css('left', self.elementPosition + deltaX); // let the element follow the finger
                }
            } else {
                self.touchCancel(event);
            }
        },

        touchEnd: function (event, callback) {
            var self = this;
            
            // check to see if more than one finger was used and that there is an ending coordinate
            if (self.touchesCount == 1 && self.currentXTouchPosition != 0) {
                
                // snap the element into position
                var distance = Math.round(self.element.width() * -0.85);
                self.element.animate({left: distance}, 400, 'easeOutQuint', function(){
                    self.elementPosition = self.element.position().left;
                    alert('new position: '+self.elementPosition);
                });              

                self.swipeLength = self.getSwipeLength(self.startTouchXPosition, self.currentXTouchPosition, self.startTouchYPosition, self.currentYTouchPosition);
                // if the user swiped more than the minimum length, perform the appropriate action
                if (self.swipeLength >= self.options.minSwipeLength) {
                    var swipeDirection = self.getSwipeDirection(self.startTouchXPosition, self.currentXTouchPosition, self.startTouchYPosition, self.currentYTouchPosition);
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

        getSwipeDirection: function (startXPos, currentXPos, startYPos, currentYPos) {
            var self = this;
            var swipeAngle = self.getSwipeAngle(startXPos, currentXPos, startYPos, currentYPos);

            if (swipeAngle <= 45 || swipeAngle >= 315) {
                return 'left';
            } else if (swipeAngle >= 135 && swipeAngle <= 225) {
                return 'right';
            } else if (swipeAngle > 45 && swipeAngle < 135) {
                return 'down';
            } else {
                return 'up';
            }
        },

        getSwipeLength: function (startXPos, currentXPos, startYPos, currentYPos) {
            // determine the length of the swipe using distance formula
            return Math.round(Math.sqrt(Math.pow(currentXPos - startXPos, 2) + Math.pow(currentYPos - startYPos, 2)));
        },

        getSwipeAngle: function (startXPos, currentXPos, startYPos, currentYPos) {
            var x = startXPos - currentXPos;
            var y = currentYPos - startYPos;
            var r = Math.atan2(y, x); //angle in radians (Cartesian system)
            var swipeAngle = Math.round(r * 180 / Math.PI); //angle in degrees
            if (swipeAngle < 0) {
				swipeAngle = 360 - Math.abs(swipeAngle); 
			}
            return swipeAngle;
        }
    });
})(jQuery);