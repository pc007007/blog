/**
 * Created by pc on 4/8/16.
 */
var skillTree = angular.module('skillTree', []);
skillTree.controller('mainController', function ($scope, d3) {
    $scope.version = d3.version;

    var width = 1000;
    var height = 700;
    var svg = d3.select('body').append('svg')
        .attr('width', width)
        .attr('height', height);
    var def = svg.append('defs');

    function setBackground(imageUrl) {
        svg.append('image')
            .attr('xlink:href', imageUrl)
            .attr({
                x: 0,
                y: 0,
                width: width,
                height: height,
                preserveAspectRatio: 'none'
            });
    }

    function setFlag(data) {
        data.forEach(function (x) {
            x.flag = true;
            x.dependencies.forEach(function (y) {
                y.owner = x.name;
                data.forEach(function (z) {
                    if (z.name === y.name) {
                        if (z.level === y.level) {
                            y.flag = true;
                            x.flag = x.flag && true;
                        } else {
                            y.flag = false;
                            x.flag = x.flag && false;
                        }
                    }
                })
            });
        });
    }

    function highlightBorder(data) {
        setFlag(data);
        data.forEach(function (x) {
            if (x.flag) {
                svg.select('#' + x.name)
                    .attr('style', 'fill-opacity:0.7')
                    .attr('style', 'stroke:#FFF579;stroke-width:2');
                if (x.level > 0) {
                    svg.select('#' + x.name)
                        .attr('style', 'stroke:#FFF579;stroke-width:2;fill-opacity:0.1');
                }
            } else {
                svg.select('#' + x.name)
                    .attr('style', 'fill:black;fill-opacity:0.7');
            }
        });
    }

    function highlightLine(data) {
        data.forEach(function (x) {
            x.dependencies.forEach(function (y) {
                if (y.flag) {
                    svg.select('#' + y.name + '-' + y.owner)
                        .attr({style: 'stroke:yellow;stroke-width:8;stroke-opacity:0.8'})
                }else{
                    svg.select('#' + y.name + '-' + y.owner)
                        .attr({style: 'stroke:yellow;stroke-width:8;stroke-opacity:0.3'})
                }
            })
        })
    }

    function skill_set(skill, size) {
        var currentLevel = [];
        var dependLevel = [];

        def.append('pattern')
            .attr({
                id: skill.name + '-pic',
                patternUnits: "userSpaceOnUse",
                height: height,
                width: width
            }).append('image')
            .attr('xlink:href', skill.imageUrl)
            .attr({
                x: skill.x,
                y: skill.y,
                width: size,
                height: size,
            });

        svg.append('rect')
            .attr({
                x: skill.x,
                y: skill.y,
                rx: 10,
                ry: 10,
                width: size,
                height: size,
                fill: 'url(#' + skill.name + '-pic)',
                style: 'stroke:#9A9A00;stroke-width:4'
            });

        function levelup() {
            if (skill.level < skill.maxLevel) {
                skill.level = skill.level + 1;
                svg.select('#' + skill.name + '-level')
                    .text(skill.level + '/' + skill.maxLevel);
            } else {
                console.log(skill.name + ' already reach the max level!')
                //todo
            }
        }

        svg.append('rect')
            .attr('id', skill.name)
            .attr('x', skill.x)
            .attr('y', skill.y)
            .attr('rx', 10)
            .attr('ry', 10)
            .attr('width', size)
            .attr('height', size)
            .attr('style', 'fill:black;fill-opacity:0.7')
            .on('mouseout', function () {
                /*if (skill.level === 0) {
                 svg.select('#' + skill.name)
                 .attr('style', 'fill:black;fill-opacity:0.7');
                 }*/
                highlightBorder($scope.data);
                svg.select('#' + skill.name + '-text').remove();
            })
            .on('mouseover', function () {
                svg.append('text')
                    .attr({
                        id: skill.name + '-text',
                        x: skill.x,
                        y: skill.y + 100,
                        fill: 'yellow'
                    })
                    .text(skill.description);
                svg.select('#' + skill.name)    //skill border animation
                    .attr('style', 'stroke:#FFF579;stroke-width:2;fill-opacity:0.1');
            })
            .on('click', function () {
                $scope.data.forEach(function (tskill) {
                    skill.dependencies.forEach(function (x) {
                        if (tskill.name === x.name) {
                            currentLevel.push(tskill.level);
                        }
                    });

                });

                skill.dependencies.forEach(function (x) {
                    dependLevel.push(x.level);
                });

                if (currentLevel.toString() === dependLevel.toString()) {
                    levelup();

                    highlightBorder($scope.data);
                    highlightLine($scope.data);

                    svg.select('#' + skill.name + '-level')
                        .attr({
                            style: 'fill:white;text-anchor: middle;font-size: 12px;fill-opacity:0.9'
                        })
                } else {
                    console.log('need skill level');
                    //todo
                }

                currentLevel = [];
                dependLevel = [];
            })
            .on('contextmenu', function () {
                d3.event.preventDefault();
                if (skill.level > 1) {
                    skill.level = skill.level - 1;
                    svg.select('#' + skill.name + '-level')
                        .text(skill.level + '/' + skill.maxLevel);
                    highlightBorder($scope.data);
                    highlightLine($scope.data);
                } else if (skill.level === 1) {
                    skill.level = skill.level - 1;
                    svg.select('#' + skill.name + '-level')
                        .attr({
                            style: 'fill:white;text-anchor: middle;font-size: 12px;fill-opacity:0.5'
                        })
                        .text(skill.level + '/' + skill.maxLevel);
                    highlightBorder($scope.data);
                    highlightLine($scope.data);
                } else {
                    console.log('reach minimum level');
                    //todo
                }
            });

        svg.append('rect')
            .attr({
                x: skill.x + size - 10,
                y: skill.y + size - 12,
                rx: 3,
                ry: 3,
                height: 15,
                width: 20,
                fill: 'black',
                stroke: '#BCB76F'
            });

        if (skill.level === 0) {
            svg.append('text')
                .attr({
                    id: skill.name + '-level',
                    x: skill.x + size,
                    y: skill.y + size,
                    style: 'fill:white;text-anchor: middle;font-size: 12px;fill-opacity:0.5'
                })
                .text(skill.level + '/' + skill.maxLevel);
        } else {
            svg.select('#' + skill.name)
                .attr('style', 'stroke:#FFF579;stroke-width:2;fill-opacity:0.1');
            svg.append('text')
                .attr({
                    id: skill.name + '-level',
                    x: skill.x + size,
                    y: skill.y + size,
                    style: 'fill:white;text-anchor: middle;font-size: 12px;fill-opacity:0.9'
                })
                .text(skill.level + '/' + skill.maxLevel);
        }
    }

    function initial(data, size) {
        data.forEach(function (skill) {
            skill_set(skill, size);
        });
    }

    function generateNodes(data) {
        var nodes = [];
        var point = {};
        data.forEach(function (x) {
            x.dependencies.forEach(function (y) {
                data.forEach(function (z) {
                    if (y.name === z.name) {
                        point.id = y.name + '-' + x.name,
                            point.x2 = x.x;
                        point.y2 = x.y;
                        point.x1 = z.x;
                        point.y1 = z.y;
                        nodes.push(point);
                        point = {};
                    }
                })
            });
        });
        return nodes;
    }

    function drawLine(nodes, size) {
        svg.selectAll('line')
            .data(nodes)
            .enter()
            .append('line')
            .attr({
                id: function (d) {
                    return d.id;
                },
                x1: function (d) {
                    return d.x1 + size / 2;
                },
                y1: function (d) {
                    return d.y1 + size / 2;
                },
                x2: function (d) {
                    return d.x2 + size / 2;
                },
                y2: function (d) {
                    return d.y2 + size / 2;
                },
                style: 'stroke:yellow;stroke-width:8;stroke-opacity:0.3'
            });
    }

    $scope.data = [
        {
            name: 'skill1',
            x: 420,
            y: 40,
            level: 2,
            maxLevel: 2,
            imageUrl: 'http://cdn.dota2.com/apps/dota2/images/abilities/dragon_knight_breathe_fire_hp1.png?v=3379714',
            dependencies: [],
            description: 'Breathe Fire Unleashes a breath of fire in front of Dragon Knight that burns enemies and reduces the damage their attacks deal.'
        },
        {
            name: 'skill2',
            x: 180,
            y: 180,
            level: 2,
            maxLevel: 2,
            imageUrl: 'http://cdn.dota2.com/apps/dota2/images/abilities/dragon_knight_dragon_tail_hp1.png?v=3379714',
            dependencies: [{name: 'skill1', level: 2}],
            description: 'Breathe Fire Unleashes a breath of fire in front of Dragon Knight that burns enemies and reduces the damage their attacks deal.'
        },
        {
            name: 'skill3',
            x: 660,
            y: 180,
            level: 0,
            maxLevel: 7,
            imageUrl: 'http://cdn.dota2.com/apps/dota2/images/abilities/dragon_knight_dragon_blood_hp1.png?v=3379714',
            dependencies: [{name: 'skill1', level: 2}],
            description: 'Breathe Fire Unleashes a breath of fire in front of Dragon Knight that burns enemies and reduces the damage their attacks deal.'
        },
        {
            name: 'skill4',
            x: 420,
            y: 260,
            level: 0,
            maxLevel: 1,
            imageUrl: 'http://cdn.dota2.com/apps/dota2/images/abilities/lina_dragon_slave_hp1.png?v=3379714',
            dependencies: [{name: 'skill2', level: 2}, {name: 'skill3', level: 7}],
            description: 'Breathe Fire Unleashes a breath of fire in front of Dragon Knight that burns enemies and reduces the damage their attacks deal.'
        },
        {
            name: 'skill5',
            x: 420,
            y: 400,
            level: 0,
            maxLevel: 1,
            imageUrl: 'http://cdn.dota2.com/apps/dota2/images/abilities/lina_light_strike_array_hp1.png?v=3379714',
            dependencies: [{name: 'skill4', level: 1}],
            description: 'Breathe Fire Unleashes a breath of fire in front of Dragon Knight that burns enemies and reduces the damage their attacks deal.'
        },
        {
            name: 'skill6',
            x: 520,
            y: 480,
            level: 0,
            maxLevel: 1,
            imageUrl: 'http://cdn.dota2.com/apps/dota2/images/abilities/dragon_knight_elder_dragon_form_hp1.png?v=3379714',
            dependencies: [{name: 'skill5', level: 1}],
            description: 'Breathe Fire Unleashes a breath of fire in front of Dragon Knight that burns enemies and reduces the damage their attacks deal.'
        },
        {
            name: 'skill7',
            x: 520,
            y: 580,
            level: 0,
            maxLevel: 1,
            imageUrl: 'http://cdn.dota2.com/apps/dota2/images/abilities/lycan_shapeshift_hp1.png?v=3379714',
            dependencies: [{name: 'skill6', level: 1}],
            description: 'Breathe Fire Unleashes a breath of fire in front of Dragon Knight that burns enemies and reduces the damage their attacks deal.'
        }
    ];

    setBackground('http://pre11.deviantart.net/0198/th/pre/f/2013/055/a/6/dragon_knight_illustration_by_eccentricdz-d5w2zqw.jpg');

    var nodes = generateNodes($scope.data);

    drawLine(nodes, 60);

    initial($scope.data, 60);

    highlightBorder($scope.data);

    highlightLine($scope.data);

    svg.append('path')
        .attr({
            d:'M450,70 L 210,70 L210,210',
            fill: 'none',
            stroke:'white',
            'stroke-width':'12px'
        })
});
