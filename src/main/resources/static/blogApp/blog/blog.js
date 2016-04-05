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
app.controller('blogController', function ($http, $state, $scope, $log) {
    var self = this;

    $scope.currentPage = 1;
    $scope.pageSize = 7;

    self.setPage = function (currentPage) {
        $http.get('/api/posts?projection=noContent&page=' + (currentPage-1) + '&size=' + $scope.pageSize + '&sort=pubDate,desc').success(function (data) {

            self.posts = data._embedded.posts;
            
            self.totalElements = data.page.totalElements;
        });
    };

    self.setPage(1);

    $scope.$watch('currentPage',function(current){
        self.setPage(current);
    });

    $scope.deletePost = function (post) {
        $http.delete('/api/posts/' + post.id).success(function () {
            _.remove(self.posts, post);
        })
    };
    $scope.changePost = function (post) {
        $state.go('update', {blogId: post.id});
    };
    $scope.maxSize = 7;
});
app.controller('blogDetailController', function ($http, $stateParams) {
    var self = this;
    $http.get('/api/posts/' + $stateParams.blogId).success(function (data) {
        self.post = data;

        self.post.id = self.post._links.self.href;

        self.post.content = marked(data.content);
    })
});
app.controller('blogPostController', function ($http, $scope, Post, $state, $log) {
    $scope.post = new Post();

    $scope.post.title = 'title';
    $scope.post.content = '';
    $scope.post.author = 'pc';
    $scope.tags = [];

    $scope.$watch('post.content', function (current) {
        $scope.outputText = marked(current);
    });

    $scope.toggle = false;

    $scope.addPost = function () {
        $scope.post.pubDate = Date.now();
/*        $http.post("/api/posts",$scope.post).success(function(){
            $state.go('blog');
        });*/
        $http.post("/api/posts",$scope.post).then(function(response){
            $log.log(response);
            $scope.tags.forEach(function(tag){
               tag.post = response.data._links.self.href;
                $log.log(tag);
                $http.post("/api/tags",tag);
            });
            $state.go('blog');
        });
    };

    $scope.addTag = function(tag) {
        var a = {};
        a.name = tag.name;
        a.color = tag.color;
        $scope.tags.push(a);
        $log.log($scope.tags);
    };
    
    $scope.removeTag = function(tag){
        _.remove($scope.tags, tag);
    };
});
app.controller('blogUpdateController', function ($http, $scope, Post, $state, $log, $stateParams) {
    $scope.post = new Post();

    $scope.post.title = '';
    $scope.post.content = '';
    $scope.post.author = 'pc';

    $scope.$watch('post.content', function (current) {
        $scope.outputText = marked(current);
    });

    $scope.toggle = false;

    $http.get('/api/posts/' + $stateParams.blogId).success(function (data) {
        $scope.post.title = data.title;
        $scope.post.content = data.content;
        $scope.post.pubDate = data.pubDate;
    });


    $scope.addPost = function () {
        $http.put('/api/posts/' + $stateParams.blogId, $scope.post).success(function () {
            $state.go('blog');
        })
    }
});