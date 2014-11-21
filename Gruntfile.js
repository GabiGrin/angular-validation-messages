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
      ngAnnotate: {
        options: {
          singleQuotes: true,
        },
        main: {
          files: {
            'dist/angular-validation-messages.js': ['dist/angular-validation-messages.js']
          }
        }
      },
      clean: ['dist'],
      uglify: {
        'dist/angular-validation-messages.min.js': 'dist/angular-validation-messages.js'
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
          tasks: ['package', 'test']
        },
        test: {
          files: ['test/**/*.js'],
          tasks: ['test']
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
        combine: {
          files: {
            'dist/angular-validation-messages.css': ['src/style.css']
          }
        }
      },
      coveralls: {
        options: {
          // LCOV coverage file relevant to every target
          force: true
        },
        all: {
          // Target-specific LCOV coverage file
          src: 'coverage/*/lcov.info'
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
        },
        dist: {
          configFile: 'karma.dist.conf.js'
        }
      }
    }
  );
  grunt.registerTask('package', ['cssmin', 'jshint', 'concat', 'ngAnnotate', 'uglify']);
  grunt.registerTask('test', ['karma:unit', 'karma:dist']);
  grunt.registerTask('serve', ['package', 'test', 'connect', 'watch']);
  grunt.registerTask('build', ['clean', 'package', 'test', 'coveralls']);
};
