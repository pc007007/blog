/**
 * Created by pc on 3/26/16.
 */
angular.module('blogApp.auth',[])
    .config(function ($stateProvider) {
        $stateProvider
            .state('auth', {
                url: '/auth',
                templateUrl: '/blogApp/auth/partial-auth.html',
                controller: 'authController',
                controllerAs: 'authCtrl'
            })  
})
    .controller('authController',function($rootScope, $http, $state){
        var self = this;

        var authenticate = function(credentials, callback) {

            var headers = credentials ? {authorization : "Basic "
            + btoa(credentials.username + ":" + credentials.password)
            } : {};

            $http.get('/admin', {headers : headers}).success(function(data) {
                if (data.name) {
                    $rootScope.authenticated = true;
                } else {
                    $rootScope.authenticated = false;
                }
                callback && callback();
            }).error(function() {
                $rootScope.authenticated = false;
                callback && callback();
            });

        };

        authenticate();
        self.credentials = {};
        self.login = function() {
            authenticate(self.credentials, function() {
                if ($rootScope.authenticated) {
                    $state.go('blog');
                    self.error = false;
                } else {
                    $state.go('auth');
                    self.error = true;
                }
            });
        };
        
    });
 
