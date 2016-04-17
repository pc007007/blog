/**
 * Created by pc on 3/19/16.
 */
var blogApp = angular.module('blogApp', [
    'ui.router',
    'ngSanitize',
    'ngDisqus',
    'ui.ace',
    'ui.bootstrap',
    'ngResource',
    'lodash',
    'blogApp.home',
    'blogApp.blog',
    'blogApp.project',
    'blogApp.auth'
]);

blogApp.config(function ($stateProvider, $urlRouterProvider, $locationProvider, $disqusProvider, $httpProvider) {

    $urlRouterProvider.otherwise('/');
    //delete #
    /*$locationProvider.html5Mode({ enabled: true, requireBase: false });*/
    /*$locationProvider.html5Mode(true);*/
    $disqusProvider.setShortname('chengpblog');
    $locationProvider.hashPrefix('!');
    $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
});
marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false, // if false -> allow plain old HTML ;)
    smartLists: true,
    smartypants: false,
    highlight: function (code, lang) {
        if (lang) {
            return hljs.highlight(lang, code).value;
        } else {
            return hljs.highlightAuto(code).value;
        }
    }
});

angular.module('lodash', [])
    // allow DI for use in controllers, unit tests
    .constant('_', window._)
    // use in views, ng-repeat="x in _.range(3)"
    .run(function ($rootScope) {
        $rootScope._ = window._;
    });

blogApp.controller('blogAppController',function($rootScope, $http){

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
});