(function() {
	'use strict';
	var appLogin = angular.module( 'diforb.login.services' );

	var appLoginService = appLogin.factory('AuthService', AuthService);

	appLoginService.$inject = ['$http', '$q', 'localStorageService', 'DiforbConstans'];

	function AuthService($http, $q, localStorageService, DiforbConstans) {

		this.serviceBase = DiforbConstans.baseApiUrl + "/";
		var _authentication = {
			isAuth: false,
			userName: "",
			useRefreshTokens: false
		};

		var _externalAuthData = {
			provider: "",
			userName: "",
			externalAccessToken: ""
		};

		this.saveRegistration = _saveRegistration;
		this.login = _login;
		this.resendlink = _resendlink;
		this.logOut = _logOut;
		this.register = _register;

		this.fillAuthData = _fillAuthData;
		this.authentication = _authentication;
		this.refreshToken = _refreshToken;

		this.obtainAccessToken = _obtainAccessToken;
		this.externalAuthData = _externalAuthData;
		this.registerExternal = _registerExternal;
		this.resetpassword = _resetPassword;
		this.newpassword = _newPassword;

		return this;


		function _saveRegistration(registration) {

			_logOut();

			return $http.post(this.serviceBase + 'api/account/register', registration).then(function (response) {
				return response;
			});
		};

		function _login(loginData) {
			var data = "grant_type=password&username=" + loginData.userName + "&password=" + loginData.password;

			if (loginData.useRefreshTokens) {
				data = data + "&client_id=" + DiforbConstans.clientId;
			}

			var deferred = $q.defer();

			$http.post(this.serviceBase + 'token', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).success(function (response) {

				if (loginData.useRefreshTokens) {
					localStorageService.set('authorizationData', { token: response.access_token, userName: loginData.userName, refreshToken: response.refresh_token, useRefreshTokens: true });
				}
				else {
					localStorageService.set('authorizationData', { token: response.access_token, userName: loginData.userName, refreshToken: "", useRefreshTokens: false });
				}
				_authentication.isAuth = true;
				_authentication.userName = loginData.userName;
				_authentication.useRefreshTokens = loginData.useRefreshTokens;

				deferred.resolve(response);

			}).error(function (err, status) {
				_logOut();
				deferred.reject(err);
			});

			return deferred.promise;

		};

		function _resendlink(loginData) {
			var data = { username: loginData.email };

			var deferred = $q.defer();

			$http.post(this.serviceBase + 'api/account/resendlink', data, { headers: { "Content-Type": "application/json" } }).success(function (response) {
				deferred.resolve(response);
			}).error(function (err, status) {
				deferred.reject(err);
			});

			return deferred.promise;
		};


		function _resetPassword(loginData) {
			//var data = { username: loginData.email };

			var deferred = $q.defer();

			$http.post(this.serviceBase + 'api/account/resetpassword', loginData, { headers: { "Content-Type": "application/json" } }).success(function (response) {

				deferred.resolve(response);
			}).error(function (err, status) {

				deferred.reject(err);
			});

			return deferred.promise;
		};


		function _newPassword(loginData) {

			var deferred = $q.defer();

			$http.post(this.serviceBase + 'api/account/newpassword', loginData, { headers: { "Content-Type": "application/json" } }).success(function (response) {

				deferred.resolve(response);
			}).error(function (err, status) {

				deferred.reject(err);
			});

			return deferred.promise;
		};


		function _register(registerData) {
			var deferred = $q.defer();
			$http.post(this.serviceBase + 'api/account/register', registerData, { headers: {"Content-Type": "application/json"}})
				.success(function (response) {
					deferred.resolve(response);
				})
				.error(function (err, status) {
					deferred.reject(err);
				});

			return deferred.promise;
		};

		function _logOut() {

			localStorageService.remove('authorizationData');

			_authentication.isAuth = false;
			_authentication.userName = "";
			_authentication.useRefreshTokens = false;

		};

		function _fillAuthData() {

			var authData = localStorageService.get('authorizationData');
			if (authData) {
				_authentication.isAuth = true;
				_authentication.userName = authData.userName;
				_authentication.useRefreshTokens = authData.useRefreshTokens;
			}

		};

		function _refreshToken() {
			var deferred = $q.defer();

			var authData = localStorageService.get('authorizationData');

			if (authData) {

				if (authData.useRefreshTokens) {

					var data = "grant_type=refresh_token&refresh_token=" + authData.refreshToken + "&client_id=" + DiforbConstans.clientId;

					localStorageService.remove('authorizationData');

					$http.post(this.serviceBase + 'token', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).success(function (response) {

						localStorageService.set('authorizationData', { token: response.access_token, userName: response.userName, refreshToken: response.refresh_token, useRefreshTokens: true });

						deferred.resolve(response);

					}).error(function (err, status) {
						_logOut();
						deferred.reject(err);
					});
				}
			}

			return deferred.promise;
		};

		function _obtainAccessToken(externalData) {

			var deferred = $q.defer();

			$http.get(this.serviceBase + 'api/account/ObtainLocalAccessToken', { params: { provider: externalData.provider, externalAccessToken: externalData.externalAccessToken } }).success(function (response) {

				localStorageService.set('authorizationData', { token: response.access_token, userName: response.userName, refreshToken: "", useRefreshTokens: false });

				_authentication.isAuth = true;
				_authentication.userName = response.userName;
				_authentication.useRefreshTokens = false;

				deferred.resolve(response);

			}).error(function (err, status) {
				_logOut();
				deferred.reject(err);
			});

			return deferred.promise;

		};

		function _registerExternal(registerExternalData) {

			var deferred = $q.defer();

			$http.post(this.serviceBase + 'api/account/registerexternal', registerExternalData, { headers: {"Content-Type": "application/json"}}).success(function (response) {

				localStorageService.set('authorizationData', { token: response.access_token, userName: response.userName, refreshToken: "", useRefreshTokens: false });

				_authentication.isAuth = true;
				_authentication.userName = response.userName;
				_authentication.useRefreshTokens = false;

				deferred.resolve(response);

			}).error(function (err, status) {
				_logOut();
				deferred.reject(err);
			});

			return deferred.promise;

		};
	};

})();