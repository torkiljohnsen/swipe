/**
 * swipeable 1.1
 * https://github.com/torkiljohnsen/swipe
 *
 * Kudos-time:
 * Adapted from https://github.com/sgentile/jquery.swipe
 * Borrowed some ideas from https://github.com/bradbirdsall/Swipe
 * Modelled after http://www.virgentech.com/blog/2009/10/building-object-oriented-jquery-plugin.html
 *
 * Dual licensed under the MIT and GPL licenses
 */

(function($){
    var Swipeable = function(element, options)
    {
        var plugin      = this;
        var page        = $(element);               // The main, touch-enabled layer
        var rightButton = undefined;
        var leftButton  = undefined;
        var secondLayer = undefined;

        var defaults = {
            animationSpeed      : 150,           // speed of the transition
            easing              : 'swing',       // easing function. jQuery only supports 'linear' and 'swing'. Need to use jQuery UI to get others.
            minSwipeLength      : 20,            // the shortest distance, in % of the page width, that user must swipe to move the page
            snapPosition        : 85,            // number of % left/right that the page will be moved on a successful swipe. If set to 100%, the page will disappear completely.
            slideRightSelector  : '#slideRight', // button selector
            slideLeftSelector   : '#slideLeft',  // button selector
            secondLayerSelector : '#nav'         // selector of the second layer, which moves on left swipes
        };

        plugin.config = {};

        var init = function() {
            plugin.config = $.extend(defaults, options || {});
            plugin.state  = {
                touchesCount            : 0,         // number of fingers that are touching
                startTouchXPosition     : 0,         // initial start location  x
                startTouchYPosition     : 0,         // initial start location  x
                deltaX                  : 0,         // horizontal movement
                elementPosition         : undefined, // element position before the swipe
                currentXTouchPosition   : 0,
                currentYTouchPosition   : 0,
                isScrolling             : undefined
            };

            rightButton = $(plugin.config.slideRightSelector);
            leftButton  = $(plugin.config.slideLeftSelector);
            secondLayer = $(plugin.config.secondLayerSelector); 

            attach();
        };

        var attach = function() {

            // attach handlers to events
            page.on({
                "touchstart": function(event) {
                    // http://stackoverflow.com/questions/671498/jquery-live-removing-iphone-touch-event-attributes
                    touchStart(event.originalEvent);
                },
                "touchmove": function(event) {
                    touchMove(event.originalEvent);
                },
                "touchcancel": function(event) {
                    touchCancel(event.originalEvent);
                },
                "touchend": function(event) {
                    touchEnd(event.originalEvent);
                }
            });

            // Windows 8 touch support
            if (window.navigator.msPointerEnabled) {
                page.on({
                    "MSPointerCancel": function(event) {
                        touchCancel(event.originalEvent);
                    },
                    "MSPointerDown": function(event) {
                        touchStart(event.originalEvent);
                    },
                    "MSPointerMove": function(event) {
                        touchMove(event.originalEvent);
                    },
                    "MSPointerOut": function(event) {
                        touchCancel(event.originalEvent);
                    },
                    "MSPointerUp": function(event) {
                        touchEnd(event.originalEvent);
                    }
                });
            }

            // Click events for the buttons
            rightButton.on({
                "click": function(event) {
                    if (rightButton.hasClass('open')) {
                        resetPage();
                    } else {
                        movePageRight();
                    }
                }
            });

            leftButton.on({
                "click": function(event) {
                    if (leftButton.hasClass('open')) {
                        resetPage();
                    } else {
                        movePageLeft();
                    }
                }
            });
        };

        var touchStart = function(event) {

            var state = plugin.state;

            // get the total number of fingers touching the screen
            state.touchesCount = event.touches.length;

            // since we're looking for a swipe (single finger) and not a gesture (multiple fingers),
            // check that only one finger was used
            if (state.touchesCount == 1) {
                
                // reset some pr swipe variables
                state.isScrolling = undefined;
                state.deltaX      = 0;

                // get the elements current position
                if (typeof state.elementPosition == 'undefined') {
                    state.elementPosition = page.position().left;
                }

                // get the coordinates of the touch
                state.startTouchXPosition = event.touches[0].pageX;
                state.startTouchYPosition = event.touches[0].pageY;

            } else {
                // not one finger touching, so cancel
                touchCancel(event);
            }
        };

        var touchMove = function(event) {
            
            var state   = plugin.state;
            var pagePos = 0;

            // One finger is swiping
            if (state.touchesCount == 1) {

                state.currentXTouchPosition = event.touches[0].pageX;
                state.currentYTouchPosition = event.touches[0].pageY;

                state.deltaX = state.currentXTouchPosition - state.startTouchXPosition;
                var deltaY   = state.currentYTouchPosition - state.startTouchYPosition;

                if (typeof state.isScrolling == 'undefined') {
                    state.isScrolling = !!(state.isScrolling || Math.abs(state.deltaX) < Math.abs(deltaY));
                }
                
                // move the element 
                if (!state.isScrolling) {
                    event.preventDefault();

                    pagePos = state.elementPosition + state.deltaX;
                    
                    // Move second layer left with the finger when we go past the Y axis
                    if (pagePos < 0) {
                        secondLayer.css('left', pagePos);
                    }

                    // let the page follow the finger
                    page.css('left', pagePos); 
                    
                }
            } else {
                // not one finger touching, so cancel
                touchCancel(event);
            }
        };

        var touchEnd = function(event) {

            var state = plugin.state;
            
            // Check that we aren't scrolling and that we have X-axis movement with one finger touching
            if (!state.isScrolling && state.deltaX != 0 && state.touchesCount == 1 && state.currentXTouchPosition != 0) {
                
                // should we perform a swipe or snap back to old position?
                var elementWidth        = page.width(); 
                var requiredSwipeLength = elementWidth * (plugin.config.minSwipeLength/100); // swipe length required to move the page

                if (Math.abs(state.deltaX) > requiredSwipeLength) {
                    // Snap page into new position
                    if (state.elementPosition == 0) {
                        if (state.deltaX > 0) {
                            movePageRight();
                        } else {
                            movePageLeft();
                        }
                    } else {
                        resetPage();
                    }
                } else {
                    // Swipe too short, snap back to start position
                    snapToPosition(state.elementPosition);
                }

            } else {
                // we're either scrolling, do not have just one finger touching or have no X-axis movement, so cancel
                touchCancel(event);
            }
        };

        var touchCancel = function(event) {
            plugin.state = $.extend(plugin.state, {
                touchesCount            : 0, // number of fingers that are touching
                startTouchXPosition     : 0, // initial start location  x
                startTouchYPosition     : 0, // initial start location  x
                currentXTouchPosition   : 0,
                currentYTouchPosition   : 0
            });
        };

        // Calculate distance to snap position
        var distance = function() {
            return Math.round(page.width() * plugin.config.snapPosition/100);
        };

        // Swipe right reveals layer 2
        var movePageRight = function() {
            snapToPosition(page, distance());
            rightButton.addClass('open');
        };

        // Swipe left reveals layer 3
        var movePageLeft = function() {
            var dist = -distance();
            snapToPosition(secondLayer, dist);
            snapToPosition(page, dist);
            leftButton.addClass('open');
        };

        // Normalize the layout
        var resetPage = function() {
            snapToPosition(page, 0);

            if (leftButton.hasClass('open')) {
                snapToPosition(secondLayer, 0);
                leftButton.removeClass('open');
            } else {
                rightButton.removeClass('open');
            }
        };

        var snapToPosition = function(layer, endPosition) {
            // Animate the snap
            layer.animate({left:endPosition}, plugin.config.animationSpeed, plugin.config.easing, function() {
                // update the state on complete
                plugin.state.elementPosition = endPosition;
            });
        };

        init();
    };

    $.fn.swipeable = function(options)
    {
        return this.each(function() {
           var element = $(this);
          
           // Return early if this element already has a plugin instance
           if (element.data('swipeable')) return;

           // pass options to plugin constructor
           var swipeable = new Swipeable(this, options);

           // Store plugin object in this element's data
           element.data('swipeable', swipeable);
        });
    };
})(jQuery);