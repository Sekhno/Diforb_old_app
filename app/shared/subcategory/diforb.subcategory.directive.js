(function(){
	var app = angular.module('diforbApp');

	app.directive('diforbSubcategory', function()
	{
		var directive = {
			restrict: 'E',
			templateUrl: 'app/shared/subcategory/diforb.view.subcategory.html',
			controllerAs: 'dSub',
			controller: ['$scope', '$window', 'soundService', function($scope, $window, soundService)
			{

				this.clickSubCategory = _clickSubCategory;
				function _clickSubCategory ( $event, subCategory )
				{

					var cur = angular.element($event.currentTarget),
						side = cur.parents('div.category').hasClass('left'),
 						parent = cur.parents('li.sub-category'),
  						ul = parent.find('ul.ul-sound'),
  						active = ul.hasClass('active'),
  						spans = cur.parent().parent().parent().find('div.span-sub-category');

  					if ( side ) {
						if ( !$scope.resetCategory[0].hasClass('active') ) return
  					} else {
  						if ( !$scope.resetCategory[1].hasClass('active') ) return
  					}

					ul.slideToggle( 'fast' );

					angular.element( 'ul.ul-sound' ).removeClass( 'fadeOut' );

					if ( !active ) ul.addClass( 'fadeOut' );

					ul.toggleClass( 'active' );

					if ( cur ) {

						spans.removeClass('current');
						cur.addClass('current');

					}

					soundService.currentSound.categoryId = subCategory.id;
				};
			}]
		}

		return directive;

	});

	app.directive( 'customScroll', function()
	{
		var directive = {
			restrict: 'A',
			link: link
		}

		return directive;

		function link( scope, element, attrs ) {

			var height = element.parents('div.dropdown').height();
			var ua = navigator.userAgent;

			element.mCustomScrollbar({
				autoHideScrollbar: true,
				keyboard: { enable: false }
			});

			element.css({ 'max-height': height });

			if ( ua.search(/Firefox/) > -1)  element.css( 'top', '0' );

		}
	});

	app.directive( 'hoverSubcategory', function()
	{
		var directive = {
			restrict: 'A',
			controller: [ '$scope', '$timeout', function($scope, $timeout)
			{
				$timeout( function() {

					angular.forEach( $scope.subnames, function(value, key)
					{

						var e = angular.element(value[0]);

						if (e.width() > 90) e.parent().parent().find('i').text('...');

					});
				},500);

			}],
			link: link
		}

		return directive;

		function link( scope, element, attrs ) {

			scope.subnames.push(element);

			element.on( 'mouseover', function( event ) {
				var cur = this,
					i = cur.parentElement.parentElement.querySelector('i'),
					cur = angular.element(cur),
					i = angular.element(i);

				if ( cur.width() > 90 ){

					cur.css({ 'margin-left': -(cur.width() - 90) + 'px' });
					i.css({'opacity': '0'});

				}

				cur.on( 'mouseout', function(event){

					cur.css({ 'margin-left': '0px' });
					i.css({ 'opacity': '1' });

				});
			});
		}
	});

})();