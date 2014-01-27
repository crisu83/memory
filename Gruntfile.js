module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'img/',
                    src: ['**/*.{png,jpg,gif}'],
                    dest: 'img/'
                }]
            }
        },
        uglify: {
            dist: {
                files: {
                    'js/memory.min.js': ['js/memory.js']
                }
            }
        }
    });

    grunt.registerTask('default', []);
    grunt.registerTask('build', ['imagemin', 'uglify']);

};