/**
 * Created by pc on 4/6/16.
 */
blog.factory('blogService', function ($http) {

    return {
        deletePost: function (posts, post) {
            $http.delete('/api/posts/' + post.id).success(function () {
                _.remove(posts, post);
            });
        },
        getCurrentPost: function (currentPage, pageSize) {
            return $http.get('/api/posts?projection=noContent&page=' + (currentPage - 1) + '&size=' + pageSize + '&sort=pubDate,desc')
                .then(
                    function (response) {
                        return response.data;
                    }
                )
        },
    };
});
