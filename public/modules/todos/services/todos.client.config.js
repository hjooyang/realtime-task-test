/**
 * Created by graceyang on 15. 5. 23..
 */

var CONFIG = {
    //clientId: '502747173299.apps.googleusercontent.com',
    clientId: '359533184457-tthibcnume5clmdc0vumm6r6vrhovlgm.apps.googleusercontent.com',


    scopes: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.install',
        'https://www.googleapis.com/auth/plus.login',
        'https://www.googleapis.com/auth/userinfo.email'
    ]
};


angular.module('todos').value('config', CONFIG);

