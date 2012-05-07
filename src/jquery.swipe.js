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
            minSwipeLength      : 20, // the shortest distance, in % of the page width, that user must swipe to move the page
            snapPosition        : 85  // number of % left/right that the page will be moved on a successful swipe. If set to 100%, the page will disappear completely.
        },

        touchesCount            : 0, // number of fingers that are touching
        startTouchXPosition     : 0, // initial start location  x
        startTouchYPosition     : 0, // initial start location  x
        deltaX                  : 0, // horizontal movement
        elementPosition         : undefined,
        currentXTouchPosition   : 0,
        currentYTouchPosition   : 0,
        swipeLength             : 0,
        previousPosition        : {},
        isScrolling             : undefined,

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

            // Windows 8 touch support
            if (window.navigator.msPointerEnabled) {
                $touch.on({
                    "MSPointerDown": function (event) {
                        self.touchStart(event.originalEvent);
                    },
                    "MSPointerMove": function (event) {
                        self.touchMove(event.originalEvent);

                    },
                    "MSPointerOut": function (event) {
                        self.touchCancel(event.originalEvent);
                       
                    },
                    "MSPointerUp": function (event) {
                        self.touchEnd(event.originalEvent, function (swipe) {
                            self._trigger("swiped", event, { swipeDirection: swipe });
                        });
                    }
                });
            }
        },

        touchStart: function (event) {
            var self = this;

            // get the total number of fingers touching the screen
            self.touchesCount = event.touches.length;

            // since we're looking for a swipe (single finger) and not a gesture (multiple fingers),
            // check that only one finger was used
            if (self.touchesCount == 1) {
                
                // reset some pr swipe variables
                self.isScrolling = undefined;
                self.deltaX      = 0;
            
                // get the elements current position
                if (typeof self.elementPosition == 'undefined') {
                    self.elementPosition = self.element.position().left;
                }

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
            
            // One finger is swiping
            if (event.touches.length == 1) {
                self.currentXTouchPosition = event.touches[0].pageX;
                self.currentYTouchPosition = event.touches[0].pageY;

                self.deltaX = self.currentXTouchPosition - self.startTouchXPosition;
                var deltaY  = self.currentYTouchPosition - self.startTouchYPosition;

                if (typeof self.isScrolling == 'undefined') {
                    self.isScrolling = !!(self.isScrolling || Math.abs(self.deltaX) < Math.abs(deltaY));
                }
                
                // move the element 
                if (!this.isScrolling) {
                    event.preventDefault();

                    self.element.css('left', self.elementPosition + self.deltaX); // let the element follow the finger
                }
            } else {
                self.touchCancel(event);
            }
        },

        touchEnd: function (event, callback) {
            var self = this;
            
            // Check that we aren't scrolling and that we have X-axis movement done with one finger
            if (!this.isScrolling && self.deltaX !== 0 && self.touchesCount == 1 && self.currentXTouchPosition !== 0) {
                
                // should we perform a swipe or snap back to old position?
                var elementWidth        = self.element.width();
                var requiredSwipeLength = elementWidth * (self.options.minSwipeLength/100);
                var distance            = Math.round(elementWidth * self.options.snapPosition/100);
                var endPosition         = 0;

                if (Math.abs(self.deltaX) > requiredSwipeLength) {
                    // Snap page into new position
                    if (self.deltaX < 0 && self.elementPosition >= 0) {
                        endPosition = self.elementPosition - distance;
                    } else if (self.deltaX > 0 && self.elementPosition <= 0) {
                        endPosition = self.elementPosition + distance;
                    } else {
                        endPosition = self.elementPosition;
                    }
                } else {
                    // Swipe too short, snap back into old position
                    endPosition = self.elementPosition;
                }

                // Animate the snap
                self.element.animate({left: endPosition}, 350, 'easeOutQuint', function(){
                    self.elementPosition = self.element.position().left;
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