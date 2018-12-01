'use strict';

angular.module('myApp.version', [
  'myApp.version.interpolate-filter',
  'myApp.version.version-directive',
    'myApp.version.ck-editor'
])

.value('version', '0.1');
