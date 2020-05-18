(function() {
	'use strict';

	var appLogin = angular.module( "diforb.login.controllers" );

	appLogin.controller('diforbLoginStartCtrl', diforbLoginStartCtrl);

	diforbLoginStartCtrl.$inject = ['$scope', '$http', '$q', '$location', '$window', '$document', 'localStorageService', 'DiforbConstans', 'AuthService', '$timeout', '$state'];

	function diforbLoginStartCtrl($scope, $http, $q, $location, $window, $document, localStorageService, DiforbConstans, AuthService, $timeout, $state) {

		$scope.loginData = {
			userName: "test",
			password: "",
			useRefreshTokens: false
		};

		$scope.message = "";

		$scope.registerData = {
			userName: AuthService.externalAuthData.userName,
			provider: AuthService.externalAuthData.provider,
			externalAccessToken: AuthService.externalAuthData.externalAccessToken
		};

		$scope.login = function () {
			AuthService.login($scope.loginData).then(function (response)
			{
				$location.path('/orders');

			}, function (err) {
				$scope.message = err.error_description;
			});
		};

		$scope.authExternalProvider = function (provider) {

			var redirectUri = location.protocol + '//' + location.host + '/authcomplete.html';

			var externalProviderUrl = DiforbConstans.baseApiUrl + "/api/Account/ExternalLogin?provider=" + provider + "&response_type=token&client_id=" + DiforbConstans.clientId + "&redirect_uri=" + redirectUri;

			window.$windowScope = $scope;

			var oauthWindow = window.open(externalProviderUrl, "Authenticate Account", "location=0,status=0,width=600,height=750");
		};

		$scope.authCompletedCB = function (fragment) {

			$scope.$apply(function () {

				if (fragment.haslocalaccount == 'False') {

					AuthService.logOut();

					AuthService.externalAuthData = {
						provider: fragment.provider,
						userName: fragment.external_user_name,
						email: fragment.email,
						externalAccessToken: fragment.external_access_token
					};

					var registerData = {
						userName: fragment.external_user_name,
						email: fragment.email,
						provider:  fragment.provider,
						externalAccessToken: fragment.external_access_token
					};

					AuthService.registerExternal(registerData).then(function (response) {
						$state.go("login.associate");
					}, function (response) {
						var errors = [];
						$scope.spinnerShow = false;
						for (var key in response.modelState) {
							errors.push(response.modelState[key]);
						}
						$scope.message = "Failed to register user due to: " + errors.join(' ');
					});
				} else {
					var externalData = {
						provider: fragment.provider,
						externalAccessToken: fragment.external_access_token
					};
					AuthService.obtainAccessToken(externalData).then( function (response) {
						$window.location.href = "/#/home/libraries";
					}, function (err) {
						$scope.message = err.error_description;
					});
				}

			});
		}

		var w = $document.find('#video'),
			f = $document.find('#focus'),
			s = $document.find('section.landing'),
			c = $document.find('span.icon-close-video'),
			v = w.children(),
			o = angular.element(window);


		focusValue();
		function focusValue() {
			f.css({
				'top': -(o.width()-o.height())/2 + 'px',
				'height': o.width() + 'px'
			})
		}

		window.addEventListener('resize', function() {
			focusValue()
		});
		$scope.watchVideo = function () {
			s.addClass('play-now');
			$timeout(function() {
				w.addClass('play-video');
				v[0].play();
			}, 500);
			v[0].addEventListener('timeupdate', function(){
				if (v[0].currentTime === v[0].duration) {
					stopVideo()
				}
			});
			c.on('click', function() {
				stopVideo()
			})
			function stopVideo() {
				w.removeClass('play-video');
				s.removeClass('play-now');
				v[0].pause();
			}
		}
	};

})();

