/**
 * Constant
 */
const WebSocketServer = require('ws').Server;
const cp = require("child_process");
const fs = require('fs');
const open = require('open');
const ncp = require("copy-paste");
const path = require('path');
const jsonfile = require('jsonfile');

/**
 * Load settings
 */
var settings = jsonfile.readFileSync(path.join('.', 'settings', 'settings.json'));
var rootProjectDir = path.join.apply(this, settings.files.rootProjectDir);
var httpd_vhosts = path.join.apply(this, settings.files.httpd_vhosts);
var win_host = path.join.apply(this, settings.files.win_host);
var wamp_mysql = path.join.apply(this, settings.files.wamp_mysql);
var programsForWork = settings.programsForWork.programs;

var translations = jsonfile.readFileSync(path.join('.', 'settings', 'translations.json'));



/**
 * Set up server
 */
var wss = new WebSocketServer({host: '127.0.0.1',port: 9000});
console.log('New server created, waiting for connections...');
var wso;

/**
 * Create connection
 */
wss.on('connection', function(ws) {
    wso = ws;
    console.log('Server was connected.');

    ws.on('message', function(message) {
        message = JSON.parse(message);
        commandData = message.data;
        message = message.command;
        console.log('Server received message: '+ message);
        message = message.toString().trim().toLowerCase();
        mainCycle(message);
    });
});



/**
 * Commands
 */
var commandsList = [
    ["html-pomoc", false, fcPomoc],
    ["html-my-programs", false, giveMeMyPrograms],
    ["html-all-projects-from-folder", false, allProjectsFromFolder],
    ["html-all-databases-from-wamp", false, allDatabasesFromWAMP],
    ["html-settings", false, settingsHtml],
    ["konec", "ukončíš Jeeny", fcKonec],
    ["novy projekt", "Jeeny vytvoří nový projekt", fcNovyProjekt],
    ["pozdrav", "Jeeny tě pozdraví", fcPozdrav],
    ["cas", "Jeeny řekne aktuální čas a vloží ti ho do schránky", fcCas],
    ["rozhodni", "Jeeny za tebe rozhodne, jestli ani nebo ne", fcRozhodni],
    ["chci pracovat", "Jeeny zapne všechny důležitý programy pro práci", fcPracuj],
    ["testuj prohlizece", "Jeeny otevře web ve všech prohlížečích", fcProhlizece],
    ["lorem ipsum", "Jeeny vloží do clipboardu část Lorem Ipsum textu", fcLorem],
    ["vhost", "Jeeny otevře soubory pro nastavení virtual hostu", fcVhost],
    ["simpsonovi", "Jeeny ti vybere nějaký náhodný díl ze serialu Simpsonovi", fcSimpsonovi],
    ["databaze-import", "Jeeny importuje databáze do WAMP", fcDatabazeImport],
    ["databaze-export", "Jeeny exportuje databáze z WAMP", fcDatabazeExport],
    ["test", false, fcTest]     //Function for testing
];


/**
 * Main functions
 */
function createJSON(text, data, command, hidden){
    return JSON.stringify(
        {
            text: text||'',
            data: data||'',
            command: command||'',
            hidden: hidden||false
        }
    );
}
function mainCycle(readedInput){
    if(validateInput(readedInput)){
        callCommand(readedInput);
    }else{
        JeenySays("Nevím co tím myslíš");
    }
}
function validateInput(command){
    for(var i = 0; i<commandsList.length; i++){
        if(command == commandsList[i][0]){
            return true;
        }
    }
    return false;
}
function callCommand(command){
    for(var i = 0; i<commandsList.length; i++){
        if(command == commandsList[i][0]){
            commandsList[i][2]();
        }
    }
}
function JeenySays(text){
    wso.send(createJSON(text));
}




/**
 * Functions which are called on start connection
 */
function fcPomoc(){
    var helpText = "<table class='table'><tbody>";
    for(var i = 0; i<commandsList.length; i++){
        if(commandsList[i][1] != false){
            helpText = (helpText+"<tr><th>"+commandsList[i][0]+"</th><td>"+commandsList[i][1]+"</td></tr>");
        }
    }
    helpText = helpText + "</tbody></table>";
    wso.send(createJSON('', helpText, 'help-table', true));
}
function giveMeMyPrograms() {
    var myPrograms = '';
    for(var i = 0;i<programsForWork.length;i++){
        myPrograms += '<div class="checkbox"><label><input type="checkbox" id="'+programsForWork[i][0]+'">'+programsForWork[i][0]+'</label></div>';
    }
    wso.send(createJSON('', myPrograms, 'my-programs', true));
}
function allProjectsFromFolder() {
    if(!(fs.existsSync(rootProjectDir))){
        JeenySays('Nenalezena složka s projektama.');
        return false;
    }
    var myProjects = '';
    var projects = fs.readdirSync(rootProjectDir);

    for (var i in projects) {
        if(projects[i] != ".gitignore")
        myProjects += '<option>'+projects[i]+'</option>';
    }
    wso.send(createJSON('', myProjects, 'my-projects', true));
}
function allDatabasesFromWAMP() {
    if(!(fs.existsSync(wamp_mysql))){
        JeenySays('MySql složka nenalezena.');
        return false;
    }

    var cp_cmd = cp.spawn('cmd');
    var dataString = '';
    var myDatabases = '';
    var databaseList = true;
    cp_cmd.stdout.on('data', function (data) {
        dataString = dataString+data;
        if(dataString.indexOf('Database') > -1 && databaseList){
            databaseList = false;
            dataString = ''+data;
            var dataSplited = dataString.split('\r\n');
            for(var i in dataSplited){
                if(dataSplited[i] != '' && dataSplited[i] != 'Database'){
                    myDatabases += '<option>'+dataSplited[i]+'</option>';   
                }
            }
            wso.send(createJSON('', myDatabases, 'my-databases', true));
        }
    });
    cp_cmd.on('exit', function (code) {console.log('child process exited with code ' + code);});
    var locate_mysql = 'cd '+wamp_mysql+'\r\n';
    var create_database = 'mysql -u root  -e "show databases;"\r\n';
    setTimeout(function() {
        cp_cmd.stdin.write('C:\r\n');
        cp_cmd.stdin.write(locate_mysql);
        cp_cmd.stdin.write(create_database);
        cp_cmd.stdin.end();
    }, 1000);
}
function settingsHtml() {
    var html = '<div class="settings-wrap">';
    var navHtml = '<ul class="nav nav-tabs" role="tablist">';
    var panesHtml = '<div class="tab-content">';
    var firstTab = true;

    function translate(name) {
        if(translations[name] != undefined || translations[name] != null){
            return translations[name];
        }else{
            return name;
        }
    }

    for (var key in settings) {
        // skip loop if the property is from prototype
        if (!settings.hasOwnProperty(key)) continue;

        if(firstTab){
            navHtml += '<li role="presentation" class="active"><a href="#'+key+'" aria-controls="'+key+'" role="tab" data-toggle="tab">'+translate(key)+'</a></li>';
            panesHtml += '<div role="tabpanel" class="tab-pane active" id="'+key+'">';
            firstTab = false;
        }else{
            navHtml += '<li role="presentation"><a href="#'+key+'" aria-controls="'+key+'" role="tab" data-toggle="tab">'+translate(key)+'</a></li>';
            panesHtml += '<div role="tabpanel" class="tab-pane" id="'+key+'">';
        }

        var obj = settings[key];
        for (var prop in obj) {
            // skip loop if the property is from prototype
            if(!obj.hasOwnProperty(prop)) continue;

            var value = '';

            if(key == 'programsForWork'){
                for(var i = 0; i<obj[prop].length; i++){
                    panesHtml += '<div class="form-group"><label>'+translate(obj[prop][i][0])+'</label><br>';
                    value = '';
                    for(var x = 0; x<obj[prop][i][1].length; x++){
                        if(x != 0){
                            value += '/';
                        }
                        value += obj[prop][i][1][x];
                    }
                    panesHtml += '<span>'+value+'</span></div><hr>';
                }
            }else{
                if(Object.prototype.toString.call(obj[prop]) == '[object Array]'){
                    for(var i = 0; i<obj[prop].length; i++){
                        if(i != 0){
                            value += '/';
                        }
                        value += obj[prop][i];
                    }
                }else{
                    value = obj[prop];
                }
                panesHtml += '<div class="form-group"><label>'+translate(prop)+'</label><br><span>'+value+'</span></div><hr>';
            }

        }
        panesHtml += '</div>';
    }
    
    navHtml += '</ul>';
    panesHtml += '</div>';
    html += navHtml+panesHtml+'</div>';
    wso.send(createJSON('', html, 'html-settings', true));
}



/**
 * Functions for commands
 */
function fcTest(){
    JeenySays("Nemám co testovat.");
}
function fcKonec(){
    JeenySays("Přeji hezký zbytek dne, uvidíme se přiště.");
    locked = true;
    setTimeout(function() {
        process.exit()
    }, 2500);
}
function fcPozdrav(){
    JeenySays("Ahoj, já jsem Jeeny a pokusím se ti pomoct co nejvíce příkazy.");
}
function fcCas(){
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    wso.send(createJSON("\t"+day + "." + month + "." + year+"<br>\t"+hour + ":" + min + ":" + sec));

    ncp.copy(year+month+day+hour+min, function () {
    })
}
function fcRozhodni(){
    var x = Math.floor((Math.random() * 2) + 1);
    if(x==1){
        JeenySays("Myslím, že ano.");
    }else{
        JeenySays("Myslím, že ne.");
    }
}
function fcLorem(){
    ncp.copy('Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Duis condimentum augue id magna semper rutrum. In dapibus augue non sapien. Nullam justo enim, consectetuer nec, ullamcorper ac, vestibulum in, elit. Etiam posuere lacus quis dolor. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Nullam feugiat, turpis at pulvinar vulputate, erat libero tristique tellus, nec bibendum odio risus sit amet ante. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos hymenaeos. Curabitur sagittis hendrerit ante. Integer imperdiet lectus quis justo. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Nullam sapien sem, ornare ac, nonummy non, lobortis a enim. Nullam justo enim, consectetuer nec, ullamcorper ac, vestibulum in, elit. Nullam sapien sem, ornare ac, nonummy non, lobortis a enim.', function () {
        JeenySays("Lorem Ipsum je vloženo do clipboardu.");
    })
}
function fcVhost() {
    if(!(fs.existsSync(httpd_vhosts))){
        JeenySays('Soubor httpd-vhosts nenalezen.');
        return false;
    }
    if(!(fs.existsSync(win_host))){
        JeenySays('Soubor hosts nenalezen.');
        return false;
    }

    cp.exec(httpd_vhosts);
    JeenySays("Otevírám soubor httpd-vhosts.");
    open(win_host);
    JeenySays("Otevírám soubor hosts.");
}
function fcSimpsonovi() {
    var num = Math.floor((Math.random() * 583) + 1);
    open('http://simpsonovi.nikee.net/index.php?video='+num);
    JeenySays('Vybrala jsem '+num+'. díl.');
}
function fcNovyProjekt(){
    var dir;
    var name;
    if(!(fs.existsSync(rootProjectDir))){
        JeenySays('Nenalezena složka s projektama.');
        return false;
    }
    if(!(fs.existsSync(httpd_vhosts))){
        JeenySays('Soubor httpd-vhosts nenalezen.');
        return false;
    }
    if(!(fs.existsSync(win_host))){
        JeenySays('Soubor hosts nenalezen.');
        return false;
    }
    name = commandData.name;
    dir = path.join(rootProjectDir, name);
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
        fs.mkdirSync(path.join(dir, 'web'));
        fs.mkdirSync(path.join(dir, 'PSD'));
        fs.readdir(dir);
        JeenySays("Projekt \""+name+"\" je vytvořen.");
    }else{
        JeenySays("Projekt \""+name+"\" už je vytvořen.");
    }

    if(commandData.gitRepository != ""){
        var cp_cmd = cp.spawn('cmd');

        cp_cmd.stdout.on('data', function (data) {console.log('stdout: ' + data);});

        var gitRepository = commandData.gitRepository;

        setTimeout(function() {
            cp_cmd.stdin.write('C:\r\n');
            cp_cmd.stdin.write('cd '+path.join(dir, 'web')+'\r\n');
            cp_cmd.stdin.write('start "" "%SYSTEMDRIVE%\\Program Files (x86)\\Git\\bin\\sh.exe" --login -c "git clone '+gitRepository+' ."\r\n');
            cp_cmd.stdin.end();
        }, 1000);
    }

    if(commandData.folder){
        open(dir);
        JeenySays("Dobře, otevírám složku s projektem.");
    }

    if(commandData.vhost){
        fs.appendFile(win_host, '127.0.0.1       '+name+'.dev\r\n', function (err) {

        });
        fs.appendFile(httpd_vhosts, '<VirtualHost *:80>\r\n    DocumentRoot "'+path.join(dir, "web")+'"\r\n    ServerName '+name+'.dev\r\n</VirtualHost>\r\n\r\n', function (err) {

        });
        JeenySays("Prosím restartuj wampserver");
    }

    commandData = null;
}
function fcProhlizece(){
    open(commandData, "chrome");
    open(commandData, "firefox");
    open(commandData, "safari");
    open(commandData, "iexplore");
    JeenySays("Všechny prohlížeče se otevírají.");
    commandData = null;
}
function fcPracuj(){
    var programs = commandData;
    var x = 0;

    for(var i = 0; i<programs.length; i++){
        for(x;x<programsForWork.length; x++){
            if(programs[i] == programsForWork[x][0]){
                var program = path.join.apply(this, programsForWork[x][1]);
                if(!(fs.existsSync(program))){
                    JeenySays(programsForWork[x][0]+' nenalezen.');
                }else{
                    open(program);
                    JeenySays(programsForWork[x][0]+' spuštěn.');
                }
                break;
            }
        }
    }

    commandData = null;
}
function fcDatabazeImport(){
    var last = '';
    var dir = path.join(rootProjectDir, commandData.project, 'web', 'dev', 'sql');
    if (!fs.existsSync(dir)){
        JeenySays("Nenalezena složka s databází.");
        return false;
    }
    var database_dumps = fs.readdirSync(dir);

    if(commandData.db == ''){
        JeenySays('Prosím, zadej jmeno databáze.');
        return false;
    }

    if(commandData.project == ''){
        JeenySays('Prosím, zadej jmeno projektu.');
        return false;
    }

    if(!(fs.existsSync(wamp_mysql))){
        JeenySays('MySql složka nenalezena.');
        return false;
    }

    for (var i in database_dumps) {
        if(i == 0){
            last = database_dumps[i];
        }
        if(database_dumps[i] > last){
            last = database_dumps[i];
        }
    }

    var db_dump = path.join(dir, last);

    var cp_cmd = cp.spawn('cmd');
    cp_cmd.stdout.on('data', function (data) {console.log('stdout: ' + data);});
    cp_cmd.on('exit', function (code) {
        console.log('child process exited with code ' + code);
        if(code == 0){
            JeenySays("Databáze "+last+" byla úspěšně importována.")
        }else {
            JeenySays("Někde nastal problém s importováním databáze.");
        }
    });

    var locate_mysql = 'cd '+wamp_mysql+'\r\n';
    var drop_database = 'mysql -u root  -e "DROP DATABASE IF EXISTS '+commandData.db+';"\r\n';
    var create_database = 'mysql -u root  -e "CREATE DATABASE  '+commandData.db+';"\r\n';
    var create_dump = 'mysql -u root '+commandData.db+' < '+db_dump+'\r\n';

    setTimeout(function() {
        cp_cmd.stdin.write('C:\r\n');
        cp_cmd.stdin.write(locate_mysql);
        cp_cmd.stdin.write(drop_database);
        cp_cmd.stdin.write(create_database);
        cp_cmd.stdin.write(create_dump);
        cp_cmd.stdin.end();
    }, 1000);

    if(commandData.create_localconfig == 1){
        if (!fs.existsSync(path.join(rootProjectDir, commandData.project, 'web', 'system', 'config'))){
            JeenySays("Nenalezena složka pro vytvoření localconfig.php.");
            return false;
        }

        fs.writeFile(path.join(rootProjectDir, commandData.project, 'web', 'system', 'config', 'localconfig.php'), "<?php\r\n\r\n### INSTALL SCRIPT START ###\r\n$GLOBALS['TL_CONFIG']['licenseAccepted'] = true;\r\n$GLOBALS['TL_CONFIG']['installPassword'] = '$2y$10$gXl2HJVJOl0o9alwtQrPIutv4wGS7RdyZnroRjH193rUd4CseOoIe';\r\n$GLOBALS['TL_CONFIG']['encryptionKey'] = '7ac766dc9e4b82e89d5f75ea7eb9ad04';\r\n$GLOBALS['TL_CONFIG']['dbDriver'] = 'MySQL';\r\n$GLOBALS['TL_CONFIG']['dbHost'] = 'localhost';\r\n$GLOBALS['TL_CONFIG']['dbUser'] = 'root';\r\n$GLOBALS['TL_CONFIG']['dbPass'] = '';\r\n$GLOBALS['TL_CONFIG']['dbDatabase'] = '"+commandData.db+"';\r\n$GLOBALS['TL_CONFIG']['dbPconnect'] = false;\r\n$GLOBALS['TL_CONFIG']['dbCharset'] = 'UTF8';\r\n$GLOBALS['TL_CONFIG']['dbPort'] = 3306;\r\n$GLOBALS['TL_CONFIG']['dbSocket'] = '';\r\n$GLOBALS['TL_CONFIG']['adminEmail'] = 'pavel.seps@layoutmaschine.de';\r\n$GLOBALS['TL_CONFIG']['latestVersion'] = '3.5.14';\r\n$GLOBALS['TL_CONFIG']['maintenanceMode'] = false;\r\n$GLOBALS['TL_CONFIG']['repository_unsafe_catalog'] = true;\r\n$GLOBALS['TL_CONFIG']['dma_eg_content'] = 'a:1:{s:5:\"texts\";a:5:{i:0;s:1:\"2\";i:1;s:1:\"9\";i:2;s:1:\"5\";i:3;s:1:\"6\";i:4;s:1:\"8\";}}';\r\n$GLOBALS['TL_CONFIG']['dma_eg_modules'] = 'a:0:{}';\r\n$GLOBALS['TL_CONFIG']['subcolumns'] = 'boostrap_customizable';\r\n$GLOBALS['TL_CONFIG']['disableCron'] = true;\r\n### INSTALL SCRIPT STOP ###", function(err) {
            if (err){
                JeenySays('Někde nastala chyba při vytváření localconfig.php');
            }else{
                JeenySays('Localconfig.php byl vytvořen.');
            }
        });
    }

    commandData = null;
}
function fcDatabazeExport(){
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    if(commandData.db == ''){
        JeenySays('Prosím, zadej jmeno databáze.');
        return false;
    }

    if(commandData.project == ''){
        JeenySays('Prosím, zadej jmeno projektu.');
        return false;
    }

    if(!(fs.existsSync(wamp_mysql))){
        JeenySays('MySql složka nenalezena.');
        return false;
    }

    var dir = path.join(rootProjectDir, commandData.project, 'web', 'dev', 'sql');
    var name = year+month+day+hour+min+'.sql';
    var db_dump = path.join(dir, name);

    if (!fs.existsSync(dir) && fs.existsSync(db_dump)){
        JeenySays("Nenalezena složka s databází.");
    }else{
        var cp_cmd = cp.spawn('cmd');
        cp_cmd.stdout.on('data', function (data) {console.log('stdout: ' + data);});
        cp_cmd.on('exit', function (code) {
            console.log('child process exited with code ' + code);
            if(code == 0){
                JeenySays("Databáze "+name+" byla úspěšně exportována.")
            }else {
                JeenySays("Někde nastal problém s exportováním databáze.");
            }
        });

        var locate_mysql = 'cd '+wamp_mysql+'\r\n';
        var create_dump = 'mysqldump -u root '+commandData.db+' > '+db_dump+'\r\n';

        setTimeout(function() {
            cp_cmd.stdin.write('C:\r\n');
            cp_cmd.stdin.write(locate_mysql);
            cp_cmd.stdin.write(create_dump);
            cp_cmd.stdin.end();
        }, 1000);
    }

    if(commandData.create_localconfig == 1){
        JeenySays('Pro vytvoření localconfig.php použíj import.')
    }

    commandData = null;
}