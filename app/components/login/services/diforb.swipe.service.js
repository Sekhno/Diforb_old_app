(function() {
	'use strict';
	var services = angular.module( 'diforb.login.services' );

	services.service( 'swipe', swipe );
	function swipe()
	{
		this.that = function() {
			/*
			*   Swipe function Vanila JS
			*/
			/*
			var form      = angular.element(document).find('footer'),
			btn        = angular.element(document).find('button');

			document.addEventListener('touchstart', handleTouchStart, false);
			document.addEventListener('touchmove', handleTouchMove, false);

			var xDown = null;
			var yDown = null;

			function handleTouchStart(evt) {
			xDown = evt.touches[0].clientX;
			yDown = evt.touches[0].clientY;
			};

			function handleTouchMove(evt) {
			if ( ! xDown || ! yDown ) {
						return;
			}

			var xUp = evt.touches[0].clientX;
			var yUp = evt.touches[0].clientY;

			var xDiff = xDown - xUp;
			var yDiff = yDown - yUp;

			if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {//most significant
				if ( xDiff > 0 ) {
					//left swipe
				} else {
					//right swipe
				}
			} else {
				if ( yDiff > 0 ) {
						 //up swipe
						 angular.element(form).css({
										'-webkit-transform': 'translate(-50%, 0)',
										'transform': 'translate(-50%, 0)',
										'bottom': '10px'
						 });
							angular.element(btn).css({
										'z-index': '8'
							});
				} else {
					//down swipe
					angular.element(form).css({
						'-webkit-transform': 'translate(-50%, 100%)',
						'transform': 'translate(-50%, 100%)',
						'bottom': '70px'
					});
					angular.element(btn).css({
						'z-index': '10'
					});
				}
			}
			//reset values
			xDown = null;
			yDown = null;
			};
			*/
		}
	}

})();