var Duck = function (canvas_obj) {

    // Cache canvas and context
    this.canvas = canvas_obj;
    this.context = this.canvas.getContext("2d");

    this.start_time = (new Date()).getTime();
    this.time_to_live = 5000;
    this.speed = 1.8;

    this.direction = (Math.floor(Math.random() * 90)) + 45;

    //this.x = Math.floor(Math.random() * this.canvas.width);
    //this.y = this.canvas.height / 2;
    this.x = 128;
    this.y = 160;

    this.height = 35;
    this.width = 35;
};

Duck.prototype.animate = function () {
    var that = this;
    var nextCoords = function () {
        var m_const = that.direction * (Math.PI / 180);
        that.x = that.x - that.speed * Math.cos(m_const);
        that.y = that.y - that.speed * Math.sin(m_const);
    };

    // Check if it's time to let the bird fly off
    if ((new Date()).getTime() > (this.start_time + this.time_to_live)) {
        this.timed_out = true;
    }

    // Check right border
    if (this.x+this.width > 256) {
        if (this.timed_out) {
            this.removable = true;
        }
        if ((this.direction-90) < 180) {
            this.direction = ((-(this.direction - 90)+90) + 360) % 360;
        }
    }
    // Check left border
    else if  (this.x < 0) {
        if (this.timed_out) {
            this.removable = true;
        }
        if ((this.direction % 270) < 90) {
            this.direction = ((-(this.direction - 270)+270) + 360) % 360;
        }
    }
    // Check top border
    else if (this.y < 0) {
        if (this.timed_out) {
            this.removable = true;
        }
        if (this.direction < 180) {
            this.direction = ((-this.direction) + 360) % 360;
        }
    }

    // Never let it go through the floor
    else if (this.y+this.height > 160) {
        if (this.direction > 180) {
            this.direction = ((-(this.direction - 180) + 180) + 360) % 360;
        }
    }
    // Get next point in path
    nextCoords();

    // Draw Bird
    Renderer.drawSprite("duck1", this.x, this.y);
};
