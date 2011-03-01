var Renderer = (function () {
    // draw object queue
    var render_queue = [];

    // draw interval
    var draw_interval, sprite_image;

    var normal_canvas, scaled_canvas,
    normal_context, scaled_context;

    // resize image/canvas without antialiasing
    var resize = function (sctx, dctx, sx, sy, sw, sh, tx, ty, tw, th) {
        // Get source/source data
        var source = sctx.getImageData(sx, sy, sw, sh);
        var sdata = source.data;

        // Create target data
        var target = dctx.createImageData(tw, th);
        var tdata = target.data;

        var mapx = [];
        // ratio = source width / to width
        var ratiox = sw / tw, px = 0;

        for (var i = 0; i < tw; ++i) {
            mapx[i] = 4 * Math.floor(px);
            px += ratiox;
        }

        var mapy = [];
        var ratioy = sh / th, py = 0;
        for (var i = 0; i < th; ++i) {
            mapy[i] = 4 * sw * Math.floor(py);
            py += ratioy;
        }
        var tp = 0;
        for (py = 0; py < th; ++py) {
            for (px = 0; px < tw; ++px) {
                var sp = mapx[px] + mapy[py];
                tdata[tp++] = sdata[sp++];
                tdata[tp++] = sdata[sp++];
                tdata[tp++] = sdata[sp++];
                tdata[tp++] = sdata[sp++];
            }
        }
        dctx.putImageData(target, tx, ty);
    };

    // Run through draw queue in order
    var draw_queue = function () {
        normal_context.clearRect(0, 0, 256, 240);

        for (var i = 0; i < render_queue.length; i++) {
            // Remove removable objects from queue
            if (render_queue[i].removable) {
                render_queue.splice(i, 1);
                i--;
            }
            else {
                render_queue[i].animate();
            }
        }
        //scaled_context.drawImage(normal_canvas, 0, 0, 256, 240, 0, 0, scaled_canvas.width, scaled_canvas.height);
        // Scale up canvas for display
        //resize(normal_context, scaled_context, 0, 0, normal_canvas.width, normal_canvas.height,
        //    0, 0, scaled_canvas.width, scaled_canvas.height);
    };

    return {
        start : function (raw_canvas, resize_canvas, sprite_el) {
            normal_canvas = raw_canvas;
            scaled_canvas = resize_canvas;
            sprite_image = sprite_el;

            normal_context = raw_canvas.getContext("2d");
            scaled_context = resize_canvas.getContext("2d");
            scaled_context.mozImageSmoothingEnabled  = false;

            draw_interval = setInterval(draw_queue, 20);
        },
        add : function (obj_el) {
            render_queue.push(obj_el);
        },
        clear : function () {
            render_queue = [];
        },

        drawSprite :  function (type_arg, x_arg, y_arg) {
            if (sprite_map[type_arg]) {
                var sprite = sprite_map[type_arg];
                normal_context.drawImage(sprite_image, sprite.x, sprite.y, sprite.width, sprite.height,
                    x_arg, y_arg, sprite.width, sprite.height);

            }
        }
    };
}());

