require.config({
    waitSeconds: 0, // Timeout explicitly disabled to ensure we do not get require.js timeout errors.
    paths: {
        angular: '../bower_components/angular/angular.min',
        angularRoute: '../bower_components/angular-route/angular-route.min',
        angularResource: '../bower_components/angular-resource/angular-resource.min',
        angularCookies: '../bower_components/angular-cookies/angular-cookies.min',
        angularSanitize: '../bower_components/angular-sanitize/angular-sanitize.min',
        angularBootstrap: '../bower_components/angular-bootstrap/ui-bootstrap-tpls.min',
        d3: '../bower_components/d3/d3',
        jquery: '../bower_components/jquery/dist/jquery.min',
        jqueryui: '../bower_components/jquery-ui/jquery-ui.min',
        jqueryKnob: '../bower_components/jquery-knob/dist/jquery.knob.min',
        bootstrap: '../bower_components/bootstrap/dist/js/bootstrap.min',
        angularTranslate: '../bower_components/angular-translate/angular-translate.min',
        angularTranslatePartialLoader: '../bower_components/angular-translate-loader-partial/angular-translate-loader-partial.min',
        angularDynamicLocale: '../bower_components/angular-dynamic-locale/src/tmhDynamicLocale',
        angularCache: '../bower_components/angular-cache/dist/angular-cache.min',
        'require-css': '../bower_components/require-css',

        //Slider view
        jasny: '../bower_components/jasny-bootstrap/dist/js/jasny-bootstrap.min',

        // highmaps lat/long. convert to 2d libraries
        proj4: '../bower_components/proj4/dist/proj4',
        //logger
        logDecorator: '../logger/log-decorator',

        // leaflet and ng-leaflet
        leaflet: '../bower_components/leaflet/dist/leaflet',
        leafletNg: '../bower_components/angular-leaflet-directive/dist/angular-leaflet-directive',
        leafletMarkercluster: '../bower_components/leaflet.markercluster/dist/leaflet.markercluster',
        //leafletPluginsGoogleTiles: '../addons/bower_components/leaflet-plugins/layer/tile/Google',
        leafletPluginsBingTiles: '../bower_components/leaflet-plugins/layer/tile/Bing',
        // googleMap: '../addons/bower_components/angular-google-maps/dist/angular-google-maps',
        async: '../bower_components/requirejs-plugins/src/async',

        // Add sub dependencies for widget galery (which is automatically loaded as present in the widgets dir)
        highchartsNg: '../bower_components/highcharts-ng/dist/highcharts-ng',
        highcharts: '../bower_components/highcharts-release/highcharts',
        highchartsMore: '../bower_components/highcharts-release/highcharts-more',
        highcharts3d: '../bower_components/highcharts-release/highcharts-3d',

        highchartsBrokenAxis: '../bower_components/highcharts-release/modules/broken-axis',
        highchartsData: '../bower_components/highcharts-release/modules/data',
        highchartsDrilldown: '../bower_components/highcharts-release/modules/drilldown',
        highchartsExporting: '../bower_components/highcharts-release/modules/exporting',
        highchartsFunnel: '../bower_components/highcharts-release/modules/funnel',
        highchartsHeatmap: '../bower_components/highcharts-release/modules/heatmap',
        highchartsNoDataToDisplay: '../bower_components/highcharts-release/modules/no-data-to-display',
        highchartsSolidGauge: '../bower_components/highcharts-release/modules/solid-gauge',
        highchartsTreeMap: '..//bower_components/highcharts-release/modules/treemap',
        highchartsExportCsv: '../lib/export-csv-master/export-csv',

        nggrid: '../bower_components/ng-grid/build/ng-grid.debug',
        components: '../components',
        commons: '../commons',

        highmaps: '../bower_components/highmaps-release/modules/map',
        checklistModel: '../bower_components/checklist-model/checklist-model',
        lodash: '../bower_components/lodash/lodash.min',
        lodashDeep: '../bower_components/lodash-deep/lodash-deep.min',
        lodashplus: '../lib/lodashplus/lodashplus',
        dragevent: '../bower_components/slickgrid/lib/jquery.event.drag-2.2',
        dropevent: '../bower_components/slickgrid/lib/jquery.event.drop-2.2',
        slickcore: '../bower_components/slickgrid/slick.core',
        // slickgrid: '../addons/bower_components/slickgrid/slick.grid',    //"Vanilla" slickgrid
        slickgrid: '../lib/slickgrid/slick.grid', //"Fixed" slickgrid version for reports
        slickgridgroupitem: '../bower_components/slickgrid/slick.groupitemmetadataprovider',
        slickgriddataview: '../bower_components/slickgrid/slick.dataview',
        slickautotooltips: '../bower_components/slickgrid/plugins/slick.autotooltips',

        angularUiGrid: '../bower_components/angular-ui-grid/ui-grid',

        // FSM library
        JSStateMachine: '../bower_components/javascript-state-machine/state-machine.min',

        // Angular schema & dependencies
        tv4: '../bower_components/tv4/tv4',
        ObjectPath: '../bower_components/objectpath/lib/ObjectPath',
        schemaForm: '../bower_components/angular-schema-form/dist/schema-form',
        bootstrapDecorator: '../bower_components/angular-schema-form/dist/bootstrap-decorator.min',
        FileSaver: '../lib/FileSaver/FileSaver.min',

        // Code editor
        ace: '../bower_components/ace-builds/src-min-noconflict/ace',
        'angular-ui-ace': '../bower_components/angular-ui-ace/ui-ace.min',

        //Idle time detection
        ngIdle: '../bower_components/ng-idle/angular-idle.min',

        summernote: '../bower_components/summernote/dist/summernote.min',
        summernoteFR: '../bower_components/summernote/dist/lang/summernote-fr-FR.min'

    },

    shim: {
        //With Exports
        angular: {
            exports: 'angular'
        },
        lodash: {
            exports: '_'
        },
        d3: {
            exports: 'd3'
        },
        jquery: {
            exports: 'jquery',
            deps: ['angular']
        },
        highcharts: {
            deps: ['jquery'],
            exports: 'Highcharts'
        },
        slickgrid: {
            deps: ['slickcore', 'dragevent', 'dropevent'],
            exports: 'Slick'
        },
        jqueryKnob: ['jquery'],

        leaflet: {
            exports: 'leaflet'
        },
        leafletMarkercluster: [
            'leaflet'
        ],
        leafletPluginsBingTiles: [
            'leaflet'
        ],
        leafletNg: [
            'angular',
            'leaflet',
            'leafletMarkercluster',
            'leafletPluginsBingTiles'
        ],


        //No exports
        angularBootstrap: ['angular'],
        angularCache: ['angular'],
        angularCookies: ['angular'],
        angularDynamicLocale: ['angular'],
        angularLocalStorage: ['angular'],
        angularRoute: ['angular'],
        angularResource: ['angular'],
        angularSanitize: ['angular'],
        angularTranslate: ['angular'],
        angularTranslatePartialLoader: ['angularTranslate'],
        angularUiGrid: ['angular'],
        bootstrap: ['jquery', 'jqueryui'],                          // ajout de la dependance a checker
        checklistModel: ['angular'],
        'angular-ui-ace': ['angular'],
        bootstrapDecorator: ['schemaForm'],
        dragevent: ['jquery'],
        dropevent: ['jquery'],
        highchartsNg: [
            'angular',
            'proj4',
            'highchartsMore',
            'highcharts3d',
            'highchartsBrokenAxis',
            'highchartsData',
            'highchartsDrilldown',
            'highchartsExporting',
            'highchartsFunnel',
            'highchartsHeatmap',
            'highchartsNoDataToDisplay',
            'highchartsSolidGauge',
            'highchartsTreeMap',
            'highchartsExportCsv',
            'highmaps'
        ],
        highchartsMore: ['highcharts'],
        highcharts3d: ['highcharts'],
        highchartsBrokenAxis: ['highcharts'],
        highchartsCanvasTools: ['highcharts'],
        highchartsData: ['highcharts'],
        highchartsDrilldown: ['highcharts'],
        highchartsExporting: ['highcharts'],
        highchartsFunnel: ['highcharts'],
        highchartsHeatmap: ['highcharts'],
        highchartsNoDataToDisplay: ['highcharts'],
        highchartsSolidGauge: ['highcharts'],
        highchartsTreeMap: ['highcharts'],
        highchartsExportCsv: ['highcharts'],
        highmaps: ['highcharts', 'jqueryui'],
        jqueryui: ['jquery'],
        lodashDeep: ['lodash'],
        nggrid: ['angular', 'jqueryui'],
        schemaForm: ['angularTranslate', 'tv4', 'ObjectPath'],
        slickcore: ['jqueryui'],
        slickgridgroupitem: ['slickgrid'],
        slickgriddataview: ['slickgrid'],
        slickautotooltips: ['slickgrid'],
        ngIdle: ['angular'],
        jasny: {
            deps: ['jquery']
        },

        summernote: ['jquery', 'bootstrap'],
        summernoteFR: ['summernote']

    },
    map: {
        '*': {
            'css': 'require-css/css' // or whatever the path to require-css is
        }
    }
});

require(['app', 'angular'], function(app, angular) {
    'use strict';
    angular.element().ready(function() {
        console.log("main.js");
        angular.bootstrap(document, [app.name]);
    });
});
