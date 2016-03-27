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
            url: '/blog/detail/:blogId',
            templateUrl: '/blogApp/blog/partial-blog-details.html',
            controller: 'blogDetailController',
            controllerAs: 'blogDetailCtrl'
        })
        .state('post', {
            url: '/blog/post',
            templateUrl: '/blogApp/blog/partial-blog-post.html',
            controller: 'blogPostController',
            controllerAs: 'blogPostCtrl'
        })
        .state('update', {
            url: '/blog/update/:blogId',
            templateUrl: '/blogApp/blog/partial-blog-post.html',
            controller: 'blogUpdateController',
            controllerAs: 'blogUpdateCtrl'
        })
    ;
});
app.controller('blogController', function ($http, $state, $scope, $rootScope) {
    var self = this;
    
    $http.get('/api/posts?sort=pubDate,desc').success(function (data) {

        self.posts = data._embedded.posts;

        self.posts.forEach(function (post) {
            post.id = post._links.self.href.slice(32);
        })
    });

    $scope.deletePost = function(post){
        $http.delete('/api/posts/'+post.id).success(function () {
            _.remove(self.posts,post);
        })
    };
    $scope.changePost = function(post){
        $state.go('update',{blogId:post.id});
    }
});
app.controller('blogDetailController', function ($http, $stateParams) {
    var self = this;
    $http.get('/api/posts/' + $stateParams.blogId).success(function (data) {
        self.post = data;

        self.post.id = self.post._links.self.href;

        self.post.content = marked(data.content);
    })
});
app.controller('blogPostController', function ($http, $scope, Post, $state) {
    $scope.post = new Post();

    $scope.post.title = 'title';
    $scope.post.content = '';
    $scope.post.author = 'pc';

    $scope.$watch('post.content', function(current, original) {
        $scope.outputText = marked(current);
    });

    $scope.toggle = false;

    $scope.addPost = function(){
        $scope.post.pubDate = Date.now();
        $scope.post.$save(function() {
                $state.go('blog');
            }
        );
    }
});
app.controller('blogUpdateController', function ($http, $scope, Post, $state, $log, $stateParams) {
    $scope.post = new Post();

    $scope.post.title = '';
    $scope.post.content = '';
    $scope.post.author = 'pc';

    $scope.$watch('post.content', function(current) {
        $scope.outputText = marked(current);
    });

    $http.get('/api/posts/' + $stateParams.blogId).success(function (data) {
        $scope.post.title = data.title;
        $scope.post.content = data.content;
        $scope.post.pubDate = data.pubDate;
    });

    $scope.toggle = false;

    $scope.addPost = function(){
        $http.put('http://localhost:8080/api/posts/'+$stateParams.blogId,$scope.post).success(function(){
            $state.go('blog');
        })
    }
});