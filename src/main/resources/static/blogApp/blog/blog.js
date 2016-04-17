/**
 * Created by pc on 3/24/16.
 */
var blog = angular.module("blogApp.blog", ['ui.ace']);
blog.config(function ($stateProvider) {
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
        .state('search', {
            url: '/blog/search/:tagName',
            templateUrl: '/blogApp/blog/partial-blog-search.html',
            controller: 'blogSearchController',
            controllerAs: 'blogSearchCtrl'
        })
    ;
});
blog.controller('blogController', function ($http, $state, $scope, blogService) {
    var self = this;
    $scope.maxSize = 7;
    $scope.currentPage = 1;
    $scope.pageSize = 7;

    var setPage = function (currentPage) {
        blogService.getCurrentPost(currentPage,$scope.pageSize).then(function (data) {
            self.posts = data._embedded.posts;
            self.totalElements = data.page.totalElements
        });
    };
    
    $scope.$watch('currentPage',function(current){
        setPage(current);
    });
    
    $scope.deletePost = function (post) {
        blogService.deletePost(self.posts,post);
    };
    $scope.changePost = function (post) {
        $state.go('update', {blogId: post.id});
    };
});
blog.controller('blogDetailController', function ($http, $stateParams, $scope, $log) {
    var self = this;
    $http.get('/api/posts/' + $stateParams.blogId).success(function (data) {
        self.post = data;

        self.post.id = self.post._links.self.href;

        self.post.content = marked(data.content);

        $log.log(self.post.id);
    });

    $http.get('/api/posts/' + $stateParams.blogId + '/tags').success(function (data) {
        $scope.tags = data._embedded.tags;
    });
});
blog.controller('blogPostController', function ($http, $scope, $state, $log) {
    $scope.post = {};
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

        $http.post("/api/posts",$scope.post).then(function(response){
            $scope.tags.forEach(function(tag){
               tag.post = response.data._links.self.href;
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
    };
    
    $scope.removeTag = function(tag){
        _.remove($scope.tags, tag);
    };

    var flag = false;
    $scope.showTag = function () {
        if(!flag) {
            $http.get('/api/tags/distinct').success(function (data) {
                $scope.distinct_tags = data;
                flag = true
            });
        }
    };

    $scope.addShowTag = function(tag) {
        var a = {};
        a.name = tag[0];
        a.color = tag[1];
        $scope.tags.push(a);
    };
});
blog.controller('blogUpdateController', function ($http, $scope, $state, $log, $stateParams) {

    $scope.post = {};
    $scope.post.title = '';
    $scope.post.content = '';
    $scope.post.author = 'pc';
    $scope.tags = [];

    $scope.$watch('post.content', function (current) {
        $scope.outputText = marked(current);
    });

    $scope.toggle = false;

    $http.get('/api/posts/' + $stateParams.blogId).success(function (data) {
        $scope.post.title = data.title;
        $scope.post.content = data.content;
        $scope.post.pubDate = data.pubDate;
    });

    $http.get('/api/posts/' + $stateParams.blogId + '/tags').success(function (data) {
        $scope.tags = data._embedded.tags;
    });

    $scope.removeTag = function(tag){
        $http.delete('/api/tags/' + tag.id).success(function () {
            _.remove($scope.tags, tag);
        });
    };

    $scope.addTag = function(tag) {
        var a = {};
        a.name = tag.name;
        a.color = tag.color;
        a.post = location.origin + '/api/posts/' + $stateParams.blogId;
        $http.post('/api/tags',a).success(function (data) {
            a.id = data.id;
            $scope.tags.push(a);
        });
    };

    $scope.addPost = function () {
        $http.put('/api/posts/' + $stateParams.blogId, $scope.post).success(function () {
            $state.go('blog');
        });
    };

    var flag = false;
    $scope.showTag = function () {
        if(!flag) {
            $http.get('/api/tags/distinct').success(function (data) {
                $log.log(data);
                $scope.distinct_tags = data;
                flag = true
            });
        }
    };

    $scope.addShowTag = function(tag) {
        var a = {};
        a.name = tag[0];
        a.color = tag[1];
        a.post = location.origin + '/api/posts/' + $stateParams.blogId;
        $http.post('/api/tags',a).success(function (data) {
            a.id = data.id;
            $scope.tags.push(a);
        });
    };

});
blog.controller('blogSearchController', function ($http, $scope, $state, $log, $stateParams) {

    $scope.currentPage = 1;
    $scope.pageSize = 7;
    $scope.maxSize = 7;

    var setPage = function (currentPage) {
        $http.get('/api/posts/search/byTag?name=' + $stateParams.tagName + '&projection=noContent' +
            '&page=' + (currentPage - 1) + '&size=' + $scope.pageSize + '&sort=pubDate,desc').success(function (data) {
            $scope.posts = data._embedded.posts;
            $scope.totalElements = data.page.totalElements;
        });
    };

    $scope.$watch('currentPage',function(current){
        setPage(current);
    });

    $scope.tagName = $stateParams.tagName;

});