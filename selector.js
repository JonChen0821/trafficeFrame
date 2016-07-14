var _ = require('underscore');

var Selector = function (nodes) {
    this.nodes = [];
    this.nodeStatus = {};
    this.distributed = {};

    for (var i = 0; i < nodes.length; i++) {
        this.addNode(nodes[i]);
    }
};

/**
 * 添加节点
 * todo 支持节点权重概率
 *
 * @param node
 */
Selector.prototype.addNode = function (node) {
    if (typeof this.nodes[node] !== 'undefined') {
        console.error('Node ' + node + ' exists.');
        return;
    }

    // 当前节点被分配的数量平均数
    var mean = this.nodes.length? Math.floor(Object.keys(this.distributed).length / (this.nodes.length + 1)) : 0;
    // 被平衡到新节点的数量
    var added = 0;
    // 平衡已分配的key
    for (var n in this.nodeStatus) {
        if (this.nodeStatus.hasOwnProperty(n) && this.nodeStatus[n] > mean) {
            var diff = this.nodeStatus[n] - mean;
            for (var j in this.distributed) {
                if (diff <= 0 || added >= mean) {
                    break;
                }
                if (this.distributed.hasOwnProperty(j) && this.distributed[j] == n) {
                    this.distributed[j] = node;
                    this.nodeStatus[n] -= 1;
                    added++;
                    diff--;
                }
            }
        }
    }


    // 添加节点
    this.nodes.push(node);
    this.nodeStatus[node] = added;
};

Selector.prototype.removeNode = function (node) {
    var _this = this;

    this.nodes.forEach(function(n, i) {
        if (n == node) {
            _this.nodes.splice(i, 1);
        }
    });

    delete this.nodeStatus[node];

    for (var k in this.distributed) {
        if (this.distributed.hasOwnProperty(k) && this.distributed[k] == node) {
            delete this.distributed[k];
        }
    }
};

Selector.prototype.getNode = function (key) {
    if (typeof this.distributed[key] != 'undefined') {
        // 已经分配过了,直接返回结果
        return this.distributed[key];
    }

    // 重来没分配过,找出被分配最少的node
    var node = this.findFreeNode();
    this.nodeStatus[node]++;
    this.distributed[key] = node;

    return node;
};

/**
 * 找出可被分配的节点
 * TODO: 支持node权重概率
 * @returns string
 */
Selector.prototype.findFreeNode = function () {
    var min;

    // 找出被分配次数最少的节点
    var node;
    for (var n in this.nodeStatus) {
        if (this.nodeStatus.hasOwnProperty(n)) {
            if (typeof min == 'undefined' || this.nodeStatus[n] <= min) {
                min = this.nodeStatus[n];
                node = n;
            }
        }
    }

    return node;
};

Selector.prototype.getStatus = function() {
    return {
        clinets: _.keys(this.distributed),
        distributed:this.distributed,
        nodes:this.nodes,
        nodeStatus:this.nodeStatus
    }
};

module.exports = Selector;