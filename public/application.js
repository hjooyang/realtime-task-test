'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});


var app = {};

app.module = angular.module('core', []);


/**
 * A simple type for block items.
 * @constructor
 */

app.Block = function () {

};

/**
 * Initializer for constructing via the realtime API
 *
 * @param title
 */

app.Block.prototype.initialize = function (title) {
    var model = gapi.drive.realtime.custom.getModel(this);
    this.title = model.createString(title);
    this.completed = false;
    this.setup();
};

/**
 * Adds a "text" property to collaborative strings for ng-model compatibility
 * after a model is created or loaded.
 */
app.Block.prototype.setup = function () {
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
app.loadFile = function ($route, storage) {
    var id = $route.current.params.fileId;
    var userId = $route.current.params.user;
    return storage.requireAuth(true, userId).then(function () {
        return storage.getDocument(id);
    });
};
app.loadFile.$inject = ['$route', 'storage'];

/**
 *  Initialize our
 */




/**
 * Set up handlers for various authorization issues that may arise if the access token
 * is revoked or expired.
 */
app.module.run(['$rootScope', '$location', 'storage', function ($rootScope, $location, storage) {
    // Error loading the document, likely due revoked access. Redirect back to home/install
    $rootScope.$on('$routeChangeError', function () {
        $location.url('/install?target=' + encodeURIComponent($location.url()));
    });

    // Token expired, refresh
    $rootScope.$on('blocks.token_refresh_required', function () {
        storage.requireAuth(true).then(function () {
            //no-op
        }, function () {
            $location.url('/install?target=' + encodeURIComponent($location.url()));
        });
    });
}]);


/**
 * Bootstrap the app
 */
gapi.load('auth:client:drive-share:drive-realtime', function () {
    gapi.auth.init();

    // Register our Todo class
    app.Block.prototype.title = gapi.drive.realtime.custom.collaborativeField('title');
    app.Block.prototype.completed = gapi.drive.realtime.custom.collaborativeField('completed');

    gapi.drive.realtime.custom.registerType(app.Todo, 'todo');
    gapi.drive.realtime.custom.setInitializer(app.Todo, app.Todo.prototype.initialize);
    gapi.drive.realtime.custom.setOnLoaded(app.Todo, app.Todo.prototype.setup);

    //$(document).ready(function () {
    //    angular.bootstrap(document, ['todos']);
    //});
});
