/**
 * Created by pc on 3/19/16.
 */
var blogApp = angular.module('blogApp', ['ui.router',
    'ngSanitize',
    'ngDisqus',
    'ui.ace',
    'ngResource',
    'blogApp.home',
    'blogApp.blog',
    'blogApp.project',
    'blogApp.services'
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
