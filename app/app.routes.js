(function() {
	var app = angular.module('diforbApp').config(diforbConfig);

	app.run(['localStorageService', 'AuthService', '$rootScope', '$templateCache', '$state', '$timeout', 'preloaderService', diforbStart]);

	function diforbConfig ($stateProvider, $httpProvider, $urlRouterProvider, $locationProvider)
	{
		//Reset headers to avoid OPTIONS request (aka preflight)
		// $httpProvider.defaults.headers.common = {};
		// $httpProvider.defaults.headers.post = {};
		// $httpProvider.defaults.headers.put = {};
		// $httpProvider.defaults.headers.patch = {};

		$httpProvider.interceptors.push('authInterceptorService');

		$stateProvider
		//ABOUT
		// .state('about', {
		// 	url: '/main',
		// 	views: {
		// 		'@': {
		// 			templateUrl: 'app/components/about/diforb.view.about.html',
		// 			controller: 'aboutController',
		// 			controllerAs: 'about'
		// 		}
		// 	}
		// })
		// .state('about.main', {
		// 	url: '^/about',
		// 	views: {
		// 		'content': {
		// 			templateUrl: 'app/components/about/about.html'
		// 		}
		// 	}
		// })
		// LOGIN
		.state('login', {
			url: '/login',
			views: {
				'@': {
					templateUrl: 'app/components/login/diforb.view.login.html',
					controller: 'diforbLoginCtrl'
				}
			}
		})
		.state('login.start', {
			url: '^/login/start',
			views: {
				'content': {
					templateUrl: 'app/components/login/views/diforb.login.start.html',
					controller: 'diforbLoginStartCtrl'
				}
			}
		})
		.state('login.signin', {
			url: '^/login/signin',
			views: {
				'content': {
					templateUrl: 'app/components/login/views/diforb.login.signin.html',
					controller: 'diforbLoginSignInCtrl'
				}
			}
		})
		.state('login.signup', {
			url: '^/login/signup',
			views: {
				'content': {
					templateUrl: 'app/components/login/views/diforb.login.signup.html',
					controller: 'diforbLoginSignUpCtrl'
				}
			}
		})
		.state('login.confirmed', {
			url: '^/login/confirmed',
			views: {
				'content': {
					templateUrl: 'app/components/login/views/diforb.login.confirmed.html'
				}
			}
		})
		.state('login.associate', {
			url: '^/login/associate',
			views: {
				'content': {
					templateUrl: 'app/components/login/views/diforb.login.associate.html',
					controller: 'diforbAssociateController'
				}
			}
		})
		.state('login.resendlink', {
			url: '^/login/resendlink/:email',
			views: {
				'content': {
					templateUrl: 'app/components/login/views/diforb.login.resendlink.html',
					controller: 'diforbLoginResendCtrl'
				}
			}
		})
		.state('login.resetpassword', {
			url: '^/login/resetpassword',
			views: {
				'content': {
					templateUrl: 'app/components/login/views/diforb.login.reset.html',
					controller: 'diforbResetPasswordCtrl'
				}
			}
		})
		.state('login.newpassword', {
			url: '^/login/newpassword/:id/{code:.*}',
			views: {
				'content': {
					templateUrl: 'app/components/login/views/diforb.login.newpassword.html',
					controller: 'diforbNewPasswordCtrl'
				}
			}
		})
		// HOME
		.state('home', {
			url: '/home',
			views: {
				'@' : {
					templateUrl: 'app/components/home/diforb.view.home.html'
				}
			}
		})
		.state('home.libraries', {
			url: '^/home/libraries',
			views: {
				'header': {
					template: '\
					<h1 ng-class="{\'isLibrary\': library}">\
						<i class="icon-libs"></i>Libraries\
						<span class="dashboard--header--name-lib" ng-if="library">\
							<span ng-class="{\'isLibrary\': library}">/</span>{{library.name}}\
						</span>\
					</h1>'
				},
				'figures': {
					templateUrl: 'app/components/home/diforb.view.libraries.figures.html'
				}
			}
		})
		.state('home.libraries.libname', {
			url: '^/home/libraries/:libname',
			views: {
				'section@home': {
					templateUrl: 'app/components/home/diforb.view.libraries.section.html'
				}
			}
		})
		.state('home.account',  {
			url: '^/home/account',
			views: {
				'header': {
					template: '<h1><i class="icon-cog"></i>Account setings</h1>'
				},
				'figures': {
					templateUrl: 'app/components/home/diforb.view.account.figures.html',
					controller : 'accountSettingsCtrl'
				}
			}
		})
		.state('home.account.change',  {
			url: '^/home/account/change',
			views: {
				'figures@home': {
					templateUrl: 'app/components/home/diforb.view.account.change.figures.html',
					controller : 'changePasswordCtrl'
				}
			}
		})
		.state('home.how', {
			url: '/home/how',
			views: {
				'header': {
					template: '<h1><i class="icon-info"></i>How it works</h1>'
				},
			}
		})
		.state('home.how.video', {
			url: '^/home/tutorial',
			views: {
				'header@home': {
					template: '<h1><i class="icon-play"></i>Watch Tutorial</h1>'
				},
				'figures@home': {
					templateUrl: 'app/components/home/diforb.view.how.watch.figures.html',
					controller: ['$timeout', function($timeout) {
						var v = document.querySelector('video'),
							w;
						$timeout( function() {
							w = document.querySelector('.wrapper--dashboard')
						}, 100);

						v.addEventListener('playing', function() {
							angular.element(w).addClass('video-playing')
						});
						v.addEventListener('pause', function() {
							angular.element(w).removeClass('video-playing')
						})
					}]
				}
			}
		})
		.state('home.how.faq', {
			url: '^/home/how/faq',
			views: {
				'header@home': {
					template: '<h1><i class="icon-info"></i>F.A.Q.</h1>'
				},
				'figures@home': {
					templateUrl: 'app/components/home/diforb.view.how.faq.figures.html'
				}
			}
		})
		.state('home.license', {
			url: '^/home/license',
			views: {
				'header': {
					template: '<h1>License agreement</h1>'
				},
				'figures': {
					templateUrl: 'app/components/home/diforb.view.license.figures.html'
				}
			}
		})
		.state('home.privacy', {
			url: '^/home/privacy',
			views: {
				'header': {
					template: '<h1>Privacy policy</h1>'
				},
				'figures': {
					templateUrl: 'app/components/home/diforb.view.privacy.figures.html'
				}
			}
		})
		.state('home.support', {
			url: '^/home/support',
			views: {
				'header': {
					template: '<h1>Support</h1>'
				},
				'figures': {
					templateUrl: 'app/components/home/diforb.view.support.figures.html',
					controller: 'supportController'
				}
			}
		})
		.state('home.get', {
			url: '^/home/get',
			views: {
				'header': {
					template: '<h1>Get in touch</h1>'
				},
				'figures': {
					templateUrl: 'app/components/home/diforb.view.getintouch.figures.html',
					controller: 'getintouchController'
				}
			}
		})
		// LIBRARIES
		.state('app', {
			url: '/library/:libname',
			views: {
				'@': {
					templateUrl: 'app/shared/library/diforb.view.library.html',
					controller: 'diforbLibraryCtrl'
				}
			}
		});

		$urlRouterProvider.otherwise( '/home/libraries' );

		$locationProvider.html5Mode(true);

		if (window.history && window.history.pushState){
			$locationProvider.html5Mode({
				enabled: false,
				requireBase: false
			});
		}
	}

	function diforbStart(localStorageService, AuthService, $rootScope, $templateCache, $state, $timeout, preloaderService)
	{

		$rootScope.$on('$viewContentLoaded', function()
		{
			$templateCache.removeAll();

		});

		$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams)
		{
			if (fromState.hasOwnProperty('templateUrl'))
				preloaderService.off(2000);

			$rootScope.currentStateName = toState.name;

		});

		AuthService.fillAuthData();
	}

})();