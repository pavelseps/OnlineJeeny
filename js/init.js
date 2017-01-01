$(document).ready(function() {

    $('.fancybox-open').fancybox({
        maxWidth	: 800,
        maxHeight	: 600,
        fitToView	: false,
        width		: '70%',
        height		: '70%',
        autoSize	: false,
        closeClick	: false,
        openEffect	: 'none',
        closeEffect	: 'none'
    });

    $('.form-control').keypress(function (e) {
        if (e.which == 13) {
            $(this).parent('.input-group').find('button').click();
            return false;
        }
    });

    function calcButtonsH() {
        var buttonsH = $('.buttons button').width();
        $('.buttons button').each(function () {
            $(this).height(buttonsH);
        })
    }
    calcButtonsH();
    $(window).resize(function () {
        calcButtonsH();
    })

    startWait();
})


var loaderWait;
function startWait() {
    $('#header .navbar-brand').removeClass('important');
    $('.buttons button').prop('disabled', true);
    loaderWait = setInterval(function () {
        $('#header .navbar-brand').animate({opacity: 1}, 500, function () {
            $('#header .navbar-brand').animate({opacity: 0.4}, 500);
        });
    },1000);
}
function endWait() {
    clearInterval(loaderWait);
    $('#header .navbar-brand').addClass('important');
    $('.buttons button').prop('disabled', false);
}









// Function that helps us log message to the screen.
function logJenny(msg) {
    //console.log(msg);
    $('#log').append('<div class="jeeny"><span>'+msg+'</span></div>');
    $('#log').scrollTop($('#log')[0].scrollHeight);
}

function logClient(msg) {
    //console.log(msg);
    $('#log').append('<div class="client"><span>'+msg+'</span></div>');
    $('#log').scrollTop($('#log')[0].scrollHeight);
}

function logNeutral(msg) {
    //console.log(msg);
    $('#log').append('<div class="neutral"><span>'+msg+'</span></div>');
}
function createJSON(command, data){
    return JSON.stringify(
        {
            command: command||'',
            data: data||''
        }
    );
}

// Setup websocket with callbacks.
// Open the connection with the server.
var ws = new WebSocket('ws://localhost:9000/');

// Log a message when connection is successful.
ws.onopen = function() {
    endWait();
    logNeutral('Server připojen.');
};

// Waiting for user input.
$('#send').click(function () {
    var msgSend= $('#entry').val() ;
    if(msgSend != ""){
        sendToServer(msgSend);
    }
    $('#entry').val('');
})
$('.simgle-command').click(function () {
    var msgSend = $(this).attr('id');
    var niceText = $(this).text();
    sendToServer(msgSend, niceText);
})

// When a message from server is received, we display it on the screen.
ws.onmessage = function(evt) {
    endWait();
    var msgReceived = JSON.parse(evt.data);
    if(msgReceived.hidden){   //For hidden mesage
        if (msgReceived.command == "help-table"){  //add html of help to "pomoc" popup
            $('#show-help').html(msgReceived.data);
            $.fancybox.open({
                maxWidth	: 800,
                maxHeight	: 600,
                fitToView	: false,
                width		: '70%',
                height		: '70%',
                autoSize	: false,
                closeClick	: false,
                openEffect	: 'none',
                closeEffect	: 'none',
                href: $('#fancybox-help-open').attr('href')
            });
        }else if(msgReceived.command == "logedIn") {
            logJenny(msgReceived.text)
        } else if(msgReceived.command == "my-programs") {
            $('#programs-list').html(msgReceived.data);
            $.fancybox.open({
                maxWidth	: 800,
                maxHeight	: 600,
                fitToView	: false,
                width		: '70%',
                height		: '70%',
                autoSize	: false,
                closeClick	: false,
                openEffect	: 'none',
                closeEffect	: 'none',
                href: $('#fancybox-chci-pracovat-open').attr('href')
            });
        } else if(msgReceived.command == "my-projects") {
            $('#contao-project').html(msgReceived.data);
            $('#contao-project').selectpicker({
                size: 12
            });
        } else if(msgReceived.command == "my-databases") {
            $('select.name-db').html(msgReceived.data);
            $('select.name-db').selectpicker({
                size: 12
            });
            $.fancybox.open({
                maxWidth	: 800,
                maxHeight	: 600,
                fitToView	: false,
                width		: '70%',
                height		: '70%',
                autoSize	: false,
                closeClick	: false,
                openEffect	: 'none',
                closeEffect	: 'none',
                href: $('#fancybox-mysql-open').attr('href')
            });
        }else if(msgReceived.command == "html-settings") {
            $('#fancybox-settings .data').html(msgReceived.data);
            $('.settings-wrap .nav a').click(function (e) {
                $('.settings-wrap .nav li').removeClass('active');
                $(this).parent('li').addClass('active');
                $('.tab-content > .tab-pane').removeClass('active');
                $('.tab-content > .tab-pane'+$(this).attr('href')).addClass('active');
            })
            $.fancybox.open({
                maxWidth	: 800,
                maxHeight	: 600,
                fitToView	: false,
                width		: '70%',
                height		: '70%',
                autoSize	: false,
                closeClick	: false,
                openEffect	: 'none',
                closeEffect	: 'none',
                href: $('#fancybox-settings-open').attr('href')
            });
        }

    }else{//Jeenys text message
        logJenny (msgReceived.text);
    }
}

// As soon as the connection is closed, we inform the user.
ws.onclose = function() {
    endWait();
    $('.buttons button').prop('disabled', true);
    logNeutral('Server odpojen.');
    $('#log').scrollTop($('#log')[0].scrollHeight);
};

function sendToServer(msgSend, niceText) {
    logClient (niceText || msgSend);
    startWait();
    ws.send (createJSON(msgSend));
}

window.onbeforeunload = function(e) {
    ws.send (createJSON("lock"));
};


/**
 * Get html
 */
$('#fancybox-help-open').click(function () {
    ws.send (createJSON('html-pomoc')); //send command for help html
    return false;
})

$('#fancybox-chci-pracovat-open').click(function () {
    ws.send (createJSON('html-my-programs')); //send command for programs html
    return false;
})

$('#fancybox-mysql-open').click(function () {
    ws.send (createJSON('html-all-projects-from-folder')); //send command for project list options html
    ws.send (createJSON('html-all-databases-from-wamp')); //send command for databases list options html
    return false;
})
$('#fancybox-settings-open').click(function () {
    ws.send (createJSON('html-settings')); //send command for settings html
    return false;
})



/**
 * Nový projekt
 */
$('#project').click(function () {
    if(!($('#project-name').val() == null || $('#project-name').val() == "")){
        var data = {
            name: $('#project-name').val(),
            folder: $('#open-folder').is(":checked"),
            vhost: $('#create-vhost').is(":checked"),
            gitRepository: $('#git-repository').val()
        };

        ws.send(createJSON('novy projekt', data));
        $.fancybox.close();
    }
})


/**
 * Testuj prohlížeče
 */
$('#website').click(function () {
    if(!($('#website-name').val() == null || $('#website-name').val() == "")){
        ws.send(createJSON('testuj prohlizece', $('#website-name').val()));
        $.fancybox.close();
    }
})

/**
 * Chci pracovat
 */
$('#pracuj').click(function () {
    var returnArr = [];
    $('#programs-list .checkbox').each(function () {
        if ($(this).find('input').is(":checked")) {
            returnArr.push($(this).find('input').attr('id'));
        }
    })
    ws.send(createJSON('chci pracovat', returnArr));
    $.fancybox.close();
})


/**
 * Login
 */
$(document).ready(function () {
    $('#pwd').click(function () {
        var pwd = MD5($('#pwd-input').val());
        ws.send(createJSON(pwd));
    })
})


/**
 * MySQL pro contao - Import
 */
$(document).ready(function () {
    $('.chose-db-settings #choose-db').on('change', function () {
        $('.name-db').each(function () {
            $(this).toggleClass('selected');
        })
    })

    $('#im-submit').click(function () {
        var data = {
            db: $('select.name-db.selected, input.name-db.selected').val(),
            project: $('#contao-project').val(),
            create_localconfig: $('#contao-localcongig:checked').length
        };
        ws.send(createJSON('databaze-import', data));
        $('select.name-db').selectpicker('destroy');
        $('#contao-project').selectpicker('destroy');
        $.fancybox.close();
    })
})

/**
 * MySQL pro contao - Export
 */
$(document).ready(function () {
    $('#ex-submit').click(function () {
        var data = {
            db: $('select.name-db.selected, input.name-db.selected').val(),
            project: $('#contao-project').val()
        };
        ws.send(createJSON('databaze-export', data));
        $.fancybox.close();
    })
});