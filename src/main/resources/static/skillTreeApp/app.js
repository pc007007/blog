/**
 * Created by pc on 4/8/16.
 */
var skillTree = angular.module('skillTree', []);
skillTree.controller('mainController', function ($scope, d3) {
    $scope.version = d3.version;

    var width = 800;
    var height = 600;
    var svg = d3.select('body').append('svg')
        .attr('width', width)
        .attr('height', height);

    function skill_set(skill) {
        var requiredLevel;

        svg.append('text')
            .attr({
                id: skill.name + '-level',
                x: skill.x + 10,
                y: skill.y + 35,
                stroke: 'black'
            })
            .text(skill.level + '/' + skill.maxLevel);

        function levelup() {
            if (skill.level < skill.maxLevel) {
                skill.level = skill.level + 1;
                svg.select('#' + skill.name + '-level')
                    .text(skill.level + '/' + skill.maxLevel);
            } else {
                console.log(skill.name + ' already reach the max level!')
            }
        }

        svg.append('rect')
            .attr('id', skill.name)
            .attr('x', skill.x)
            .attr('y', skill.y)
            .attr('width', 40)
            .attr('height', 40)
            .attr('style', 'fill:black;fill-opacity:0.1')
            .on('mouseout', function () {
                svg.select('#' + skill.name)
                    .transition()
                    .attr('style', 'fill:black;fill-opacity:0.1');
                svg.select('#' + skill.name + '-text').remove();
            })
            .on('mouseover', function () {
                svg.append('text')
                    .attr({
                        id: skill.name + '-text',
                        x: skill.x,
                        y: skill.y + 55,
                        fill: 'blue'
                    })
                    .text(skill.name);
                svg.select('#' + skill.name)
                    .transition()
                    .attr('style', 'stroke:white;fill-opacity:0.1');
            })
            .on('click', function () {
                $scope.data.forEach(function (tskill) {
                    if (skill.hasOwnProperty('dependencies')) {
                        if (tskill.name === skill.dependencies.name) {
                            requiredLevel = tskill.level;
                        }
                    }
                });

                if(skill.hasOwnProperty('dependencies')) {
                    if (requiredLevel === skill.dependencies.level) {
                        levelup();
                    } else {
                        console.log('need ' + skill.dependencies.name + ' level' + skill.dependencies.level);
                    }
                }else{
                    levelup();
                }
            })
            .on('contextmenu', function () {
                d3.event.preventDefault();
                if (skill.level > 0) {
                    skill.level = skill.level - 1;
                    svg.select('#' + skill.name + '-level')
                        .text(skill.level + '/' + skill.maxLevel);
                } else {
                    console.log('reach minimum level')
                }
            })
    };

    function initial(data) {
        svg.selectAll('*').remove();
        data.forEach(function (skill) {
            skill_set(skill);
        });
    }

    $scope.data = [
        {name: 'skill1', x: 380, y: 0, level: 0, maxLevel: 2},
        {name: 'skill2', x: 60, y: 40, level: 0, maxLevel: 2, dependencies: {name: 'skill1', level: 2}},
        {name: 'skill3', x: 600, y: 40, level: 0, maxLevel: 7,dependencies: {name:'skill1',level:2}},
        {name: 'skill4', x: 380, y: 120, level: 0, maxLevel: 1,dependencies: [{name:'skill3',level:7},{name:'skill2',level:2}]}
    ];

    console.log($scope.data[3].hasOwnProperty('dependencies'));
    initial($scope.data);
});
