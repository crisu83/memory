module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        cssmin: {
            dist: {
                files: {
                    'dist/css/styles.css': ['src/css/styles.css']
                }
            }
        },
        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    'dist/index.html': 'src/index.html'
                }
            }
        },
        imagemin: {
            dist: {
                options: {
                    cache: false
                },
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['**/*.{png,jpg,gif}'],
                    dest: 'dist/'
                }]
            }
        },
        uglify: {
            dist: {
                files: {
                    'dist/js/lib/underscore.js': ['src/js/lib/underscore.js'],
                    'dist/js/lib/phaser.js': ['src/js/lib/phaser.js'],
                    'dist/js/memory.js': ['src/js/memory.js'],
                    'dist/js/pew.js': ['src/js/pew.js']
                }
            }
        }
    });

    grunt.registerTask('default', []);
    grunt.registerTask('build', ['htmlmin:dist', 'cssmin:dist', 'uglify:dist', 'imagemin:dist']);

};