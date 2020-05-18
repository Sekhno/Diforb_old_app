(function () {
	angular.module( 'diforb.controllers' )

	.controller( 'aboutController', _aboutController );

	_aboutController.$inject   = [ '$scope', '$document', 'preloaderService', '$anchorScroll', 'AuthService' ];

	function _aboutController($scope, $document, preloaderService, $anchorScroll, AuthService )
	{
		var body = $document.find('body');

		this.isBurgerActive = false;
		this.isAuthentificated = AuthService.isAuthenticated();
		this.burgerMenu = _burgerMenu;
		this.menuTransition = _menuTransition;

		_initCtrl();

		function _burgerMenu()
		{

			if ( !about.isBurgerActive ) {

				this.isBurgerActive = true

			} else {

				this.isBurgerActive = false

			}
		}

		function _menuTransition()
		{

			this.isBurgerActive = false
		}

		function _initCtrl()
		{

			$anchorScroll( 0 );
			body.addClass( 'loaded' );
			preloaderService.off( 1000 );
			_setUserName();
		}

		function _setUserName()
		{

			var promise = AuthService.getUserName();

			promise.then( setUser, setUser );

			function setUser( name )
			{
				this.userName = name;
			}
		}
	}
})();