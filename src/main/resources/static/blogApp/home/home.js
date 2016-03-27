/**
 * Created by pc on 3/24/16.
 */
angular.module("blogApp.home",[])
.config(function($stateProvider){
    $stateProvider
        .state('home', {
            url: '/',
            views: {
                'title': {
                    templateUrl: '/blogApp/home/partial-home-title.html'
                },
                'content': {
                    templateUrl: '/blogApp/home/partial-home-content.html',
                    controller: 'indexController',
                    controllerAs: 'indexCtrl'
                }
            }
        })
})
.controller('indexController', function ($state, $http, $rootScope) {
    var self = this;

    self.state = $state;

    $http.get('/api/posts?size=5&sort=pubDate,desc').success(function (data) {

        self.posts = data._embedded.posts;

        self.posts.forEach(function (post) {
            post.id = post._links.self.href.slice(32);
        })

    })

    self.logout = function() {
        $http.post('/logout', {}).finally(function() {
            $rootScope.authenticated = false;
            $state.go('auth');
        });
    }
});
