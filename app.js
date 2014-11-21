// main application module
var appModule = angular.module('githubApp', ['ngRoute']);

// for c# like syntax
String.format = function(){

    var args = arguments,
        string = args[0];

    // replace occurances of {n} with arguments[n]
    return string.replace(new RegExp("\\{([0-9]+)\\}", "g"), function (match, subMatch) {

        // added 1 because the first argument is the string itself
        var index = parseInt(subMatch) + 1;

        // value not found
        if (typeof args[index] == "undefined")
            throw String.format("value not found at index:{0} for the string:{1}", index, string);

        // return the replacement
        return args[index];

    });

};

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

        var githubApiHost = "https://api.github.com"

        this.fetchRepos = function (userName) {
            return $http({
                method: 'Get',
                url: String.format("{0}/users/{1}/repos", githubApiHost, userName)
            });
        };

        this.fetchCommits = function (userName, repoName) {
            return $http({
                method: 'Get',
                url: String.format("{0}/repos/{1}/{2}/commits", githubApiHost, userName, repoName)
            });
        };

        this.fetchTags = function (userName, repoName) {
            return $http({
                method: 'Get',
                url: String.format("{0}/repos/{1}/{2}/tags", githubApiHost, userName, repoName)
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