(function() {
	var app = angular.module( 'diforb.controllers' );

	app.directive( 'diforbController', function()
	{
		var directive = {
			restrict: 'A',
			controllerAs: 'dc',
			controller: [ '$scope','$stateParams', '$document', '$timeout', '$state', 'preloaderService', 'AuthService', 'libraryService', 'faqService', function( $scope, $stateParams, $document, $timeout, $state, preloaderService, AuthService,libraryService, faqService )
			{
				// var dc = this;
				var body = $document.find('body');

				$scope.$on("homeLoadedEvent", function (event, args) {
					//event.stopPropagation(); // останавливаем распространение события
					$scope.isHomeController = args.message;
				})

				$scope.libs;
				$scope.count = 0;

				//START PRELOADER
				preloaderService.on({ speedIn : 0, easingIn : mina.easeinout });

				// LOG OUT USER
				this.logOut = _logOut;

				function _logOut()
				{

					AuthService.logOut();
					window.location.href = "/"
				}

				//LIBRARIES DESCRIPTION
				_getLibraryDescription();
				function _getLibraryDescription()
				{
					libraryService.getLibraryDescription().query().$promise.then( function( value )
					{

						$scope.libs = value;

						if ( $stateParams.libname ) {

							var libname = $stateParams.libname;

							$scope.count = 1;

							angular.forEach($scope.libs, function(value, key)
							{

								if ( angular.lowercase(value.name) === libname ) {

									$scope.library = value;

									body.addClass('loaded');

									preloaderService.off(2000)
								}
							})
						}

						if ( value ) {

							body.addClass('loaded');

							preloaderService.off(2000)
						}
					})
				}

				//F.A.Q. JSON
				_getFAQService();
				function _getFAQService()
				{
					$scope.panes = faqService.query();
					return $scope.panes.$promise
				}

				$scope.expandCallback = function (index, id) {
					console.log('expand:', index, id);
				}

				$scope.collapseCallback = function (index, id) {
					console.log('collapse:', index, id);
				}

				$scope.$on('faq-accordion:onReady', function () {
					console.log('accordion is ready!');
				})

				this.transitionLink = _transitionLink;

				function _transitionLink( $event )
				{
					var cur = $event.target,
						d = angular.element(cur).data('sref');

					preloaderService.on({ speedIn : 1000, easingIn : mina.easeinout });

					$timeout( function() {

						body.removeClass('loaded');

						$state.transitionTo( d, false);
					}, 1000);
				}
			}]
		}

		return directive

	});

	app.directive( 'diforbHome', function()
	{
		var directive = {
			link: link,
			restrict: 'A',
			controllerAs: 'dh',
			controller: [ '$scope', '$window', '$state', '$stateParams', '$document', '$timeout', 'libraryService', 'preloaderService','deviceDetector', '$anchorScroll', 'AuthService', function( $scope, $window, $state, $stateParams, $document, $timeout, libraryService, preloaderService, deviceDetector, $anchorScroll, AuthService )
			{

				$scope.isAuthentificated = AuthService.isAuthenticated();

				$anchorScroll(0);

				var userAgent = $window.navigator.userAgent;

				$scope.$emit( 'homeLoadedEvent', {

					message: true
				});

				$scope.isSafaryBrowser = angular.lowercase( deviceDetector.browser ) == 'safari';

				$scope.desktop = $window.innerWidth > 1024;
				$scope.section;
				$scope.figure;
				$scope.dashboard;
				$scope.library;
				$scope.figures = [];
				$scope.audios  = [];
				$scope.buttonsPlay = [];
				$scope.username = "";

				_setUserName();

				function _setUserName()
				{

					var promise = AuthService.getUserName();

					promise.then(setUser, setUser);

					function setUser( name )
					{

						$scope.username = name;
					}
				}

				function aniamateSection()
				{

					if ($scope.desktop) {

						if ( $scope.count > 0 ) $scope.section.addClass('fade');

						$scope.count++;
					}
				}

				this.currentLib = _currentLib;

				function _currentLib( libname )
				{
					scrollToY( 0, 1500, 'easeInOutQuint' );

					var libname = angular.lowercase( libname );

					if ( $stateParams.libname === libname ) return;

					angular.forEach( $scope.libs, function( value, key )
					{
						if ( angular.lowercase( value.name ) === libname ) {

							aniamateSection();

							if ( $scope.count == 1 ) {

								$scope.library = value;
							} else {

								$timeout( function() {

									$scope.library = value;

									$scope.section.removeClass( 'fade' ).addClass( 'fast' );
								}, 500);
							}

							if ( !$scope.desktop ) {

								$timeout( function() {

									var s = $scope.section.find( 'section' ),
										h = s[0].clientHeight;

									if ( $scope.dashboard.hasClass( 'infoshow' ) ) {

										$scope.figure.css({
											'height': h + 50,
											'overflow': 'hidden'
										})
									}
								}, 1000);
							}

							return $scope.library
						}
					})
				}

				$scope.libraryNull = _libraryNull;

				function _libraryNull()
				{

					$stateParams.libname = undefined;
					$scope.library = undefined;
					$scope.count = 0;

					$scope.section.removeClass( 'fast' );

					if ( !$scope.desktop ) {

						$scope.figure.css({
							'height': 'auto',
							'overflow': 'auto'
						});

						this.closeMenuHome()
					}

					return
				}

				var menu = $document.find( 'div.dashboard--menu' );

				this.openMenuHome = _openMenuHome;

				function _openMenuHome()
				{

					if ( $scope.desktop ) return;

					menu.css({
						'-webkit-transform': 'translateX(0%)',
						'transform': 'translateX(0%)'
					});

					$scope.dashboard.css({
						'-webkit-filter': 'blur(3px)',
						'filter': 'blur(3px)',
						'overflow': 'hidden'
					});
				}

				this.closeMenuHome = _closeMenuHome;
				function _closeMenuHome()
				{

					if ( $scope.desktop ) return;

					menu.css({
						'-webkit-transform': 'translateX(-100%)',
						'transform': 'translateX(-100%)'
					});

					$scope.dashboard.css({
						'-webkit-filter': 'blur(0px)',
					      'filter': 'blur(0px)',
					      'overflow': 'auto'
					});
				}
        		}]
    		};

    		return directive;

		function link( scope, element, attrs ) {

			_resizeWindow();

			function _resizeWindow() {

				var e = angular.element( element ),
       				a = e.find( '.dashboard--menu--links ul' ),
					w = e.find( 'div.dashboard--menu' ),
					o = window.innerHeight,
					h = w.height(),
					p;

				if ( o > h ) {
					p = (o - h) / 2;
					a.css({
						'padding-top': p +'px',
						'padding-bottom': p +'px'
					});
				}
			}

			window.addEventListener( 'resize', function()
			{

				_resizeWindow();
			})
		}
	});

	app.directive( 'wrapperSection', function()
	{

		var directive = {
			restrict: 'A',
			link: link
		}

		return directive;

		function link( scope, element, attrs ) {

			scope.section = element;
			return scope.section
		}
	});

	app.directive( 'wrapperFigures', function()
	{

		var directive = {
			restrict: 'A',
			link: link
		}

		return directive;

		function link( scope, element, attrs) {

			scope.dashboard = element.parent();
			scope.figure = element;
		}
	});

	app.directive( 'figuresElement', function()
	{

		var directive = {
			restrict: 'A',
			link: link
		}

		return directive;

		function link( scope, element, attrs) {

			scope.figures.push(element);

			scope.audios.push(element.find( 'audio' ));

			scope.buttonsPlay.push(element.find( '.dashboard--btn-play' ));

			element.find( '.dashboard--btn-play' ).on( 'click', function( event ) {

				if ( angular.element( event.target ).hasClass( 'disable' ) ) return;

				var i = element.index(),
					c = angular.element( event.target ),
					p = scope.audios[i],
					t = angular.element( event.target ).parent().find( 'div.control' ),
					r = angular.element( event.target ).parent().find( 'div.progress' ),
					s = scope.section.find( '.dashboard--btn-play' ),
					a = scope.section.find( 'audio' );

				if ( s.hasClass('play') ) {

					a[0].pause();
					s.removeClass( 'play' )
				}

				if ( !c.hasClass('play') ) {

					angular.forEach( scope.buttonsPlay, function( value, key )
					{
						if ( value.hasClass( 'play') ) {

							var e = value.parent().find( 'audio' );

							value.removeClass( 'play' );

							e[0].pause()
						}
					});

					p[0].play()
				} else {

					p[0].pause()
				}

				c.toggleClass( 'play' );

				p[0].addEventListener( 'timeupdate', _progressTime );

				function _progressTime()
				{

					var time = p[0].currentTime,
						s = 100 / p[0].duration,
						v = ( s * time ) / 100;

					t.css({
						'-webkit-transform': 'scale('+ v +', 1)',
						'transform': 'scale('+ v +', 1)'
					});

					if ( p[0].currentTime === p[0].duration )
						c.removeClass('play');
				}

				r.on( 'click', _seek );

				function _seek ( e )
				{

					var percent = e.offsetX / this.offsetWidth;

					p[0].currentTime = percent * p[0].duration;

					r.value = percent / 100
				}
			})
		}
	});

	app.directive( 'containerSection', function()
	{

		var directive = {
			restrict: 'A',
			link: link
		}

		return directive;

		function link( scope, element, attrs) {

			var p = element.find( '.dashboard--btn-play' ),
				a = element.find( 'audio' );

			p.on( 'click', function( event ) {

				if ( angular.element( event.target ).hasClass( 'disable' )) return;

				angular.forEach( scope.buttonsPlay, function( value, key )
				{

					if ( value.hasClass( 'play' ) ) {

						var e = value.parent().find( 'audio');

						value.removeClass( 'play' );

						e[0].pause()
					}
				});

				if ( !p.hasClass( 'play' ) ) {

					a[0].play()
				} else {

					a[0].pause()
				}

				p.toggleClass( 'play' );
			});

			a[0].addEventListener( 'timeupdate', _progressTime);

			function _progressTime()
			{

				if ( a[0].currentTime === a[0].duration )

					p.removeClass( 'play' );
			}

		}
	});

})();