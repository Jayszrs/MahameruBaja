# Popup poster sizing and ten-second rotation

User screenshot showed the poster and its zoom label reduced to a tiny square in the upper-left of an otherwise normal dialog.

Cause: `.poster-welcome button` assigned `width:44px; height:44px`. When the poster became a zoom button, that selector (specificity 0,1,1) overrode `.poster-welcome-image` (0,1,0), including its full width and responsive height. Image files were not removed.

Fix: removed dimensions from the shared button rule. The close control keeps its explicit 44×44px dimensions; artwork keeps its own full-width desktop/mobile sizing and contain-fit image. Navigation and pause controls keep their dedicated sizes.

Changed welcome-poster rotation from 2,000ms to 10,000ms and updated both pause/resume labels. Hero slides and other carousels are unchanged. Hidden-tab/reduced-motion behavior, manual pause, zoom, provider/contact data and priority ordering remain in place.

Regression checks assert that the shared button rule cannot constrain artwork width/height, that desktop and mobile artwork dimensions remain present, and that autoplay advances at exactly ten seconds rather than two. Browser inventory remains empty; CSS/component checks and production compilation are not a substitute for a rendered visual review. No deployment performed by the agent.
