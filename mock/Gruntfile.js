'use strict';
 
var path = require('path')
  , mockApi = require('swagger-mock-api');
 
module.exports = function(grunt) {
  grunt.initConfig({
    connect: {
      server: {
        options: {
          keepalive: true,
          middleware: [
            mockApi({
                  swaggerFile: path.join(__dirname, 'mudamos-mobile-api.yaml'),
                  watch: true // enable reloading the routes and schemas when the swagger file changes 
              })
          ],
        },
      },
    },
  });
 
  grunt.loadNpmTasks('grunt-contrib-connect');
 
  grunt.registerTask('default', ['connect']);
};
