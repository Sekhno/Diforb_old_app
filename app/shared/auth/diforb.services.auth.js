(function () {
	angular.module('diforb.services')
		.factory('AuthService', AuthService);

	angular.module('diforb.services')
		.factory('authInterceptorService', AuthInterceptorService);

	angular.module('diforb.services')
		.factory('accountSettingsService', AccountSettingsService);

	AuthService.$inject = ['$http', '$q', 'localStorageService', '$state', 'DiforbConstans', 'accountSettingsService'];
	AuthInterceptorService.$inject = ['$q', '$location', '$window', 'localStorageService'];
	AccountSettingsService.$inject = ['$resource', 'DiforbConstans'];

	function AuthService($http, $q, localStorageService, $state, DiforbConstans, accountSettingsService) {
		var _authentication = {
			isAuth: false,
			userName : "",
			token: ""
		};

		var _externalAuthData = {
			provider: "",
			userName: "",
			externalAccessToken: ""
		};

		this.serviceBase = DiforbConstans.baseApiUrl + "/";
		this.saveRegistration = _saveRegistration;
		this.login = _login;
		this.logOut = _logOut;
		this.fillAuthData = _fillAuthData;
		this.authentication = _authentication;
		this.isAuthenticated = _isAuthenticated;
		this.changePassword = _changePassword;
		this.resendlink = _resendlink;
		this.resetpassword = _resetPassword;
		this.newpassword = _newPassword;
		this.obtainAccessToken = _obtainAccessToken;
		this.register = _register;
		this.registerExternal = _registerExternal;
		this.externalAuthData = _externalAuthData;
		this.getUserName = _getUserName;

		this.inst = this;

		this.fillAuthData();

		function _isAuthenticated(registration) {

			return _authentication && _authentication.isAuth;
		}

		function _saveRegistration(registration) {

			_logOut();

			return $http.post(this.serviceBase + 'api/account/register', registration).then(function (response) {
				return response;
			});
		};

		function _changePassword(newPassword) {
			var deferred = $q.defer();

			function sucsessResult(response) {
				return deferred.resolve(response);
			}

			function errorResult(err, status) {
				return deferred.reject(err);
			}

				$http.post(this.serviceBase + 'api/account/changepassword', newPassword).success(sucsessResult).error(errorResult);

			return deferred.promise;
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

		function _newPassword(loginData) {

			var deferred = $q.defer();

			$http.post(this.serviceBase + 'api/account/newpassword', loginData, { headers: { "Content-Type": "application/json" } }).success(function (response) {

				deferred.resolve(response);
			}).error(function (err, status) {

				deferred.reject(err);
			});

			return deferred.promise;
		};

		function registerExternal(registerExternalData) {
			var deferred = $q.defer();
			var inst = this;

			$http.post(serviceBase + 'api/account/registerexternal', registerExternalData).success(function (response) {

				localStorageService.set('authorizationData', { token: response.access_token,
																 userName: response.userName,
																 refreshToken: "",
																 useRefreshTokens: false });
				inst.fillAuthData();

				deferred.resolve(response);

			}).error(function (err, status) {
				_logOut();
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
			if (authData)
			{
				_authentication.isAuth = true;
				_authentication.userName = authData.userName;
				_authentication.token = authData.token;
			}
		}

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
			var inst = this;

			$http.get(this.serviceBase + 'api/account/ObtainLocalAccessToken', { params: { provider: externalData.provider, externalAccessToken: externalData.externalAccessToken } }).success(function (response) {

				localStorageService.set('authorizationData', { token: response.access_token, userName: response.userName, refreshToken: "", useRefreshTokens: false });

				_authentication.isAuth = true;
				_authentication.userName = response.userName;
				_authentication.useRefreshTokens = false;

				inst.fillAuthData();

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

		function _getUserName()
		{
			var userName = "Mr. Nobody";
			return $q(function(resolve, reject) {
					accountSettingsService.get().$promise.then (
						function(result)
						{
							resolve(result.firstName || _authentication.userName);
						},
						function(result) {
							reject(userName) ;
						}
					);
				  });
		}

		return this;
	}


	function AuthInterceptorService($q, $location, $window, localStorageService)
	{
		var authInterceptorServiceFactory = {};

		var _request = function (config) {

			config.headers = config.headers || {};

			var authData = localStorageService.get('authorizationData');
			if (authData) {
				config.headers.Authorization = 'Bearer ' + authData.token;
			}
			return config;
		}

		var _responseError = function (rejection) {
			// if (rejection.status === 401) {
			// 	window.location = "/login";
			// }
			return $q.reject(rejection);
		}

		authInterceptorServiceFactory.request = _request;
		authInterceptorServiceFactory.responseError = _responseError;

		return authInterceptorServiceFactory;
	}


	function AccountSettingsService($resource, DiforbConstans)
	{
		var url = DiforbConstans.baseApiUrl + '/api/accountsettings/:id';
		return $resource(url, null, {
			update: {
				method: 'PUT'
			}
		});
	}

})();