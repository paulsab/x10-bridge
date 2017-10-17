var express = require('express');
var ecoplug = require('ecoplug')
var app = express();
var ReadWriteLock = require('rwlock');

app.get('/x10', function(req, res) {
        res.send('X10');
});


app.get('/x10/:device/:func', function(req, res) {
    var device = req.params.device;
    var func = req.params.func;

    var date = new Date();
    console.log("%s %s %s", date, device, func);

    x10Cmd(device,func);
    res.json({success: true});

});

app.get('/x10/devices', function(req, res) {
    var devices = {
        "Office Light":"a9",
        "Office Fan":"a2"
    };

    res.json(devices)  ;
})

app.get('/ecoplug/:device/:func', function(req,res) {
    var device = req.params.device;
    var func = req.params.func;
    var plug = plugs[device];

    if (func != "status" && plug) {
        var state = func == "on";
        ecoplug.setStatus(state, plug, function (err, status) {
            if (err) {
                console.log("failed turn set plug " + plug.name + " to " + func);
                res.json({success: false});
            } else {
                res.json({success: true});
            }
        });

    } else {
        ecoplug.getStatus(plug,function(err,status) {
            res.json({'success': !err, 'status': status})
        });
    }
});


var server = app.listen(2410, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log('X10 Bridge Server Listenting at http://%s:%s',host,port);
})

/****** X10 commands          ******/
var lock = new ReadWriteLock();
function x10Cmd(device, command) {
    var cmd = '/usr/bin/br -x /dev/ttyS0 ' + device + " " + command;
    // var execSync = require('exec-sync');
    // execSync(cmd);

    var child_process = require('child_process');

    child_process.spawnSync(cmd);

}

/****** SSDP Setup          ******/
var Server = require('node-ssdp').Server
    , ssdpServer = new Server()
    ;

ssdpServer.addUSN('urn:schemas-upnp-org:service:X10Bridge:1');
ssdpServer.addUSN('urn:schemas-upnp-org:service:ecoplugbridge:1');

ssdpServer.on('advertise-alive', function (headers) {
    // Expire old devices from your cache.
    // Register advertising device somewhere (as designated in http headers heads)
});

ssdpServer.on('advertise-bye', function (headers) {
    // Remove specified device from cache.
});


/****** Eco Plug          ******/
var plugs = {
    "office": {
        'host': '192.168.86.27',
        'port': 80,
        'id': 'ECO-7801D341',
        'name': 'ecoplug'
        },
    "desklightbars": {
        'host': '192.168.86.26',
        'port': 80,
        'id': 'ECO-78006480',
        'name': 'Desk light Bars'
        }
}




// start the server
console.log("Starting SSDP");
ssdpServer.start();
