var jsonfile = require('jsonfile');

var file = './settings/settings.json';
var obj = {
    files: {
        rootProjectDir: ['C:', 'Users', 'Pavel', 'prace', 'projekty'],
        poznamky: ['C:', 'Users', 'Pavel', 'Desktop', 'notes.txt'],
        httpd_vhosts: ['C:', 'wamp', 'bin', 'apache', 'apache2.4.9', 'conf', 'extra', 'httpd-vhosts.conf'],
        win_host: ['C:', 'Windows', 'System32', 'drivers', 'etc', 'hosts'],
        wamp_mysql: ['C:', 'wamp', 'bin', 'mysql', 'mysql5.6.17', 'bin']
    },
    websites: {
        zabava: 'http://9gag.com/',
        jira: 'https://layoutmaschine.atlassian.net/issues/?filter=10301',
        zpravy: 'http://www.idnes.cz/'
    },
    programsForWork:{
        programs: [
            ["Thunderbird", ['C:', 'Program Files (x86)', 'Mozilla Thunderbird', 'thunderbird.exe']],
            ["Hipchat", ['C:', 'Program Files (x86)', 'Atlassian', 'HipChat4', 'HipChat.exe']],
            ["PhpStorm", ['C:', 'Program Files (x86)', 'JetBrains', 'PhpStorm 2016.1', 'bin', 'PhpStorm.exe']],
            ["Photoshop", ['C:', 'Program Files', 'Adobe', 'Adobe Photoshop CC 2015', 'Photoshop.exe']],
            ["Prepros", ['C:', 'Program Files (x86)', 'Prepros', 'Prepros.exe']],
            ["Sourcetree", ['C:', 'Program Files (x86)', 'Atlassian', 'SourceTree', 'SourceTree.exe']],
            ["Keepass", ['C:', 'Program Files (x86)', 'KeePass Password Safe', 'KeePass.exe']],
            ["FileZilla", ['C:', 'Program Files', 'FileZilla FTP Client', 'filezilla.exe']]
        ]
    }
};
/*
var file = './settings/translations.json';
var obj = {
    files: 'Složky',
    websites: 'Weby',
    programsForWork: 'Programy pro práci',
    rootProjectDir: 'Složka s projekty',
    poznamky: 'Poznámky',
    httpd_vhosts: 'Cesta k httpd-vhosts.conf',
    win_host: 'Cesta k hosts',
    wamp_mysql: 'Cesta k MySql složce',
    zabava: 'Zábava',
    jira: 'Jira',
    zpravy: 'Zprávy'
}*/

jsonfile.writeFile(file, obj, function (err) {
    console.error(err)
})