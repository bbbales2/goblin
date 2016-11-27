var jsonData;

var load = function(data) {
    jsonData = data;

    Crafty.init(800, 600, document.getElementById('game'));

    assets = {
	"sprites": {
	}
    };

    for (cname in data) {
	var asset = data[cname];

	var map = {};
	map["sprites_" + cname] = [0, 0];

        assets.sprites[asset.path] = {
	    tile : asset.w,
	    tileh : asset.h,
	    map : map
	};
    }

    Crafty.load(assets, go);
};

var anims = {};

Crafty.c('Character', {
    required : '2D, Canvas, SpriteAnimation',

    state : "s", // s -- standing, m -- walking, a -- attacking

    x : 0,
    y : 0,
    r : 0,

    queue : [],

    /* Possible jobs in queue
      ["m", [x, y]] -- move to x, y
      ["a", [x, y]] -- attack to x, y
      ["at", target] -- attack target until it is dead
    */

    Character : function(sprite_component, anims)
    {
	this.addComponent(sprite_component);

	for (var aname in anims) {
	    var anim = anims[aname];
	    
	    this.reel(aname, 750, 0, anim.y, anim.frames);
	}

	return this;
    },

    atick : function(dt)
    {
	var pi8 = Math.PI / 8.0;

	this.r = this.r % (2 * Math.PI);

	var dir = null;

	if (this.r < pi8 || this.r >= 15 * pi8)
	{
	    dir = 'n';
	} else if (this.r < 3 * pi8 && this.r >= pi8) {
	    dir = 'ne';
	} else if (this.r < 5 * pi8 && this.r >= 3 * pi8) {
	    dir = 'e';
	} else if (this.r < 7 * pi8 && this.r >= 5 * pi8) {
	    dir = 'se';
	} else if (this.r < 9 * pi8 && this.r >= 7 * pi8) {
	    dir = 's';
	} else if (this.r < 11 * pi8 && this.r >= 9 * pi8) {
	    dir = 'sw';
	} else if (this.r < 13 * pi8 && this.r >= 11 * pi8) {
	    dir = 'w';
	} else if (this.r < 15 * pi8 && this.r >= 13 * pi8) {
	    dir = 'nw';
	}

	var animation = null;

	if (this.state == "s") {
	    animation = "m" + dir;

	    if(this.isPlaying())
		this.pauseAnimation();
	} else {
	    if (this.state == "m") {
		animation = "m" + dir;
	    } else if (this.state == "a") {
		animation = "a1" + dir;
	    }

	    if(this.getReel() != animation)
	    {
		this.animate(animation, -1);
	    }

	    if(!this.isPlaying())
	    {
		this.resumeAnimation();
	    }
	}

	return this;
    },

    tick : function(dt)
    {
	if (this.queue.length == 0) {
	    this.state = 's'
	} else {
	    var job = this.queue[0];
	    var x = this.x;
	    var y = this.y;

	    if (job[0] == "m") {
		var loss, gradU = mUgradU([x, y], job[1]);

		if (loss < 1.0)
		    this.queue.shift();
		else
		{
		    gradU = normalize(gradU);
		    //gradU / 
		}
	    }
	}

	//Fix animation
	this.atick();
    }
});

var go = function() {
    for (var i = 0; i < 8; i++) {
	var skel = Crafty.e("Character").Character("sprites_skeleton", jsonData['skeleton'].anims);

	skel.attr({ x : i * 50, y : i * 50, r : i * Math.PI / 4.0, state : ["s", "m", "a"][i % 3] })

	skel.tick();
    }
};

$(document).ready(function() {
    $.getJSON('resources/sprites.json', load)
});
