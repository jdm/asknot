module.exports = function (grunt) {

    // Load NPM Tasks
    require('load-grunt-tasks')(grunt, ['grunt-*']);

    // Project configuration.
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),
        
        uglify: {
            options: {
              preserveComments: false,
              mangle: false
            },
            dist: {
                src: [
                    './dev/assets/js/jquery-1.9.1.min.js',
                    './dev/assets/js/foopy.js',
                    './dev/assets/js/l10n.js',
                ],
                dest: './dev/assets/js/participe.min.js'
            }
        },

        imagemin: {
            png: {
                options: {
                    optimizationLevel: 7
                },
                files: [
                    {
                        expand: true,
                        cwd: './dev/assets/images/',
                        src: ['**/*.png'],
                        dest: './dist/assets/images/',
                        ext: '.png'
                    }
                ]
            }
        },

        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true,
                    removeEmptyAttributes: true,
                    removeCommentsFromCDATA: true,
                    removeRedundantAttributes: true,
                    collapseBooleanAttributes: true
                },
                files: {
                    // Destination : Source
                    './dist/index.html': './dev/index.html'
                }
            }
        },

        cssmin: {
            files: {
                src: [
                    './dev/assets/css/style.css'
                ],
                dest: './dev/assets/css/participe.min.css',
            }
        },
        
        connect: {
            dev: {
                options: {
                    port: 8000,
                    base: 'dev',
                    keepalive: true
                }
            },
            dist: {
                options: {
                    port: 8000,
                    base: 'dist',
                    keepalive: true
                }
            }
        },

        copy: {
            css: {
                src: './dev/assets/css/participe.min.css',
                dest: './dist/assets/css/participe.min.css',
            },
            js: {
                src: './dev/assets/js/participe.min.js',
                dest: './dist/assets/js/participe.min.js',
            },
        },

    });

    // Default Task
    grunt.registerTask('default', ['connect:dev']);

    // Separated Tasks
    grunt.registerTask('js', ['uglify']);
    grunt.registerTask('css', ['cssmin']);
    grunt.registerTask('html', ['htmlmin']);
    grunt.registerTask('image', ['imagemin']);
    grunt.registerTask('cp', ['copy']);
    grunt.registerTask('live', ['connect:dist']);

    // Release Task
    grunt.registerTask('release', ['imagemin', 'htmlmin', 'cssmin', 'uglify', 'copy', 'connect:dist']);

};