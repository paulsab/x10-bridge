var child_process = require('child_process');
const cmd = "/usr/bin/br -x /dev/ttyS0 a9 off";

child_process.spawnSync(cmd);
// child_process.exec(cmd, function(error, stdout, stderr) {
//     console.log("executed "+cmd);
// });