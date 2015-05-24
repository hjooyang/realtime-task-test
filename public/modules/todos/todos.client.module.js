'use strict';

var todosApp = {};
// Use todosApplication configuration module to register a new module
ApplicationConfiguration.registerModule('todos');
todosApp.module = angular.module('todos', []);

/**
 * A simple type for todo items.
 * @co nstrucor
 */
todosApp.Todo = function () {
};

/**
 * A simple type for todo items.
 * @constructor
 */
todosApp.Todo = function () {
};

/**
 * Initializer for constructing via the realtime API
 *
 * @param title
 */
todosApp.Todo.prototype.initialize = function (title) {
    var model = gapi.drive.realtime.custom.getModel(this);
    this.title = model.createString(title);
    this.completed = false;
    this.setup();
};

/**
 * Adds a "text" property to collaborative strings for ng-model compatibility
 * after a model is created or loaded.
 */
todosApp.Todo.prototype.setup = function() {
    Object.defineProperty(this.title, 'text', {
        set: this.title.setText,
        get: this.title.getText
    });
};

/**
 * Loads the document. Used to inject the collaborative document
 * into the main controller.
 *
 * @param $route
 * @param storage
 * @returns {*}
 */
todosApp.loadFile = function ($route, storage) {
    var id = $route.current.params.fileId;
    var userId = $route.current.params.user;
    return storage.requireAuth(true, userId).then(function () {
        return storage.getDocument(id);
    });
};
todosApp.loadFile.$inject = ['$route', 'storage'];



//todosApp.module.value('config', CONFIG);

/**
 * Set up handlers for various authorization issues that may arise if the access token
 * is revoked or expired.
 */
angular.module('todos').run(['$rootScope', '$location', 'storage', function ($rootScope, $location, storage) {
    // Error loading the document, likely due revoked access. Redirect back to home/install page
    $rootScope.$on('$routeChangeError', function () {
        $location.url('/install?target=' + encodeURIComponent($location.url()));
    });

    // Token expired, refresh
    $rootScope.$on('todos.token_refresh_required', function () {
        storage.requireAuth(true).then(function () {
            // no-op
        }, function () {
            $location.url('/install?target=' + encodeURIComponent($location.url()));
        });
    });
}]);

/**
 * Bootstrap the todosApp
 */
gapi.load('auth:client:drive-share:drive-realtime', function () {
    gapi.auth.init();

    // Register our Todo class
    todosApp.Todo.prototype.title = gapi.drive.realtime.custom.collaborativeField('title');
    todosApp.Todo.prototype.completed = gapi.drive.realtime.custom.collaborativeField('completed');

    gapi.drive.realtime.custom.registerType(todosApp.Todo, 'todo');
    gapi.drive.realtime.custom.setInitializer(todosApp.Todo, todosApp.Todo.prototype.initialize);
    gapi.drive.realtime.custom.setOnLoaded(todosApp.Todo, todosApp.Todo.prototype.setup);

    $(document).ready(function () {
        angular.bootstrap(document, ['todos']);
    });
});
