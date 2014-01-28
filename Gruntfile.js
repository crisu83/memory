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
                    'dist/js/memory.js': ['src/js/memory.js']
                }
            }
        }
    });

    grunt.registerTask('default', []);
    grunt.registerTask('build', ['htmlmin:dist', 'cssmin:dist', 'uglify:dist', 'imagemin:dist']);

};