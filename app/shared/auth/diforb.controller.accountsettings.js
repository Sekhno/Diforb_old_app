(function(){
	var appCtrl = angular.module('diforb.controllers');

	appCtrl.controller('accountSettingsCtrl', accountSettingsCtrl);
	accountSettingsCtrl.$inject = ['$scope', 'accountSettingsService', 'errorService' ];

	appCtrl.controller('changePasswordCtrl', changePasswordCtrl);
	changePasswordCtrl.$inject = ['$scope', 'AuthService', 'errorService'];


	function accountSettingsCtrl($scope, accountSettingsService, errorService)
	{
		var saveButton = {
			saveText:   "Save settings",
			savingText: "Saving..."
		}
		$scope.updateSettings = updateSettings;
		$scope.errorMessage   = "";
		$scope.saveBtnText    = saveButton.saveText;
		$scope.errorService   = errorService;
		$scope.aSettings      = {};
		
		getSettings();

		function getSettings(){
			$scope.aSettings = accountSettingsService.get();
		};

		function updateSettings(e) {
			e.preventDefault();
			if(!$scope.formSettings.$valid) return;

			$scope.saveBtnText = saveButton.savingText;

			$scope.aSettings.$update(function(){
				$scope.saveBtnText = saveButton.saveText;
			}, function(err){
				$scope.saveBtnText = saveButton.saveText;
				if(err) {
					if(err.error_description) {
						$scope.errorMessage = err.error_description;
					} else {
						$scope.errorMessage = getErrorString(err);
					}
				}
			})
		};

	}

	function changePasswordCtrl($scope, AuthService, errorService)
	{

		var saveButton = {
			saveText: "Save password",
			savingText: "Saving..."
		}
		$scope.saveBtnText = saveButton.saveText;
		$scope.newPassword = {
			oldPassword: "",
			newPassword: "",
			confirmPassword: ""
		};
		$scope.changePassword = changePassword;
		$scope.errorMessage  = "";
		$scope.errorService  = errorService;

		function changePassword(e) {
			e.preventDefault();
			$scope.saveBtnText = saveButton.savingText;
			if (!$scope.newPasswordForm.$valid) return;

			AuthService.changePassword($scope.newPassword).then( function(result) {
				$scope.saveBtnText = saveButton.saveText;
	    		}, function(err) {
	    			$scope.saveBtnText = saveButton.saveText;
				$scope.errorMessage = getErrorString(err);
			});
		}
	}

	function getErrorString(err)
	{
	   	var modelState = null;
	   	if(err.modelState)
	   	{
	   		modelState = err.modelState;
	   	} else {
	   		if(err.data && err.data.modelState)
	   		{
	   			modelState = err.data.modelState;
	   		}
	   	}

		var errorString = "";
		if(modelState) {
			for (var key in modelState) {
				if (modelState.hasOwnProperty(key)) {
					errorString = (errorString == "" ? "" : errorString + "  ") + modelState[key];
				}
			}
		} else {
			if(err.error_description) {
				errorString = err.error_description;
			} else {
				errorString = err.message;
			}
		}

		return errorString;
	}


})();