/**
 * Created by graceyang on 15. 5. 22..
 */

'use strict';

angular.module('core').service('storage', ['$q', '$rootScope', 'config',
    /**
     * Handles document creation & loading for the app. Keeps only
     * one document loaded at a time.
     *
     * @param $q
     * @param $rootScope
     * @param config
     */
    function ($q, $rootScope, config) {
        this.id = null;
        this.document = null;

        /**
         * Close the current document.
         */
        this.closeDocument = function () {
            this.document.close();
            this.document = null;
            this.id = null;
        };

        /**
         * Ensure the document is loaded.
         *
         * @param id
         * @returns {angular.$q.promise}
         */
        this.getDocument = function (id) {
            if (this.id === id ) {
                return $q.when(this.document);
            } else if (this.document) {
                this.closeDocument();
            }
            return this.load(id);
        };

    /**
     * Creates a new document.
     *
     * @param title
     * @returns {angular.$q.promise}
     */
    this.createDocument = function (title) {
        var deferred = $q.defer();
        var onComplete = function (result) {
            if (result && !result.error) {
                deferred.resolve(result);
            } else {
                deferred.reject(result);
            }
            $rootScope.$digest();
        };
        gapi.client.request({
            'path': '/drive/v2/files',
            'method': 'POST',
            'body' : JSON.stringfy({
                title:title,
                mimeType: 'application/vnd.google-apps.drive-sdk'
            })
        }).execute(onComplete());
        return deferred.promise;
    };

    /**
     * Checkes to make sure the user is currently authorized and the access
     * token hasn't expired.
     * 
     * @param immediateMode
     * @param userId
     * @param {angular.$q.promise}
     */
    this.requireAuth = function (immediateMode, userId) {
        /* jshint camelCase: false */
        var token = gapi.auth.getToken();
        var now = Date.now() / 1000;
        if (token && ((token.expires_at - now) > (60))) {
            return $q.when(token);
        } else {
            var params = {
                'client_id': config.clientId,
                'scope': config.scopes,
                'immediate': immediateMode,
                'user_id': userId
            };
            var deferred = $q.defer();
            gapi.auth.authorize(params, function (result) {
                if (result && !result.error) {
                    deferred.resolve(result);
                } else {
                    deferred.reject(result);
                }
                $rootScope.$digest();
            });
            return deferred.promise;
        }
    };

    /**
     * Actually load a document. If the document is new, initializes
     * the model with empty list of todos.
     *
     * @param id
     * @returns {angular.$q.promise}
     */
    this.load = function (id) {
        var deferred = $q.defer();
        var initialize = function (model) {
            model.getRoot().set('blocks', model.createList());
        };
        var onLoad = function (document) {
            this.setDocument(id, document);
            deferred.resolve(document);
            $rootScope.$digest();
        }.bind(this);
        var onError = function (error) {
            if (error.type === gapi.drive.realtime.ErrorType.TOKEN_REFRESHED_REQUIRED){
                $rootScope.$emit('blocks.token_refresh_required');
            } else if (error.type === gapi.drive.realtime.ErrorType.CLIENT_ERROR){
                $rootScope.$emit('blocks.client_error');
            } else if (error.type === gapi.drive.realtime.ErrorType.NOT_FOUND) {
                deferred.reject(error);
                $rootScope.$emit('blocks.not_found', id);
            }
            $rootScope.$digest();
        };
        gapi.drive.realtime.load(id, onLoad, initialize, onError);
        return deferred.promise;
    };

    /**
     * Watches the model for any remote changes to force a digest cycle
     *
     * @param event
     */
    this.changeListener = function (event) {
        if (!event.isLocal) {
            $rootScope.$digest();
        }
    };

    this.setDocument = function (id, document) {
        document.getModel().getRoot().addEventListener(
            gapi.drive.realtime.EventType.OBJECT_CHANGED,
            this.changeListener);
        this.document = document;
        this.id = id;
    };
    }

]);
