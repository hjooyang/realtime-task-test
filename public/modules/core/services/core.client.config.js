/**
 * Created by graceyang on 15. 5. 23..
 */

var CONFIG = {
    clientId: '502747173299.apps.googleusercontent.com',
    scopes: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.install'
    ]
};


angular.module('core').value('config', CONFIG);

