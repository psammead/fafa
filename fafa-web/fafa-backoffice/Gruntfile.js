'use strict';

var path = require('path');
var nconf = require('nconf');

var dbconf = require('./server/public/conf/config.json').database;
var nano = require('nano')({
    'url': dbconf.protocol + '://' + 'admin:' + (dbconf.adminPassword || 'admin') + '@' + (dbconf.host || '127.0.0.1') + ':' + (dbconf.port || '5984'),
    'request_defaults': {
        'strictSSL': false
    }
});
var packageJson = require('./package.json');

//
//Path constants
//

var ALL_CLIENT_JS = [
    '<%= yeoman.app %>/addons/**/*.js',
    '<%= yeoman.app %>/commons/**/*.js',
    '<%= yeoman.app %>/components/**/*.js',
    '<%= yeoman.app %>/logger/**/*.js',
    '<%= yeoman.app %>/scripts/**/*.js',

    //Exclude libs
    '!<%= yeoman.app %>/addons/bower_components/**',
    '!<%= yeoman.app %>/addons/lib/**',

    //Exclude themes
    '!<%= yeoman.app %>/addons/*/themes/**'
];

var ALL_SERVER_JS = [
    'server.js',
    'server/**/*.js'
];

var ALL_CSS = [
    '<%= yeoman.app %>/addons/**/*.css',
    '<%= yeoman.app %>/components/**/*.css',

    //Exclude libs
    '!<%= yeoman.app %>/bower_components/**',
    '!<%= yeoman.app %>/addons/bower_components/**',
    '!<%= yeoman.app %>/addons/lib/**',

    //Exclude Bootstrap
    '!<%= yeoman.app %>/addons/*/themes/*/css/bootstrap.css'
];

var UNDELIVERED_CLIENT_SOURCES = [
    //Exclude undelivered addons
    '!addons/bytel/**',
    '!addons/example/**',
    '!addons/ff/**',
    '!addons/hpe_unsupported/**',
    '!addons/oi/**',
    '!addons/sd/**',
    '!addons/training/**',

    //Exclude some themes (not finished)
    '!addons/hpe/themes/hp/**',
    '!addons/hpe/themes/slate/**',
    '!addons/hpe/themes/united/**'

];

var UNDELIVERED_SERVER_SOURCES = [
    //Exclude undelivered plugins
    '!server/addons/plugins/plugin_dtag/**',
    '!server/addons/plugins/plugin_oi/**',
    '!server/addons/plugins/plugin_sample/**',
    '!server/addons/plugins/plugin_sample_map/**',
    '!server/addons/plugins/plugin_test/**',
    '!server/addons/plugins/training/**',
    '!server/addons/modules/sample-post-auth-module/**'
];

module.exports = function(grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Define the configuration for all the tasks
    grunt.initConfig({

        //Clean directories
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '<%= yeoman.dist %>/**'
                    ]
                }]
            },

            tmp: {
                files: [{
                    dot: true,
                    src: [
                        '<%= yeoman.tmp %>/**'
                    ]
                }]
            },

            report: {
                files: [{
                    dot: true,
                    src: [
                        '<%= yeoman.report %>/**'
                    ]
                }]
            },

            instrument: {
                files: [{
                    dot: true,
                    src: [
                        '<%= yeoman.instrument %>/**'
                    ]
                }]
            },

            kit: {
                files: [{
                    dot: true,
                    src: [
                        '<%= yeoman.dist %>/bower.json',
                        '<%= yeoman.dist %>/.bowerrc',
                        '<%= yeoman.dist %>/package.json',
                        '<%= yeoman.dist %>/client/addons/bower.json',
                        '<%= yeoman.dist %>/client/addons/.bowerrc'
                    ]
                }]
            },

            doc: {
                files: [{
                    dot: true,
                    src: [
                        '<%= yeoman.doc %>/**'
                    ]
                }]
            },

            'sass-tmp': {
                files: [{
                    dot: true,
                    src: [
                        '<%= yeoman.app %>/sass-tmp'
                    ]
                }]
            },

            sdk: {
                files: [{
                    dot: true,
                    src: [
                        '<%= yeoman.dist %>/core/client/build.js',
                        '<%= yeoman.dist %>/core/package.json',
                        '<%= yeoman.dist %>/core/bower.json',
                        '<%= yeoman.dist %>/core/.bowerrc',
                        '<%= yeoman.dist %>/core/client/addons/bower.json',
                        '<%= yeoman.dist %>/core/client/addons/.bowerrc'
                    ]
                }]
            }
        },

        //Run tasks in parallel
        concurrent: {
            debug: {
                tasks: [
                    'nodemon:debug',
                    'node-inspector:custom'
                ],
                options: {
                    logConcurrentOutput: true
                }
            },

            premin: {
                tasks: [
                    'ngAnnotate:tmp',
                    'autoprefixer:tmp'
                ]
            },

            min: {
                tasks: [
                    'uglify:tmp',
                    'cssmin:tmp',
                    'htmlmin:tmp'
                ]
            }
        },

        // Copies files to places other tasks can use
        copy: {
            //Minifiable client sources
            tmp_client: {
                cwd: '<%= yeoman.app %>',
                dest: '<%= yeoman.tmp %>/client',
                expand: true,
                src: [
                    'addons/**/*.{js,css,html}',
                    'commons/**/*.{js,css,html}',
                    'components/**/*.{js,css,html}',
                    'logger/**/*.{js,css,html}',
                    'scripts/**/*.{js,css,html}',
                    'views/**/*.{js,css,html}',

                    //Exclude libs
                    '!addons/bower_components/**',
                    '!addons/lib/**',

                    //Exclude client tests
                    '!**/*-test.js'
                ].concat(UNDELIVERED_CLIENT_SOURCES)
            },

            //Minifiable server sources
            tmp_server: {
                cwd: '<%= yeoman.app %>/../',
                dest: '<%= yeoman.tmp %>',
                expand: true,
                src: [
                    'server/**/*.{js,css,html}',

                    //Exclude server tests
                    '!server/**/*-test.js',

                    //Exclude public dir
                    '!server/public/**'
                ].concat(UNDELIVERED_SERVER_SOURCES)
            },

            //Minifiable misc sources
            tmp_root: {
                cwd: '<%= yeoman.app %>/../',
                dest: '<%= yeoman.tmp %>',
                expand: true,
                src: [
                    'install/**/*.{js,css,html}',
                    'server.js'
                ]
            },

            //Copy files into the minification folder. SDK version
            tmp_sdk: {
                files: [{
                    //Minifiable client sources without addons
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.tmp %>/client',
                    expand: true,
                    src: [
                        'commons/**/*.{js,css,html}',
                        'components/**/*.{js,css,html}',
                        'logger/**/*.{js,css,html}',
                        'scripts/**/*.{js,css,html}',
                        'views/**/*.{js,css,html}',

                        //Exclude client tests
                        '!**/*-test.js'
                    ]
                }, {
                    //Minifiable server sources without plugins
                    cwd: '<%= yeoman.app %>/../',
                    dest: '<%= yeoman.tmp %>',
                    expand: true,
                    src: [
                        'server/**/*.{js,css,html}',

                        //Exclude server tests
                        '!server/**/*-test.js',

                        //Exclude public dir
                        '!server/public/**',

                        //Exclude addons
                        '!server/addons/**'
                    ]
                }, {
                    //Root minifiable sources
                    cwd: '<%= yeoman.app %>/../',
                    dest: '<%= yeoman.tmp %>',
                    expand: true,
                    src: [
                        'install/**/*.{js,css,html}',
                        'server.js'
                    ]
                }]
            },

            //No JS/CSS/HTML under client
            dist_client: {
                cwd: '<%= yeoman.app %>',
                dest: '<%= yeoman.dist %>/client',
                expand: true,
                dot: true,
                src: [
                    'addons/**',
                    'commons/**',
                    'components/**',
                    'logger/**',
                    'scripts/**',
                    'views/**',

                    //Exclude js/html/css files
                    '!addons/**/*.{js,css,html}',
                    '!commons/**/*.{js,css,html}',
                    '!components/**/*.{js,css,html}',
                    '!logger/**/*.{js,css,html}',
                    '!scripts/**/*.{js,css,html}',
                    '!views/**/*.{js,css,html}',

                    //Exclude libs
                    '!addons/bower_components/**',
                    '!addons/lib/**',

                    //Exclude HP/SDK specific files
                    '!addons/ossa/widgets/ossa-session-table/todo.org',
                    '!views/index.html.sdk',

                    //Exclude source maps
                    '!**/*.map'
                ].concat(UNDELIVERED_CLIENT_SOURCES)
            },

            //No JS/CSS/HTML under server
            dist_server: {
                //No JS/CSS/HTML under server
                cwd: '<%= yeoman.app %>/../',
                dest: '<%= yeoman.dist %>',
                expand: true,
                dot: true,
                src: [
                    'server/**',
                    '!server/**/*.{js,html,css}',

                    //Exclude public dirs
                    '!server/public/**'
                ].concat(UNDELIVERED_SERVER_SOURCES)
            },

            //No JS/CSS/HTML under root
            dist_root: {
                cwd: '<%= yeoman.app %>/../',
                dest: '<%= yeoman.dist %>',
                expand: true,
                src: [
                    'install/**',
                    '!install/**/*.{js,html,css}',
                ]
            },

            //Misc files under client
            dist_client_misc: {
                cwd: '<%= yeoman.app %>',
                dest: '<%= yeoman.dist %>/client',
                expand: true,
                dot: true,
                src: [
                    'addons/example/**',
                    'addons/lib/**',
                    'lib/**',
                    'public/**',
                    '!public/maps/*.json',
                    'favicon.ico'
                ]
            },

            //Misc files under server
            dist_server_misc: {
                cwd: '<%= yeoman.app %>/../',
                dest: '<%= yeoman.dist %>',
                expand: true,
                src: [
                    //Server side sample
                    'server/addons/plugins/plugin_sample/**',

                    //Conf files
                    'server/public/**',

                    //Exclude undelivered plugins conf files
                    '!server/public/addons/plugins/plugin_oi/**',
                    '!server/public/addons/plugins/plugin_sample_map/**',
                    '!server/public/addons/plugins/plugin_test/**',
                    '!server/public/addons/plugins/training/**',

                    //Exclude sdk files
                    '!server/public/addons/plugins/ossa/config.json.sdk',
                    '!server/public/addons/plugins/plugin_simulator/config.json.sdk',
                    '!server/public/conf/config.json.sdk',

                    //Exclude Weather simulation package from the plugin_simulator
                    '!server/public/addons/plugins/plugin_simulator/packages/WEATHER_Simulation/**',

                    //Add server module sample
                    'server/addons/modules/sample-post-auth-module/**'
                ]
            },

            //Misc files at the root of the project
            dist_root_misc: {
                cwd: '<%= yeoman.app %>/../',
                dest: '<%= yeoman.dist %>',
                expand: true,
                src: [
                    'bin/**',
                    'data/**',
                    '!data/categories/categories_oi_tenant.json',
                    '!data/launch-categories/launch-categories_oi_tenant.json',
                    '!data/launches/launches_oi_tenant.json',
                    '!data/roles/roles_oi_tenant.json',
                    '!data/users/users_oi_tenant.json',
                    '!data/views/**',
                    '!data/workspaces/**',
                    '!data/**/*.sdk',
                    'scripts/**',
                    'LICENSE.txt',
                    'bower.json',
                    'package.json',
                    '.bowerrc',
                    'README.md'
                ]
            },

            //Minified files
            dist_tmp: {
                cwd: '<%= yeoman.tmp %>',
                dest: '<%= yeoman.dist %>',
                expand: true,
                src: [
                    '**'
                ]
            },

            //Copy files in the distribution folder (/core). SDK version
            dist_sdk: {
                files: [{
                    //Minified sources
                    cwd: '<%= yeoman.tmp %>',
                    dest: '<%= yeoman.dist %>/core',
                    expand: true,
                    src: [
                        '**'
                    ]
                }, {
                    //No JS/CSS/HTML under client
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>/core/client',
                    expand: true,
                    dot: true,
                    src: [
                        'commons/**',
                        'components/**',
                        'logger/**',
                        'scripts/**',
                        'views/**',

                        //Exclude js/html/css files
                        '!commons/**/*.{js,css,html}',
                        '!components/**/*.{js,css,html}',
                        '!logger/**/*.{js,css,html}',
                        '!scripts/**/*.{js,css,html}',
                        '!views/**/*.{js,css,html}',
                        '!views/index.html.sdk',

                        //Exclude index.html kitting
                        '!views/index.html.kitting'
                    ]
                }, {
                    //Misc files under client
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>/core/client',
                    expand: true,
                    dot: true,
                    src: [
                        'addons/hpe/**',
                        'addons/ossa/**',
                        '!addons/ossa/widgets/ossa-session-table/todo.org',
                        'addons/example/**',
                        'addons/lib/**',
                        'addons/bower.json',
                        'addons/.bowerrc',
                        'lib/**',
                        'public/images/**',
                        'public/templates/**',
                        'public/readme.txt',
                        'favicon.ico',
                        'build.js',

                        //Exclude unfinished themes
                        '!addons/hpe/themes/hp/**',
                        '!addons/hpe/themes/slate/**',
                        '!addons/hpe/themes/united/**'
                    ]
                }, {
                    //No JS/CSS/HTML under server
                    cwd: '<%= yeoman.app %>/../',
                    dest: '<%= yeoman.dist %>/core',
                    expand: true,
                    dot: true,
                    src: [
                        'server/**',
                        '!server/**/*.{js,html,css}',

                        //Exclude public dirs
                        '!server/public/**',

                        //Exclude addons
                        '!server/addons/**'
                    ]
                }, {
                    //Misc files under server
                    cwd: '<%= yeoman.app %>/../',
                    dest: '<%= yeoman.dist %>/core',
                    expand: true,
                    src: [
                        //Delivered plugins
                        'server/addons/plugins/ossa/**',
                        'server/addons/plugins/plugin_simulator/**',
                        'server/addons/plugins/plugin_sample/**',

                        //Global plugins files
                        'server/addons/plugins/routes.js',
                        'server/addons/plugins/constants.js',

                        //Public files with no kitting version
                        'server/public/addons/plugins/plugin_simulator/packages/**',

                        'server/public/licenses/**',
                        'server/public/ssl/**',
                        'server/public/readme.txt',

                        //Ignore .gitkeep
                        '!server/public/ssl/.gitkeep',

                        //Modules
                        'server/addons/modules/**'
                    ]
                }, {
                    //No JS/CSS/HTML under root
                    cwd: '<%= yeoman.app %>/../',
                    dest: '<%= yeoman.dist %>/core',
                    expand: true,
                    src: [
                        'install/**',
                        '!install/**/*.{js,html,css}'
                    ]
                }, {
                    //Misc files under root
                    cwd: '<%= yeoman.app %>/../',
                    dest: '<%= yeoman.dist %>/core',
                    expand: true,
                    src: [
                        'LICENSE.txt',
                        'bower.json',
                        '.bowerrc',
                        'package.json',
                        'README.md'
                    ]
                }, {
                    //Developpement files
                    cwd: '<%= yeoman.app %>/../sdk',
                    dest: '<%= yeoman.dist %>',
                    expand: true,
                    dot: true,
                    src: [
                        '**'
                    ]
                }, {
                    //Data files
                    cwd: '<%= yeoman.app %>/../data',
                    dest: '<%= yeoman.dist %>/core/data',
                    expand: true,
                    src: [
                        '**/*.kitting',
                        '**/*.sdk',
                        'states/*'
                    ],
                    ext: '.json'
                }, {
                    //Server configuration files with kitting version
                    cwd: '<%= yeoman.app %>/../',
                    dest: '<%= yeoman.dist %>/core',
                    expand: true,
                    src: [
                        'server/public/addons/plugins/ossa/config.json.sdk',
                        'server/public/addons/plugins/plugin_simulator/config.json.sdk',
                        'server/public/addons/plugins/plugin_sample/config.json.kitting',

                        'server/public/conf/config.json.sdk',
                        'server/public/conf/log4js.json.kitting',
                        'server/public/conf/user-preferences.json.kitting'
                    ],
                    ext: '.json'
                }, {
                    //Client files with kitting version
                    cwd: '<%= yeoman.app %>/../',
                    dest: '<%= yeoman.dist %>/core',
                    expand: true,
                    src: [
                        'client/views/index.html.sdk'
                    ],
                    ext: '.html'
                }]
            },

            //Copy all test/misc files to the instrumentation folder
            instrument: {
                files: [{
                    cwd: '<%= yeoman.app %>/../server',
                    dest: '<%= yeoman.instrument %>/server',
                    expand: true,
                    src: [
                        '**',
                        '!**/*.js',
                    ]
                }, {
                    cwd: '<%= yeoman.app %>/../server',
                    dest: '<%= yeoman.instrument %>/server',
                    expand: true,
                    src: [
                        '**/*-test.js',
                        '!**/node_modules/**/*-test.js'
                    ]
                }]
            },

            //Copy developpement files
            sdk_lite: {
                files: [{
                    //Developpement files
                    cwd: '<%= yeoman.app %>/../sdk',
                    dest: '<%= yeoman.dist %>',
                    expand: true,
                    dot: true,
                    src: [
                        '**'
                    ]
                }]
            }
        },

        //Set process.env vars
        env: {
            coverage: {
                PROTOCOL: nconf.get('server:protocol') || 'http',
                PORT: nconf.get('server:port') || 3000,
                NODE_ENV: 'production',
                AUTH_MODE: nconf.get('authentication:mode') || 'local',
                ROOT: path.normalize(__dirname) + '/<%= yeoman.instrument %>'
            },

            test: {
                PROTOCOL: nconf.get('server:protocol') || 'http',
                PORT: nconf.get('server:port') || 3000,
                NODE_ENV: 'production',
                AUTH_MODE: nconf.get('authentication:mode') || 'local',
                ROOT: path.normalize(__dirname)
            }
        },

        //Run Express server
        express: {
            options: {
                port: process.env.PORT || 9000
            },

            dev: {
                options: {
                    script: 'server.js',
                    node_env: 'development',
                    debug: true
                }
            },

            prod: {
                options: {
                    script: 'server.js',
                    node_env: 'production'
                }
            }
        },

        //Open a browser window
        open: {
            server: {
                url: 'http://localhost:<%= express.options.port %>'
            }
        },

        //Run predefined tasks whenever watched file patterns are added, changed or deleted
        watch: {
            livereload: {
                files: [
                    '<%= yeoman.app %>/**/*.{js,json,html,css}',
                    '!<%= yeoman.app %>/bower_components/**',
                    '!<%= yeoman.app %>/addons/bower_components/**'
                ],
                tasks: ['newer:jshint:client', 'newer:csslint:client'],
                options: {
                    livereload: true,
                    interval: 5000
                }
            },

            express: {
                files: [
                    'server.js',
                    './server/**/*.{js,json}',
                    './data/**/*.json'
                ],
                tasks: ['newer:jshint:server', 'express:dev', 'wait'],
                options: {
                    livereload: true,
                    nospawn: true //Without this option specified express won't be reloaded
                }
            },

            sass: {
                files: [
                    '<%= yeoman.app %>/components/**/*.scss'
                ],
                tasks: ['sass:generate'],
                options: {
                    livereload: true //,
                        // interval: 5000
                }
            }
        },

        //Data passed into config. Can use with <&= yeoman.xxx %>
        yeoman: {
            app: 'client',
            dist: 'dist',
            server: 'server',
            tmp: '.tmp',
            report: 'reports',
            instrument: '.instrument',
            doc: 'doc'
        },

        //Documentation generation
        yuidoc: {
            all: {
                name: 'Web GUI Framework Documentation',
                description: 'Documentation of the different SDK components of the Web GUI Framework',
                version: '1.0.0',
                options: {
                    outdir: '<%= yeoman.doc %>',
                    paths: [
                        //REST APIs
                        '<%= yeoman.server %>/services',
                        '<%= yeoman.server %>/addons/plugins',

                        //Client components
                        '<%= yeoman.app %>/addons',
                        '<%= yeoman.app %>/commons',
                        '<%= yeoman.app %>/components',
                    ],
                    exclude: 'bower_components'
                }
            }
        },

        //
        //Debug
        //

        // Use nodemon to run server in debug mode with an initial breakpoint
        nodemon: {
            debug: {
                script: 'server.js',
                options: {
                    nodeArgs: ['--debug-brk'],
                    env: {
                        PORT: process.env.PORT || 9000
                    },
                    callback: function(nodemon) {
                        nodemon.on('log', function(event) {
                            console.log(event.colour);
                        });

                        // opens browser on initial server start
                        nodemon.on('config:update', function() {
                            setTimeout(function() {
                                require('open')('http://localhost:8080/debug?port=5858');
                            }, 500);
                        });
                    }
                }
            }
        },

        //
        //Linting tasks
        //

        // JS Linting
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                force: true
            },

            server: {
                options: {
                    reporter: require('jshint-stylish')
                },
                src: ALL_SERVER_JS
            },

            client: {
                options: {
                    reporter: require('jshint-stylish')
                },
                src: ALL_CLIENT_JS.concat([
                    '!<%= yeoman.app %>/components/language-config/locales/*'
                ])
            },

            CI: {
                options: {
                    reporter: 'checkstyle',
                    reporterOutput: '<%= yeoman.report %>/lint/js/checkstyle-results.xml'
                },
                src: ALL_CLIENT_JS.concat(ALL_SERVER_JS).concat([
                    '!<%= yeoman.app %>/components/language-config/locales/*'
                ])
            }
        },

        // CSS Linting
        csslint: {
            options: {
                csslintrc: '.csslintrc'
            },

            client: {
                src: ALL_CSS
            },

            CI: {
                options: {
                    formatters: [{
                        id: 'checkstyle-xml',
                        dest: '<%= yeoman.report %>/lint/css/checkstyle-results.xml'
                    }]
                },
                src: ALL_CSS
            }
        },

        //
        //Preprocessing tasks
        //

        // Allow the use of non-minsafe AngularJS files. Automatically makes it
        // minsafe compatible so Uglify does not destroy the ng references
        ngAnnotate: {
            tmp: {
                files: [{
                    cwd: '<%= yeoman.tmp %>/client',
                    dest: '<%= yeoman.tmp %>/client',
                    expand: true,
                    src: [
                        '**/*.js'
                    ]
                }]
            }
        },

        // Add vendor prefixed styles
        autoprefixer: {
            options: {
                browsers: ['ie >= 10', 'firefox >= 20', 'chrome >= 20']
            },

            tmp: {
                files: [{
                    cwd: '<%= yeoman.tmp %>',
                    dest: '<%= yeoman.tmp %>',
                    expand: true,
                    src: [
                        '**/*.css'
                    ]
                }]
            },

            sass: {
                files: [{
                    cwd: '<%= yeoman.app %>/sass-tmp',
                    dest: '<%= yeoman.app %>/components',
                    expand: true,
                    src: [
                        '**/*.css'
                    ]
                }]
            }
        },

        //
        //Minification tasks
        //

        //JS Minification
        uglify: {
            options: {
                mangle: true,
                compress: {
                    drop_console: true
                },
                preserveComments: false
            },
            tmp: {
                files: [{
                    cwd: '<%= yeoman.tmp %>',
                    dest: '<%= yeoman.tmp %>',
                    expand: true,
                    src: [
                        '**/*.js'
                    ]
                }]
            }
        },

        //HTML Minification
        htmlmin: {
            tmp: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true,
                    conservativeCollapse: true
                },
                files: [{
                    cwd: '<%= yeoman.tmp %>',
                    dest: '<%= yeoman.tmp %>',
                    expand: true,
                    src: [
                        '**/*.html'
                    ]
                }]
            }
        },

        //CSS Minification
        cssmin: {
            tmp: {
                cwd: '<%= yeoman.tmp %>',
                dest: '<%= yeoman.tmp %>',
                expand: true,
                src: [
                    '**/*.css'
                ]
            }
        },

        //
        //Test tasks
        //

        karma: {
            client: {
                configFile: 'karma.conf.js',
                reporters: ['spec', 'coverage'] // test results reporter to use. available reporters: https://npmjs.org/browse/keyword/karma-reporter
            },
            CI: {
                configFile: 'karma.conf.js',
                reporters: ['tap', 'coverage']
            }
        },

        mochaTest: {
            server: {
                options: {
                    reporter: 'spec'
                },
                src: ['server/**/*-test.js',
                    '!server/addons/**/node_modules/**/*-test.js'
                ]
            },

            CI: {
                options: {
                    reporter: 'tap',
                    quiet: true,
                    captureFile: '<%= yeoman.report %>/test/unit/server/results.tap'
                },
                src: ['<%= yeoman.instrument %>/**/*-test.js']
            }
        },

        //
        //Coverage
        //

        instrument: {
            files: [
                '<%= yeoman.app %>/../server/**/*.js',
                '!<%= yeoman.app %>/../server/**/*-test.js',
            ],
            options: {
                lazy: true,
                basePath: '<%= yeoman.instrument %>'
            }
        },

        storeCoverage: {
            options: {
                dir: '<%= yeoman.report %>/test/coverage/server'
            }
        },

        makeReport: {
            src: '<%= yeoman.report %>/test/coverage/server/coverage.json',
            options: {
                type: 'cobertura',
                dir: '<%= yeoman.report %>/test/coverage/server',
                print: 'detail'
            }
        },

        //
        //Kitting
        //

        shell: {
            installDeps: {
                command: [
                    'cd <%= yeoman.dist %>',
                    'npm install --production',
                    'bower install --production',
                    'cd client/addons/',
                    'bower install --production',
                    'cd ..',
                    'cp ../../client/build.js .',
                    'node ../../node_modules/requirejs/bin/r.js -o build.js',
                    'rm build.js'
                ].join('&&')
            },

            install: {
                command: [
                    'npm install',
                    'bower install',
                    'cd client/addons/',
                    'bower install',
                    'cd training',
                    'bower install'
                ].join('&&')
            },

            //Install production dependencies into core and delete packages.json/bower.json/.bowerrc
            sdk: {
                command: [
                    'cd <%= yeoman.dist %>',
                    'npm install',
                    'bower install',
                    'cd core',
                    'npm install --production',
                    'npm install requirejs@2.1.20',
                    'bower install --production',
                    'cd client/addons',
                    'bower install --production',
                    'cd ..',
                    'node ../../node_modules/requirejs/bin/r.js -o build.js',
                ].join('&&')
            }
        },

        compress: {
            sdk: {
                options: {
                    archive: 'dist/UOCV' + packageJson.version + (grunt.option('subversion') ? '-' + grunt.option('subversion') : '') + '-SDK.zip'
                },
                files: [{
                    cwd: 'dist/',
                    src: ['**'],
                    expand: true,
                    dot: true
                }]
            },
            sdk_lite: {
                options: {
                    archive: 'dist/UOCV' + packageJson.version + (grunt.option('subversion') ? '-' + grunt.option('subversion') : '') + '-SDK_LITE.zip'
                },
                files: [{
                    cwd: 'dist/',
                    src: ['**'],
                    expand: true
                }]
            }
        },

        //
        //Misc
        //

        sass: {
            options: {
                sourceMap: false
            },
            dist: {
                // files: {
                //     'flavienbossiaux.css': '<%= yeoman.app %>/components/view-designer/view-designer/*.scss'
                // }
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/components',
                    src: ['**/*.scss'],
                    // dest: '<%= yeoman.app %>/components',
                    dest: '<%= yeoman.app %>/sass-tmp',
                    rename: function(dest, src) {
                        var result;
                        // src.split('/sass/');
                        var srcSplit = src.split('/sass/');
                        if (Array.isArray(srcSplit) && srcSplit.length === 2) {
                            result = path.join(dest, srcSplit[0], srcSplit[1]);
                        } else {
                            result = path.join(dest, src);
                        }
                        console.log(result);
                        return result;
                    },
                    ext: '.css'
                }]
            }
        }
    });

    grunt.registerTask('sass:generate', function() {
        grunt.task.run(['sass', 'autoprefixer:sass', 'clean:sass-tmp']);
    });

    //Init nconf for tests
    grunt.registerTask('initNconf', function() {
        nconf.argv().env().file({
            file: './server/public/conf/config.json'
        });
    });


    grunt.registerTask('express-keepalive', 'Keep grunt running', function() {
        this.async();
    });

    grunt.registerTask('serve', 'Start Unified OSS Console in development mode (livereload)', function(target) {
        if (!target) {
            grunt.task.run(['express:dev', 'open', 'watch']);
        } else if (target === 'prod') {
            grunt.task.run(['express:prod', 'open', 'express-keepalive']);
        } else if (target === 'debug') {
            grunt.task.run(['concurrent:debug']);
        }
    });

    grunt.registerTask('mkdir', function(target) {
        if (target === 'build') {
            grunt.file.mkdir('dist/logs');
            grunt.file.mkdir('dist/client/l10n');
            grunt.file.mkdir('dist/data/views');
            grunt.file.mkdir('dist/data/workspaces');
        } else if (target === 'report') {
            grunt.file.mkdir('reports/lint/js');
            grunt.file.mkdir('reports/lint/css');
            grunt.file.mkdir('reports/test/unit/client');
            grunt.file.mkdir('reports/test/unit/server');
            grunt.file.mkdir('reports/test/coverage/client');
            grunt.file.mkdir('reports/test/coverage/server');
        } else if (target === 'sdk') {
            grunt.file.mkdir('dist/core/client/public/maps');
            grunt.file.mkdir('dist/core/logs');
            grunt.file.mkdir('dist/core/client/l10n');
            grunt.file.mkdir('dist/core/data/views');
            grunt.file.mkdir('dist/core/data/workspaces');

            grunt.file.mkdir('dist/client/addons/');
            grunt.file.mkdir('dist/server/addons/plugins/');
            grunt.file.mkdir('dist/server/addons/modules/');
            grunt.file.mkdir('dist/server/public/addons/plugins/');

            grunt.file.mkdir('dist/client/public/images/addons');
            grunt.file.mkdir('dist/client/public/images/languages');
            grunt.file.mkdir('dist/client/public/images/launch-keywords');
            grunt.file.mkdir('dist/client/public/images/layouts');
            grunt.file.mkdir('dist/client/public/images/menu-bars');
            grunt.file.mkdir('dist/client/public/images/menu-items');
            grunt.file.mkdir('dist/client/public/images/modules');
            grunt.file.mkdir('dist/client/public/images/packages');
            grunt.file.mkdir('dist/client/public/images/themes');
            grunt.file.mkdir('dist/client/public/images/widgets');
            grunt.file.mkdir('dist/client/public/images/workspaces');
            grunt.file.mkdir('dist/client/public/maps');

            grunt.file.mkdir('dist/data/categories');
            grunt.file.mkdir('dist/data/launch-categories');
            grunt.file.mkdir('dist/data/launches');
            grunt.file.mkdir('dist/data/permissions');
            grunt.file.mkdir('dist/data/roles');
            grunt.file.mkdir('dist/data/states');
            grunt.file.mkdir('dist/data/users');
            grunt.file.mkdir('dist/data/views');
            grunt.file.mkdir('dist/data/workspaces');

            grunt.file.mkdir('dist/logs');

        } else if (target === 'sdk_lite') {
            grunt.file.mkdir('dist/core/client/l10n');

            grunt.file.mkdir('dist/client/addons/');
            grunt.file.mkdir('dist/server/addons/plugins/');
            grunt.file.mkdir('dist/server/addons/modules/');
            grunt.file.mkdir('dist/server/public/addons/plugins/');

            grunt.file.mkdir('dist/client/public/images/addons');
            grunt.file.mkdir('dist/client/public/images/languages');
            grunt.file.mkdir('dist/client/public/images/launch-keywords');
            grunt.file.mkdir('dist/client/public/images/layouts');
            grunt.file.mkdir('dist/client/public/images/menu-bars');
            grunt.file.mkdir('dist/client/public/images/menu-items');
            grunt.file.mkdir('dist/client/public/images/modules');
            grunt.file.mkdir('dist/client/public/images/packages');
            grunt.file.mkdir('dist/client/public/images/themes');
            grunt.file.mkdir('dist/client/public/images/widgets');
            grunt.file.mkdir('dist/client/public/images/workspaces');

            grunt.file.mkdir('dist/data/categories');
            grunt.file.mkdir('dist/data/launch-categories');
            grunt.file.mkdir('dist/data/launches');
            grunt.file.mkdir('dist/data/permissions');
            grunt.file.mkdir('dist/data/roles');
            grunt.file.mkdir('dist/data/states');
            grunt.file.mkdir('dist/data/users');
            grunt.file.mkdir('dist/data/views');
            grunt.file.mkdir('dist/data/workspaces');

            grunt.file.mkdir('dist/logs');
        }
    });

    grunt.registerTask('test', 'Execute all automatic unit tests. Client (test:client) or server (test:server)', function(target) {
        if (target === 'server') {
            return grunt.task.run(['initNconf', 'env:test', 'mochaTest:server']);
        } else if (target === 'client') {
            return grunt.task.run(['karma:client']);
        } else if (target === 'CI') {
            return grunt.task.run([
                'initNconf',
                'env:coverage',
                'clean:instrument',
                'clean:report',
                'mkdir:report',
                'jshint:CI',
                'enableForce',
                'csslint:CI',
                'disableForce',
                'copy:instrument',
                'instrument',
                'mochaTest:CI',
                'storeCoverage',
                'makeReport',
                'karma:CI'
            ]);
        } else if (!target) {
            return grunt.task.run(['env:test', 'mochaTest:server', 'karma:client']);
        }
    });

    grunt.registerTask('build', 'Build runtime kit (build:kit) or the sdk kit (build:sdk)', function(target) {
        if (target === 'sdk') {
            if (grunt.option('lite')) {
                grunt.task.run(['clean:dist', 'copy:sdk_lite', 'mkdir:sdk_lite', 'clean:sdk' /*, 'compress:sdk_lite'*/ ]);
            } else {
                grunt.task.run(['clean:tmp', 'clean:dist', 'copy:tmp_sdk', 'concurrent:premin', 'concurrent:min', 'copy:dist_sdk', 'mkdir:sdk', 'shell:sdk', 'clean:sdk' /*, 'compress:sdk'*/ ]);
            }
        } else if (target === 'kit') {
            grunt.task.run(['clean:tmp', 'clean:dist', 'cp:tmp_kit', 'concurrent:premin', 'concurrent:min', 'cp:dist_kit', 'mkdir:build', 'shell:installDeps', 'clean:kit']);
        }
    });

    //Install dependencies
    grunt.registerTask('install', 'Install all modules dependencies (npm install, bower install...) required to execute the project', function() {
        grunt.task.run(['shell:install']);
    });

    // Used for delaying livereload until after server has restarted
    grunt.registerTask('wait', function() {
        grunt.log.ok('Waiting for server reload...');

        var done = this.async();

        setTimeout(function() {
            grunt.log.writeln('Done waiting!');
            done();
        }, 500);
    });

    //Enable force mode
    grunt.registerTask('enableForce', function() {
        grunt.option('force', true);
    });

    //Disable force mode
    grunt.registerTask('disableForce', function() {
        grunt.option('force', false);
    });


    ////////////////////
    // DATABASE TASKS //
    ////////////////////

    grunt.registerTask('db:init', 'if no parameter, creates admin user of CouchDB server, all databases and their associated design. If dbname specified, init only this database (empty + _design)', function(dbName) {
        if (dbName) {
            require('./tasks/db-create.js')(grunt, nano, this.async(), dbName);
        } else {
            require('./tasks/db-init.js')(grunt, nano, this.async());
        }
    });

    grunt.registerTask('db:populate', 'Populate all documents in the CouchDB database (categories, permissions, roles, users, views, workspaces, launches, launch categories...)', function(dbName) {
        if (dbName) {
            require('./tasks/db-populate.js')(grunt, nano, this.async(), dbName);
        } else {
            grunt.task.run([
                'db:populate:categories',
                'db:populate:permissions',
                'db:populate:roles',
                'db:populate:users',
                'db:populate:views',
                'db:populate:workspaces',
                'db:populate:launches',
                'db:populate:launch-categories'
            ]);
        }
    });

    grunt.registerTask('db:clear', 'Deletes all documents (except design documents) of the specified database', function(dbName) {
        if (dbName) {
            require('./tasks/db-clear.js')(grunt, nano, this.async(), dbName);
        } else {
            grunt.task.run([
                'db:clear:categories',
                'db:clear:permissions',
                'db:clear:roles',
                'db:clear:users',
                'db:clear:views',
                'db:clear:workspaces',
                'db:clear:launches',
                'db:clear:launch-categories'
            ]);
        }
    });

    grunt.registerTask('db:compact', 'Compacts CouchDB Databases and their views (it removes all documents that are no more used, were deleted, ...)', function(dbName) {
        if (dbName) {
            require('./tasks/db-compact.js')(grunt, nano, this.async(), dbName);
        } else {
            grunt.task.run([
                'db:compact:categories',
                'db:compact:permissions',
                'db:compact:roles',
                'db:compact:users',
                'db:compact:views',
                'db:compact:workspaces',
                'db:compact:launches',
                'db:compact:launch-categories'
            ]);
        }
    });

    grunt.registerTask('db:update', 'If no parameter, updates the design documents of all databases else the one of the specified database', function(dbName) {
        if (dbName) {
            require('./tasks/db-update.js')(grunt, nano, this.async(), dbName);
        } else {
            grunt.task.run([
                'db:update:categories',
                'db:update:permissions',
                'db:update:roles',
                'db:update:users',
                'db:update:views',
                'db:update:workspaces',
                'db:update:launches',
                'db:update:launch-categories'
            ]);
        }
    });


    //////////////////////
    // GENERATION TASKS //
    //////////////////////

    grunt.registerTask('generate', 'Prompts user needs and generates a component', function(generatorId) {
        if (generatorId) {
            var generatorsConfig;
            try {
                generatorsConfig = require('./server/public/conf/generators.json');
            } catch(e) {}
            
            if(!generatorsConfig) {
                grunt.log.writeln("\nYou do not have any generators configuration yet. Please answer questions below to create it:");
                require('./generators/generators.js').generateNoDeps('generators-config', this.async());
            } else {
                require('./generators/generators.js').generate(generatorId, this.async());
            }
        } else {
            grunt.log.writeln("\nAvailable commands:");
            require('./generators/generators.js').getDescriptors().forEach(function(descriptor) {
                grunt.log.writeln(' > grunt generate:' + descriptor.id + ' - ' + descriptor.description);
            });
        }
    });

};
