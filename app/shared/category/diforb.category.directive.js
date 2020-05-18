(function(){
	var app = angular.module( 'diforbApp' );

	app.directive( 'diforbCategory', function()
	{
		var directive = {
			restrict: 'E',
			templateUrl: 'app/shared/category/diforb.view.category.html',
			controllerAs: 'dCat',
			controller: [ '$scope', '$window', '$document', '$timeout', 'soundService', 'webAudioService', function($scope, $window, $document, $timeout, soundService, webAudioService )
			{

				// var dCat = this;

				this.clickCategory = _clickCategory;
				this.clickResetSound = _clickResetSound;
				this.clickSpanCategory = _clickSpanCategory;

				function _clickCategory( $event, category )
				{
					var cur = angular.element( $event.currentTarget ),
						parents = cur.parents( 'div.category' ),
						categories = parents.find( 'li.category' ),
						square = parents.find( 'div.category-square' );

		            		if ( parents.hasClass( 'left' )) {

		            			if ( !$scope.resetCategory[0].hasClass('active') ) return;

		            			square.css('top', cur.index() * 80 + 'px');

		            		} else {

		            			if ( !$scope.resetCategory[1].hasClass('active') ) return;

		            			square.css('top', cur.index() * 80 + 'px');
		            		}

					if ( cur ) {

					     	categories.removeClass('active');
					     	cur.addClass('active');

					}
				};

				function _clickSpanCategory( $event )
				{

					var elem = angular.element($event.currentTarget),
						cur = elem.parent(),
						parent = cur.parents('div.category'),
						ul = cur.find('ul.ul-sub-category'),
						all_ul = parent.find('ul.ul-sub-category'),
						cur_side = parent.hasClass('left');

					if ( cur_side ) {

						if ( !$scope.resetCategory[0].hasClass('active') ) return;

					} else {

						if ( !$scope.resetCategory[1].hasClass('active') ) return;

					}

	       			all_ul.parent().parent().parent().addClass('transition');

	        			function slideTrans() {

	        				ul.addClass('make_transist').addClass('showleft');

	        			}

	        			function slideTransIn(selector) {

	            				all_ul.removeClass('showleft').addClass('make_transist').addClass(selector);

	            				$timeout( function() { slideTrans() },  350);

	        			}

					if( !cur.hasClass('active') )
						cur_side ?  slideTransIn('hideleft') : slideTransIn('hideRight');
				};

				function _clickResetSound ( $event, side, soundGroup)
				{

					var cur = angular.element($event.currentTarget);

					cur.toggleClass('active');

					var lib = webAudioService.library,
						isMuted = !cur.hasClass('active');

					if ( side.isLeft ) {

						$scope.categories[0].toggleClass('notActive');
						lib.LeftSide.ResetSounds();

					} else {

						$scope.categories[1].toggleClass('notActive');
						lib.RightSide.ResetSounds();

					}

					if ( lib.IsPlaying ) {

						lib.Stop();
						lib.Play();

					}
				};
			}]
		}

		return directive;

	});

	app.directive( 'categoryReset', function()
	{
		var directive = {
			restrict: 'A',
			link: link
		}

		return directive;

		function link( scope, element, attrs ) {

			scope.resetCategory.push(element);

		}
	});

	app.directive( 'categoryImage', function()
	{
		var directive = {
			restrict: 'A',
			link: link
		}

		return directive;

		function link( scope, element, attrs ) {

			scope.imageCategory.push(element);

		}
	});

	app.directive( 'scrollCategory', function( $document, $timeout, $interval )
	{
		var directive = {
			restrict: 'EA',
			link: link
		}

		return directive;

		function link( scope, element, attrs ) {

			scope.categories.push(element);

			var dropdown, height, child, blocksVisible, difference, stop,
				count = 0,
				array = [0,1,2,3,4,5,6,7,8,9,10],
				topY = array.map( function(name) { return name * (-80) + 'px' }),
				up = element.parent().find( 'span.category-up' ),
				down = element.parent().find( 'span.category-down' );

			$timeout( function() {

				dropdown = $document.find( 'div.dropdown' );
				height = dropdown.height();
				child = $document.find( 'ul.ul-category' );
				blocksVisible = Math.round((height - 80)/ 80);

				if ( height > child[0].clientHeight ) return;
				else dropdown.addClass( 'majority' );

			}, 500);

			function scrollCategoryUp( var1, var2 ) {

				if ( count == 0 ) return;

			    	element.parent().removeClass( 'difference' );
			    	count = count -1;
			    	angular.element(var1).css({ 'top': topY[count] });

			    	if ( count == 0 ) angular.element( var2 ).removeClass('scroll');
			}

			function scrollCategoryDown( var1, var2, var3 ) {

				if (count == var3) return;
				else if ( count +1 == var3 ) element.parent().addClass( 'difference' );

			    	angular.element( var2 ).addClass( 'scroll' );
			    	count = count +1;
			    	angular.element( var1 ).css({ 'top': topY[count] });

			}

			up.bind('mouseover', function( event ) {

				var elem = angular.element( event.currentTarget ),
					d = elem.parent(),
					f = d.find( 'ul.ul-category' );

				scrollCategoryUp(f, d);

				stop = $interval( function() {

					scrollCategoryUp(f, d);

				}, 100);

				up.bind( 'mouseout', function( event ) {

					$interval.cancel(stop);

				});
			});

			down.bind( 'mouseover', function( event ) {

				var elem = angular.element( event.currentTarget ),
					d = elem.parent(),
					f = d.find('ul.ul-category'),
					blocks = element[0].clientHeight / 80,
					difference = blocks - blocksVisible;

				scrollCategoryDown( f, d, difference );

				stop = $interval( function() {

					scrollCategoryDown( f, d, difference );

				}, 100);

				angular.element( down ).bind( 'mouseout', function( event ) {

					$interval.cancel( stop );

				});
			});

			element.bind( 'mousewheel', function( event ) {

				var child = element.children(),
					drop = element.parent(),
					content = element.find( 'div.content' ),
					blocks = element[0].clientHeight / 80,
					difference = blocks - blocksVisible;

				if ( height > element[0].clientHeight ) return;

				if ( event.originalEvent.wheelDelta >= 0 ) scrollCategoryUp( child, drop )
				else scrollCategoryDown(child, drop, difference);
			});
		}
	});

	app.directive( 'elementCategory', function()
	{
		var directive = {
			restrict: 'A',
			link: link
		}

		return directive;

		function link( scope, element, attrs ) {

			scope.elem_ctgr.push(element)

		}
	});

	app.directive('hoverCategory', function()
	{
		var directive = {
			restrict: 'A',
			link: link
		}

		return directive;

		function link( scope, element, attrs ) {

			element.on( 'mouseover', function(event) {
				var cur = this,
					span = cur.querySelector('span'),
					cur = angular.element(cur),
					span = angular.element(span);

				if( span.width() > 65 )
					span.css({ 'margin-left': -(span.width() - 65) + 'px' });

				cur.on( 'mouseout', function( event ) {

					span.css({ 'margin-left': '0px' })

				});
			});
		}
	});

})();