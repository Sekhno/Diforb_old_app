(function () {
    'use strict';
    var appLogin = angular.module("diforb.login.services");

    appLogin.constant('loginAppSettings', new loginAppSettings());

    function loginAppSettings() {
        // Master

        this.apiServiceBaseUri = 'http://diforbapi.azurewebsites.net/';
        // Prod
        //this.apiServiceBaseUri = 'http://diforbapiprod.azurewebsites.net/';
        // Dev
        //this.apiServiceBaseUri = 'http://diforbapidev.azurewebsites.net/';
        // Localhost
        //this.apiServiceBaseUri = 'http://localhost:50881/';

        this.clientId = 'diforbApp';
        return this;
    };

})();