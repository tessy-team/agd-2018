document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
  //  $("#exportButton").on('click',fichierCSV);
 /*   var permissions = cordova.plugins.permissions;
    permissions.checkPermission(permissions.WRITE_EXTERNAL_STORAGE,
        function () {

            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {

                //var absPath = "file:///storage/emulated/0/";
                var absPath = cordova.file.externalRootDirectory;
                var fileDir = cordova.file.externalDataDirectory.replace(cordova.file.externalRootDirectory, '');
                var fileName = "somename.txt";
                var filePath = fileDir + fileName;

                fs.root.getFile(filePath, { create: true, exclusive: false }, function (fileEntry) {
                    writeFile(fileEntry, BINARY_ARR).then(function () {
                        //do something here
                    });
                }, function (err) { });
            }, function (err) { });

            function writeFile(fileEntry, dataObj) {
                return $q(function (resolve, reject) {
                    fileEntry.createWriter(function (fileWriter) {
                        fileWriter.onwriteend = function () {
                            resolve();
                        };
                        fileWriter.onerror = function (e) {
                            reject(e);
                        };
                        fileWriter.write(dataObj);
                    });
                });
            }
        }
    );

}
/*function downloadCSV(args) {
    var data, filename, link;
    var csv = convertArrayOfObjectsToCSV({
        data: donnees
    });
    if (csv == null) return;
    filename = args.filename || 'export.csv';
    if (!csv.match(/^data:text\/csv/i)) {
        csv = 'data:text/csv;charset=utf-8,' + csv;
    }
    data = encodeURI(csv);
    link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    link.click();*/
}

function convertArrayOfObjectsToCSV(args) {
    var result, ctr, keys, columnDelimiter, lineDelimiter, data;
    data = args.data || null;
    if (data == null || !data.length) {
        return null;
    }
    columnDelimiter = args.columnDelimiter || ',   ';
    lineDelimiter = args.lineDelimiter || '\n';
    keys = Object.keys(data[0]);
    result = '';
    result += keys.join(columnDelimiter);
    result += lineDelimiter;
    /*elle parcourt l'un des obj pour creer une ligne d'en-tete, 
    suivie d'une nouvelle ligne*/
    data.forEach(function (item) {
        ctr = 0;
        /*ensuite je parcours chaque objet avec les valeurs de chaque propriete*/
        keys.forEach(function (key) {
            if (ctr > 0) result += columnDelimiter;
            result += item[key];
            ctr++;
        });
        result += lineDelimiter;
    });
    return result;
}

var donnees = [];
let db = window.openDatabase("Events00000000", "1.0", "All Deadlines", 2000000);
db.transaction(function (tx) {
    tx.executeSql('Select * from events', [], function (tx, result) {
        for (let i = 0; i < result.rows.length; i++) {
            donnees.push(result.rows[i]);
            donnees.sort(function (a, b) {
                if (a.start < b.start) {
                    return -1;
                }
                if (a.start > b.start) {
                    return 1;
                }
                return 0;
            });
        }
    });
}, function (error) {
    console.log('Transaction ERROR: ' + error.message);
}, function () {
    console.log(donnees);
});

//Function que je utilise 
function fichierCSV() {
    var method= confirm("Comment voulez-vous télecharger le fichier ?")
    if(method){
    window.resolveLocalFileSystemURL(cordova.file.externalApplicationStorageDirectory, function (dir) {
    dir.getDirectory('/AGD-2018', { create: true }, function (dirAGD) {
        console.log('file system open: ' + dirAGD.toURL());
        dirAGD.getFile("/AGD-2018/Deadlines.csv", {
            create: true
            //file exists
        }, function (file) {
            console.log("got the file", file);
            console.log(file.fullPath);
            logOb = file;
            var csv = "";
            csv = convertArrayOfObjectsToCSV({
                data: donnees
            });
           console.log("csv-" + csv);
            write(csv);
            alert("Fichier telechargé sur /AGD-2018/Deadlines.csv");
          }//file does not exist
          );
    });
});}
else{
    window.resolveLocalFileSystemURL(cordova.file.externalApplicationStorageDirectory, function (dir) {
        dir.getDirectory('/AGD-2018', { create: true }, function (dirAGD) {
            console.log('file system open: ' + dirAGD.toURL());
            dirAGD.getFile("/AGD-2018/Deadlines.csv", {
                create: true
                //file exists
            }, function (file) {
                let fileURL = `/storage/emulated/0${file.fullPath}`
                console.log("got the file", file);
                console.log(fileURL);
                Email.send({
                    SecureToken: "d7247933-70fc-46ae-a046-8c086c06bf07",
                    To: "alienfang15@gmail.com",
                    From: "AGD 2018 <team.agd.2018@gmail.com>",
                    Subject: "Télechargement Deadlines.csv",
                    Body: `Bonjour,<br>
            Ci-joint votre fichier Deadlines ! <br>
            Cordialement,<br>
            AGD-2018`,
            Attachments : [
                {
                    name : "Deadlines.csv",
                    path : fileURL
                }]
                }).then(message => console.info(message))
                });
              }//file does not exist
              );
        }); 
}

  

    function write(csv) {
        if (!logOb) return;
        logOb.createWriter(function (fileWriter) {
            fileWriter.seek(fileWriter.length);
            var blob = new Blob([csv], {
                type: 'text/csv'
            });
            fileWriter.write(blob);
            console.log("it worked");
        }, function () { console.log("failed") }
        );
    }
}
