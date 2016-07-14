module.exports = {
    listen_ip: '127.0.0.1',
    listen_port: 8000,
    servers: {
        // 缓存服务器
        cache: {
            master: {
                'cache-001':{
                    host: '127.0.0.1',
                    port: 123,
                    username: '',
                    password: ''
                },
                'cache-002':{
                    host: '127.0.0.1',
                    port: 123,
                    username: '',
                    password: ''
                }
            }
        },

        // 日志服务器
        log: {
            master: {
                'log-001':{
                    host: '127.0.0.1',
                    port: 123,
                    username: '',
                    password: ''
                },
                'log-002':{
                    host: '127.0.0.1',
                    port: 123,
                    username: '',
                    password: ''
                }
            }
        },

        // MySQL服务器
        mysql: {
            master: {
                'mysql-001':{
                    host: '127.0.0.1',
                    port: 123,
                    username: '',
                    password: ''
                },
                'mysql-002':{
                    host: '127.0.0.1',
                    port: 123,
                    username: '',
                    password: ''
                }
            },
            slave: {
                'mysql-003':{
                    host: '127.0.0.1',
                    port: 123,
                    username: '',
                    password: ''
                },
                'mysql-002':{
                    host: '127.0.0.1',
                    port: 123,
                    username: '',
                    password: ''
                }
            }
        },

        // Redis服务器
        redis: {
            master: {
                'redis-001':{
                    host: '127.0.0.1',
                    port: 123,
                    username: '',
                    password: ''
                },
                'redis-002':{
                    host: '127.0.0.1',
                    port: 123,
                    username: '',
                    password: ''
                }
            },
            slave: {
                'redis-003':{
                    host: '127.0.0.1',
                    port: 123,
                    username: '',
                    password: ''
                },
                'redis-002':{
                    host: '127.0.0.1',
                    port: 123,
                    username: '',
                    password: ''
                }
            }
        }
    }
};
