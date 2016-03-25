/**
 * Created by pc on 3/24/16.
 */
var app = angular.module("blogApp.blog", []);
app.config(function ($stateProvider) {
    $stateProvider
        .state('blog', {
            url: '/blog',
            templateUrl: '/blogApp/blog/partial-blog.html',
            controller: 'blogController',
            controllerAs: 'blogCtrl'
        })
        .state('detail', {
            url: '/blog/:blogId',
            templateUrl: '/blogApp/blog/partial-blog-details.html',
            controller: 'blogDetailController',
            controllerAs: 'blogDetailCtrl'
        })
        .state('post', {
            url: '/blogpost',
            templateUrl: '/blogApp/blog/partial-blog-post.html',
            controller: 'blogPostController',
            controllerAs: 'blogPostCtrl'
        })
    ;
});
app.controller('blogController', function ($http, $state, $scope) {
    var self = this;
    
    $http.get('/api/posts?sort=pubDate,desc').success(function (data) {

        self.posts = data._embedded.posts;

        self.posts.forEach(function (post) {
            post.id = post._links.self.href.slice(32);
        })
    });

    $scope.deletePost = function(post){
            post.$delete(function() {
                $state.go('blog');
            })
    }
});
app.controller('blogDetailController', function ($http, $stateParams, $scope) {
    var self = this;
    $http.get('/api/posts/' + $stateParams.blogId).success(function (data) {
        self.post = data;

        self.post.id = self.post._links.self.href;

        self.post.content = marked(data.content);
    })
});
app.controller('blogPostController', function ($http, $scope, Post, $state) {
    var markdown = this;  // alias for 'this', so we can access it in $scope.$watch

    $scope.post = new Post();
    $scope.post.title = 'title';
    $scope.post.content = '';
    $scope.post.author = 'pc';

    $scope.$watch('post.content', function(current, original) {
        markdown.outputText = marked(current);
    });
    
    $scope.toggle = false;

    $scope.addPost = function(){
        $scope.post.pubDate = Date.now();
        $scope.post.$save(function(){
            $state.go('blog')
        })
    }
});