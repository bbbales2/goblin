var data;

var load = function(data_) {
    data = data_;

    Crafty.init(500, 350, document.getElementById('game'));

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

    Character : function(sprite_component, assets)
    {
	this.addComponent(sprite_component);

	for (var aname in assets.anims) {
	    var anim = assets.anims[aname];
	    
	    this.reel(aname, 750, 0, anim.y, anim.frames);
	}

	return this;
    }
});

var go = function() {
    for (cname in data) {
	var asset = data[cname];
    }

    for (var i = 0; i < 5; i++) {
	var skel = Crafty.e("Character").Character("sprites_skeleton", data['skeleton']);

	skel.attr({ x : i * 20 })

	skel.animate("me", -1);
    }
};

$(document).ready(function() {
    $.getJSON('resources/sprites.json', load)
});
