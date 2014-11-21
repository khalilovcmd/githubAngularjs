// main application module
var appModule = angular.module('githubApp', ['ngRoute']);

appModule.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/home.html',
            controller: 'homeController'
        })
        .when('/commit/:userName/:repoName', {
            templateUrl: 'views/commits.html',
            controller: 'commitController'
        })
        .otherwise({
            redirectTo: '/'
        });
});

appModule.controller('commitController',
    function ($scope, gitFetcherService, $routeParams) {
        $scope.repoName = $routeParams.repoName;
        $scope.userName = $routeParams.userName;

        gitFetcherService
            .fetchCommits($scope.userName, $scope.repoName)
            .success(function (result) {
                $scope.commits = result;
            });
    });

appModule.controller('homeController',
    function ($scope, gitFetcherService) {

        $scope.appTitle = 'Github Repos Explorer';
        $scope.appDesc = '... may the force be with angularjs';
        $scope.canSearch = false;
        $scope.searchMode = 'desc';

        $scope.getRepos = function () {

            // fetching the repos using the fetcher service
            gitFetcherService
                .fetchRepos($scope.userName)
                .success(function (result) {
                    $scope.repos = result;

                    if (result.length > 0)
                        $scope.canSearch = true;
                    else
                        $scope.canSearch = false;
                });
        };
    });

appModule.service('gitFetcherService',
    function ($http) {
        this.fetchRepos = function (userName) {
            return $http({
                method: 'Get',
                url: 'https://api.github.com/users/' + userName + '/repos'
            });
        };

        this.fetchCommits = function (userName, repoName) {
            return $http({
                method: 'Get',
                url: 'https://api.github.com/repos/' + userName + '/' + repoName + '/commits'
            });
        };
    });

appModule.filter('searchRepoFilter',
    function () {
        return function (items, term, mode) {

            if (items != null && items.length > 0 && term != null) {
                var itemsResult = [];

                items.forEach(function (item) {
                    if (mode == 'name') {

                        term = term.toLowerCase();

                        if (item.name != null && item.name.toLowerCase().search(term) > -1)
                            itemsResult.push(item);
                    } else {

                        term = term.toLowerCase();

                        if (item.description != null && item.description.toLowerCase().search(term) > -1)
                            itemsResult.push(item);
                    }
                });

                return itemsResult;
            }

            return items;
        };
    });