/**
 * Created by pc on 3/25/16.
 */
angular.module('blogApp.services', []).factory('Post', function($resource) {
    return $resource('http://localhost:8080/api/posts/:id', { id: '@_id' }, {
        update: {
            method: 'PUT'
        }
    });
});