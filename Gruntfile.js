module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        copy: {
            dist: {
                expand: true,
                cwd: 'src/',
                src: ['**'],
                dest: 'dist/'
            }
        },
        cssmin: {
            dist: {
                files: {
                    'dist/css/styles.css': ['src/css/styles.css']
                }
            }
        },
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    src: ['src/img/**/*.{png,jpg,gif}'],
                    dest: 'dist/img'
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
    grunt.registerTask('build', ['copy:dist', 'cssmin:dist', 'uglify:dist', 'imagemin:dist']);

};