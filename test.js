var Selector = require('./selector');
var cons = new Selector([1,2,3]);

var nodes = {};
var chars = [
    'app-project-001','app-project-002',
    'app-wdc-001',
    'app-fdc-001','app-fdc-002','app-fdc-003',
    'app-gds-001',
];

var t = 0;
chars.forEach(function(c) {
    t++;
    if (t == 6) {
        cons.removeNode(3);
        console.log(nodes);
        return false;
    }
    var node = cons.getNode(c);

    if (nodes[node]) {
        nodes[node].push(c);
    } else {
        nodes[node] = [];
        nodes[node].push(c);
    }

    return true;
});

nodes = {};
console.log('--------------');
chars.forEach(function(c) {
    var node = cons.getNode(c);

    if (nodes[node]) {
        nodes[node].push(c);
    } else {
        nodes[node] = [];
        nodes[node].push(c);
    }
});

console.log(nodes);
console.log('--------------');

nodes = {};
cons.addNode(4);
console.log(cons.distributed)
chars.forEach(function(c) {
    var node = cons.getNode(c);

    if (nodes[node]) {
        nodes[node].push(c);
    } else {
        nodes[node] = [];
        nodes[node].push(c);
    }
});
console.log(nodes);
