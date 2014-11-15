'use strict';

module.exports = function (grunt) {

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    concat: {
      options: {
        // define a string to put between each file in the concatenated output
        separator: ';'
      },
      dist: {
        // the files to concatenate
        src: ['src/**/module.js', 'src/**/*.js'],
        // the location of the resulting JS file
        dest: 'dist/angular-validation-messages.js'
      }
    },
    clean: ['dist'],
    uglify: {
      'dist/angular-validation-messages.min.js':'dist/angular-validation-messages.js'
    },
    jshint: {
      options: {
        jshintrc: true
      },
      all: [
        'Gruntfile.js',
        'src/**/*.js',
        'test/**/*.js',
        '!test/lib/**/*.js'
      ]
    },
    watch: {
      options: {
        livereload: 30000
      },
      scripts: {
        files: ['src/**/*.js', 'Gruntfile.js'],
        tasks: ['package', 'karma']
      },
      test: {
        files: ['test/**/*.js'],
        tasks: ['karma']
      },
      html: {
        files: ['demo/**/*.html'],
        tasks: ['package']
      },
      styles: {
        files: ['src/**/*.css'],
        tasks: ['package']
      }
    },
    cssmin: {
      myTarget: {
        files: {
          'dist/angular-validation-messages.css': 'src/style.css'
        }
      }
    },
    connect: {
      server: {
        options: {
          port: 9001,
          open: true
        }
      }
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js'
      }
    }
  });
  grunt.registerTask('package', ['cssmin', 'jshint', 'concat', 'karma']);
  grunt.registerTask('serve', ['package', 'connect', 'watch']);
  grunt.registerTask('build', ['clean','package', 'uglify']);
};
