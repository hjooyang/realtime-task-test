/**
 * Created by graceyang on 15. 5. 23..
 */
'use strict';
angular.module('todos').config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/install');

        $stateProvider.
            state('todos', {
                url:'/todos/:fileId/:filter',
                templateUrl:'modules/todos/views/main.client.view.html',
                controller:'MainCtrl',
                resolve: {
                    realtimeDocument: todosApp.loadFile
                }
            })
            .state('create', {
                url: '/create',
                templateUrl: 'modules/todos/views/loading.client.view.html'
                // controller: 'CreateCrtl'
            });
            //.state('install', {
            //    templateUrl: 'modules/todos/views/install.client.view.html'
            //   // controller: 'InstallCtrl'
            //});
    }
]);



