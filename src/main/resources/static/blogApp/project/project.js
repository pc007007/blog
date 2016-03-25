/**
 * Created by pc on 3/24/16.
 */
angular.module("blogApp.project", [])
    .config(function ($stateProvider) {
        $stateProvider
            .state('project', {
                url: '/project',
                templateUrl: 'blogApp/project/partial-project.html'
            })
    })