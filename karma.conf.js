// Karma configuration
// Generated on Tue Jun 03 2014 11:24:37 GMT+0100 (GMT Daylight Time)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

      
    // list of files / patterns to load in the browser
    files: [
      'source/Scripts/jquery-2.1.1.js',
      'source/Scripts/underscore.js',
      'source/Scripts/angular.js',
      'source/Scripts/angular-route.js',
      'source/Scripts/angular-touch.js',
      'source/Scripts/angular-mocks.js',
      'source/Scripts/spiro.config.js',
      'source/Scripts/spiro.models.helpers.js',
      'source/Scripts/spiro.models.shims.js',
      'source/Scripts/spiro.models.js',
      'source/Scripts/spiro.modern.viewmodels.js',
      'source/Scripts/spiro.modern.app.js',
      'source/Scripts/spiro.angular.services.color.js',
      'source/Scripts/spiro.angular.services.mask.js',
      'source/Scripts/spiro.angular.services.representationloader.js',
      'source/Scripts/spiro.modern.controllers.js',
      'source/Scripts/spiro.modern.directives.js',
      'source/Scripts/spiro.modern.services.representationhandlers.js',
      'source/Scripts/spiro.modern.services.viewmodelfactory.js',
      'source/Scripts/spiro.modern.services.urlhelper.js',
      'source/Scripts/spiro.modern.services.context.js',
      'source/Scripts/spiro.modern.services.handlers.js',
      'source/Scripts/spiro.modern.services.navigation.browser.js',
      'source/Tests/specs/helpers.js',
      'source/Tests/specs/controllers.js',
      'source/Tests/specs/contextService.js',
      'source/Tests/specs/handlersService.js',
      'source/Tests/specs/viewModelFactoryService.js'
    ],


    // list of files to exclude
    exclude: [
      
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        'Scripts/spiro.angular*.*.js': 'coverage'
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'junit', 'coverage'],

    
    junitReporter : {
        outputFile: 'test-results/karma-test-results.xml'
    },
    
    coverageReporter : {
        type: 'cobertura',
        dir: 'coverage'
    },

    // web server port
    port: 9876,

      // cli runner port
    runnerPort : 9100,

    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    captureTimeout : 60000,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['IE'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  });
};
