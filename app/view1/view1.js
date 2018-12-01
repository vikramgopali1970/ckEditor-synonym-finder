'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['$scope', function($scope) {
    $scope.synRes = [];


    $scope.selectOpt = (index,word)=>{
        $scope.activeInd = index;
        $scope.word = word;
    };

    $scope.addSynToEditor = ()=>{
        $scope.htmlEditor = $scope.htmlEditor.split("<p>").join("").split("</p>").join(" ")+$scope.word;
            $scope.word = "";
        $scope.activeInd = "";
    };

    $scope.htmlEditor = 'start typing ...';
}]);