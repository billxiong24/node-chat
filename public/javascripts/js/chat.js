var chatio = angular.module('chatio', []);
chatio.controller('chatio-control', function($scope, $http){
    $scope.incr = 1;
$scope.testAjax = function(){
    console.log("hey");
    $scope.incr++;
    $http.post("testAjax.php", {"data": "test transfer"})
    .success(function(response) {
        $scope.diff = response.test;    
        console.log(response.test);
        console.log(response.trans);
    });
}
$scope.func = function(){
    $http.post("testAjax.php", {"data": "test transfer"})
    .success(function(response) {
        $scope.diff = response.test;    
        console.log(response.test);
        console.log(response.trans);
        console.log("submitted");
    });
    
}

});
