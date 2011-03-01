// map of sprites by name
var sprite_map = {
    "logo" : {
        x: 0,
        y: 0,
        width: 192,
        height: 96
    },
    "menu" : {
        x: 0,
        y: 96,
        width: 175,
        height: 39
    },
    "copywrite" : {
        x: 0,
        y: 135,
        width: 171,
        height: 8
    },
    "toptext" : {
        x: 0,
        y: 143,
        width: 85,
        height: 7
    },
    "selector" : {
        x: 85,
        y: 143,
        width: 8,
        height: 6
    },
    "interface" : {
        x: 192,
        y: 0,
        width: 256,
        height: 208
    },
    "shot" : {
        x: 93,
        y: 143,
        width: 4,
        height: 8
    },
    "redduck" : {
        x: 97,
        y: 143,
        width: 7,
        height: 7
    },
    "whiteduck" : {
        x: 104,
        y: 143,
        width: 7,
        height: 7
    },
    "duck1" : {
        x: 0,
        y: 151,
        width: 35,
        height: 35
    }
};

var DuckHunt = (function () {
    var raw_canvas, scaled_canvas,
    context,
    sprite_image;

    var startGame = function (type_arg) {
        Round.bindKeys();
        Round.start(type_arg);
    };

    var Round = (function () {
        var round_number = 0;

        var duck_list = [];

        var shot_count;
        var display = {};

        var reset_rows = function () {
            duck_list = [];
            display.duck_row = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            display.current_duck = 0;
        }

        reset_rows();

        return {
            start : function () {
                shot_count = 3;
                Renderer.clear();
                // Draw background
                Renderer.add({
                    animate : function () {
                        context.fillStyle = "#64B0FF";
                        context.fillRect(0, 0, 256, 240);
                    }
                });

                // Create duck and render
                var new_duck = new Duck(raw_canvas);
                new_duck.id = display.current_duck;
                new_duck.speed = new_duck.speed * (1 + display.current_duck/10)
                duck_list.push(new_duck);
                Renderer.add(new_duck);

                // Draw interface
                Renderer.add({
                    animate : function () {

                        // Find ducks that fly off screen
                        if (duck_list.length) {
                            for (var i = 0; i < duck_list.length; i++) {
                                if (duck_list[i].removable) {
                                    display.duck_row[duck_list[i].id] = 0;
                                    duck_list.splice(i, 1);
                                    i--;
                                }
                            }
                            if (!duck_list.length) {
                                display.current_duck++;
                                Round.start();
                            }
                        }

                        // Handle logic after last duck
                        if (display.current_duck >= 10) {
                            display.current_duck = 0;
                            reset_rows();
                            Round.start();
                        }

                        // Draw interface overlay
                        Renderer.drawSprite("interface", 0, 32);

                        // Draw bullets in shot count
                        for (var i = 0; i < shot_count; i++) {
                            Renderer.drawSprite("shot", (26 + (i * 8)), 208);
                        }

                        // Draw duck list
                        for (var i = 0; i < display.duck_row.length; i++) {
                            var row = display.duck_row[i];
                            if (row == 0) {
                                Renderer.drawSprite("whiteduck", (96 + (i * 8)), 209);
                            }
                            else if (row == 1) {
                                Renderer.drawSprite("redduck", (96 + (i * 8)), 209);
                            }
                        }
                    }
                });
            },
            bindKeys :  function () {
                raw_canvas.addEventListener("click", function (e) {
                    if (shot_count == 0) {
                        return;
                    }

                    // Consume bullet
                    shot_count--;

                    // Iterate over ducks
                    for (var i = 0; i < duck_list.length; i++) {
                        var this_duck = duck_list[i];

                        if (!e.offsetX) {
                            e.offsetX = e.pageX - raw_canvas.offsetLeft;
                            e.offsetY = e.pageY - raw_canvas.offsetTop;
                        }
                        // pagex pagey?
                        // offsettop offsetleft


                        // Check if shot is inside the duck
                        if ((e.offsetX > this_duck.x) && (e.offsetX < (this_duck.x + 35)) &&
                            (e.offsetY > this_duck.y) && (e.offsetY < (this_duck.y + 35))) {

                            // If its shot, change status
                            this_duck.removable = true;

                            // Remove this duck from display list
                            duck_list.splice(i, 1);
                            i--;

                            // Mark duck list kill
                            display.duck_row[display.current_duck] = 1;

                            // Next duck
                            display.current_duck++;

                            // Next round
                            round_number++;
                            Round.start();
                        }
                        if (shot_count == 0) {
                            this_duck.timed_out = true;
                        }
                    }
                }, false);
            }
        };
    }());

    var Home = (function () {
        // Menu selector on home screen
        var selected = 0;

        return {
            selected : function () {
                return selected;
            },
            selectedUp : function () {
                selected = (selected + 1) % 3;
            },
            selectedDown : function () {
                selected = (selected + 2) % 3;
            },
            bindKeys :  function () {
                raw_canvas.onselectstart = function () {
                    return false;
                }
                document.addEventListener("keydown", function (e) {
                    if (e.which == 38) {
                        Home.selectedDown();
                        return false;
                    }
                    else if (e.which == 40) {
                        Home.selectedUp();
                        return false;
                    }
                    else if (e.which == 13) {
                        startGame(Home.selected());
                        return false;
                    }
                }, false);
            },
            animate : function () {
                context.fillStyle = "#000000";
                context.fillRect(0, 0, 256, 240);
                Renderer.drawSprite("logo", 32, 24);
                Renderer.drawSprite("menu", 64, 136);
                Renderer.drawSprite("copywrite", 40, 208);
                Renderer.drawSprite("toptext", 57, 192);

                // Add 16px to top for each menu item
                Renderer.drawSprite("selector", 48, 137 + (16*selected));
            }
        };
    }());

    return {
        start: function (canvas_arg, resize_canvas) {
            raw_canvas = document.getElementById(canvas_arg);
            scaled_canvas = document.getElementById(resize_canvas)

            if (!raw_canvas.getContext || !scaled_canvas.getContext) return;
            context = raw_canvas.getContext("2d");

            sprite_image = document.getElementById("duckhunt_logo");

            Renderer.start(raw_canvas, scaled_canvas, sprite_image);

            Renderer.add(Home);
            Home.bindKeys();
        }
    };
}());

$(document).ready(function () {
    DuckHunt.start("unscaled_canvas","duck_canvas");
});
