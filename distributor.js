#! /usr/bin/env node

/**
 * 分布式服务器分发系统
 *
 * todo 传输加密
 *
 * 请求URL规则 /type[/actor/appid]
 * 参数定义:
 *   type: mysql(MySQL服务器), log(日志服务器), cache(缓存服务器), redis(Redis数据库服务器), status(查询应用状态,无参数)
 *   actor: master(主服务器), slave(从服务器), both(主从各返回一个)
 *   appid: 应用ID, 每个应用必须设置独立的应用ID
 *
 * 返回数据:
 *   格式:JSON{"appid":"app-wdc-001", "code":0, "master":{...}, "slave":{...}}
 *   字段含义:
 *      appid:请求时传入的应用ID
 *      code:状态码,0表示成功,大于0表示有错误
 *      master:主服务器数据结构
 *      slave:从服务器数据结构
 */

var config = require('./config');
var http = require('http');
var Selector = require('./selector');
var _ = require('underscore');

/**
 * 404错误
 * @param res
 * @param msg
 */
function error404(res, msg) {
    msg = msg || 'Not found.';
    res.writeHead(404, msg);
    res.end();
}

/**
 * 返回成功数据
 * @param res
 * @param appid 应用ID,如果传入对象,则忽略后面所有参数,返回传入的对象json
 * @param master
 * @param slave
 */
function success(res, appid, master, slave) {
    res.writeHead(200, {"Content-Type": "application/json"});

    var data;
    if (typeof appid === 'object') {
        data = appid;
        data.code = 0;
    } else {
        data = {code: 0, appid: appid};
        if (typeof master !== 'undefined') {
            data['master'] = master;
        }
        if (typeof slave !== 'undefined') {
            data['slave'] = slave;
        }
    }

    res.end(JSON.stringify(data));
}

/**
 * 返回失败数据
 * @param res
 * @param appid
 * @param code
 */
function error(res, appid, code) {
    res.writeHead(200, {"Content-Type": "application/json"});
    var data = {code: code, appid: appid};
    res.end(JSON.stringify(data));
}

var typeList = ['mysql', 'log', 'cache', 'redis', 'status'],
    actorList = ['master', 'slave', 'both'];

// 添加节点
var selectors = {}; // {master:selObj, slave:selObj}
_.each(config.servers, function (s, t) {
    selectors[t] = {};
    _.each(['master', 'slave'], function (actor) {
        if (typeof s[actor] !== 'undefined') {
            var ids = [], setting = s[actor];
            _.each(setting, function (v, k) {
                ids.push(k);
            });

            selectors[t][actor] = new Selector(ids);
        }
    });
});

function getMaster(type, appid) {
    if (typeof selectors[type] !== 'undefined' && typeof selectors[type].master !== 'undefined') {
        var id = selectors[type].master.getNode(appid);
        if (id) {
            return config.servers[type].master[id];
        }
    }

    return null;
}

function getSlave(type, appid) {
    if (typeof selectors[type] !== 'undefined' && typeof selectors[type].slave !== 'undefined') {
        var id = selectors[type].slave.getNode(appid);
        if (id) {
            return config.servers[type].slave[id];
        }
    }

    return null;
}

/**
 * 获得appid对应的节点
 * @param appid
 * @param type
 * @param actor
 * @returns {*}
 */
function getNodeByType(appid, type, actor) {
    var _type = selectors[type];
    if (typeof _type[actor] !== undefined) {
        return _type[actor].getNode(appid);
    }

    return null;
}

// 创建服务器
http.createServer(function (req, res) {

    var type, actor, appid;

    // 分析请求参数
    var urlArr = req.url.trim().split('/');
    urlArr = _.filter(urlArr, function (p) {
        return p != ''
    });
    if (urlArr.length == 0) {
        error404(res);
    }

    if (urlArr[0] === 'status') {
        var statusData = {};
        _.each(selectors, function (v, t) {
            statusData[t] = {};
            _.each(v, function (sel, a) {
                statusData[t][a] = sel.getStatus();
            });
        });

        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify(statusData));
    } else {
        if (urlArr.length !== 3) {
            error404(res);
        }

        type = urlArr[0];
        actor = urlArr[1];
        appid = urlArr[2];

        if (!_.contains(typeList, type)) {
            error404(res, 'Type ' + type + 'not found.');
        }

        if (!_.contains(actorList, actor)) {
            error404(res, 'Actor ' + actor + 'not found.');
        }

        if (!appid) {
            error404(res, 'Empty App ID.');
        }

        var master = null,
            slave = null;

        switch (actor) {
            case 'master':
                master = getMaster(type, appid);
                break;
            case 'slave':
                slave = getSlave(type, appid);
                break;
            case 'all':
                master = getMaster(type, appid);
                slave = getSlave(type, appid);
        }

        success(res, appid, master, slave)
    }

}).listen(config.listen_port, config.listen_ip);

console.log('Server running at http://' + config.listen_ip + ':' + config.listen_port + '/');
