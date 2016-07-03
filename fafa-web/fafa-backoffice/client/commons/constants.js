/**
 * Constants used by Unified OSS Console
 */
define([],
function() {
    'use strict';
    return {
    	// Constants used by the REST API or to call the REST API (like version, batchsize, ...)
    	AGGREGATION: true,
    	BATCHSIZE: 100000,
    	OFFSET: 0,        
        // Defaults user preferences
        DEFAULT_TITLE:'Fafa back-office',
        DEFAULT_VERSION:'0.1',
        DEFAULT_LINK:'/',
        DEFAULT_THEME:'hpe',
        DEFAULT_LANGUAGE:'zh-cn',
        DEFAULT_MENU_BAR:'hpe-menu-bar',
        DEFAULT_SHOW_WORKSPACE_MANAGER_FLAG: true,
        DEFAULT_SHOW_MENU_BAR_FLAG: true,
        DEFAULT_INITIAL_WORKSPACE: null
    };
});
