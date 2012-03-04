# Swipeable jQuery plugin

An attempt at an implementation the mobile navigation pattern that can be seen in for instance the Path app for iPhone. 

## Background

On smaller devices, screen real estate is hard to come by. Navigation often gets in the way of content. With Swipeable, I'm trying to move the navigation out of the way, while still letting it be easily accessible. I'm doing this by implementing the navigation pattern that is progressively enhanced:

1) Navigation should be placed at the bottom of the page, and a button with an anchor link in the top of the page should take you to this menu.
2) If javascript support is detected, the navigation layer should be placed on a lower z-index, and put to the left of the main content, while the "extra" layer (contact info for instance), should be put to the right and on an even lower z-index. This will allow you to click the "MENU" button to slide the main content right to reveal the main menu, and click the button "CONTACT" to slide the content and menu to the left to reveal the contact info layer.
3) If the device supports touch, then touch support is added so that revealing the menu or the contact info can be done by swiping right and left.


## Demo

Open up **pageswipe.htm** on your localhost, and try swiping left and right, or clicking the buttons at the top. The page currently works best when viewed on a small screen, like an iPhone.