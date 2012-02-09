var TYPE1 = "lava";
var TYPE2 = "mountain";

var tiletypes = [
	"grass",
	"mountain",
	"water"
];

var ascii_graphics = [
	{
		type: TYPE2,
		character: "~"
	},
	{
		type: TYPE1,
		character: "."
	}
]



function generate_map(width, height) {
	if (width === undefined) {
		width = 24;
	}
	if (height === undefined) {
		height = 24;
	}

	var map = {
		data:[],
		width: width,
		height: height
	};

	for (var y = 0; y < map.height; y++) {
		var line = [];
		for (var x = 0; x < map.width; x++) {
			var tile = {
				tile_gfx_helper: 'original'
			};
			if (Math.random() <= 0.5) {
				tile.type = [TYPE2];
			} else {
				tile.type = [TYPE1];
			}
			line.push(tile);
		}
		map.data.push(line);
	}

	fill_borders(map);
	var cellular_times = parseInt(Math.random()*5)+1;
	//var cellular_times = 0;
	console.log("Smoothing using cellular automata process " + cellular_times + " times...");
	for (var i = 0; i < cellular_times; i++) {
		cellular_process(map);
	}
	
	return map;
}

function blowup_map_pass1(map) {
	//increase array size:
	for (var y = map.data.length-1; y > 0; y = y - 1) {
		var newarr = [];
		for (var i = 0; i < map.height; i++) {
		    newarr.push({});
		}
	    map.data.splice(y,0,newarr);
	}

	var mx = map.data[0].length;
	var my = map.data.length;
	for (var y = 0; y < my; y = y + 1) {
	    for (var x = mx-1; x > 0; x--) {
	    	var newobj = {}
	        map.data[y].splice(x,0,newobj);
	    }
	}

	map.width = (map.width * 2) - 1;
	map.height = (map.height * 2) - 1;
}

function blowup_map_pass2(map) {
	//Determine horizontal transitions
	for (var y = 0; y < map.height; y += 2) {
	    for (var x = 1; x < map.width; x += 2) {
	        var t1 = map.data[y][x-1].type[0];
	        var t2 = map.data[y][x+1].type[0];
	        map.data[y][x].type = [t1,t2];
	        map.data[y][x].tile_gfx_helper = 'horizontal';
			if (t1 === t2) {
				map.data[y][x].gfx = t1;
			} else {
				if (find_in_types(t1) < find_in_types(t2)) {
					map.data[y][x].gfx = t1 + "_2_" + t2 + "-6";
				} else {
					map.data[y][x].gfx = t2 + "_2_" + t1 + "-2";
				}
			}
	    }
	}
	for (var y = 1; y < map.height; y += 2) {
	    for (var x = 0; x < map.width; x += 2) {
	        var t1 = map.data[y-1][x].type[0];
	        var t2 = map.data[y+1][x].type[0];
	        map.data[y][x].type = [t1,t2];
			map.data[y][x].tile_gfx_helper = 'vertical';
			if (t1 === t2) {
				map.data[y][x].gfx = t1;
			} else {
				if (find_in_types(t1) < find_in_types(t2)) {
					map.data[y][x].gfx = t1 + "_2_" + t2 + "-0";
				} else {
					map.data[y][x].gfx = t2 + "_2_" + t1 + "-4";
				}
			}
	    }
	}
}

function blowup_map_pass3(map) {
	//Determine diagonal transitions
	for (var y = 1; y < map.height; y += 2) {
		for (var x = 1; x < map.width; x += 2) {
			var t1 = map.data[y-1][x+1].type[0];
			var t2 = map.data[y+1][x+1].type[0];
			var t3 = map.data[y+1][x-1].type[0];
			var t4 = map.data[y-1][x-1].type[0];
	        map.data[y][x].type = [t1,t2,t3,t4];
			map.data[y][x].tile_gfx_helper = 'diagonal';
			if (t1 === t2 && t1 === t3 && t1 === t4) {
				map.data[y][x].gfx = t1;
			}
			if (t1 == t3 && t1 == t4 && t1 != t2) {
				//  * *
				//  * #
				if (find_in_types(t1) < find_in_types(t2)) {
					map.data[y][x].gfx = t1 + "_2_" + t2 + "-7";
				} else {
					map.data[y][x].gfx = t2 + "_2_" + t1 + "-9";
				}
			}
			if (t1 == t2 && t1 == t4 && t1 != t3) {
				//  * *
				//  # *
				if (find_in_types(t1) < find_in_types(t3)) {
					map.data[y][x].gfx = t1 + "_2_" + t3 + "-1";
				} else {
					map.data[y][x].gfx = t3 + "_2_" + t1 + "-10";
				}
			}
			if (t1 == t2 && t1 == t3 && t1 != t4) {
				//  # *
				//  * *
				if (find_in_types(t1) < find_in_types(t4)) {
					map.data[y][x].gfx = t1 + "_2_" + t4 + "-3";
				} else {
					map.data[y][x].gfx = t4 + "_2_" + t1 + "-11";
				}
			}
			if (t2 == t3 && t2 == t4 && t2 != t1) {
				//  * #
				//  * *
				if (find_in_types(t2) < find_in_types(t1)) {
					map.data[y][x].gfx = t2 + "_2_" + t1 + "-5";
				} else {
					map.data[y][x].gfx = t1 + "_2_" + t2 + "-8";
				}
			}
			if (t1 == t2 && t3 == t4 && t1 != t4) {
				//  * #
				//  * #
				if (find_in_types(t1) < find_in_types(t4)) {
					map.data[y][x].gfx = t1 + "_2_" + t4 + "-2";
				} else {
					map.data[y][x].gfx = t4 + "_2_" + t1 + "-6";
				}
			}
			if (t1 == t4 && t2 == t3 && t1 != t2) {
				//  # #
				//  * *
				if (find_in_types(t1) < find_in_types(t2)) {
					map.data[y][x].gfx = t1 + "_2_" + t2 + "-0";
				} else {
					map.data[y][x].gfx = t2 + "_2_" + t1 + "-4";
				}
			}
			if (t1 == t3 && t2 == t4 && t1 != t2) {
				//  * #
				//  # *
				if (find_in_types(t1) < find_in_types(t2)) {
					map.data[y][x].gfx = t1 + "_2_" + t2 + "-13";
				} else {
					map.data[y][x].gfx = t2 + "_2_" + t1 + "-12";
				}
			}
		}
	}
}

function find_in_types(type) {
	for (var i = 0; i < tiletypes.length; i++) {
		if (type == tiletypes[i]) {
			return i;
		}
	}
	return 99999;
}

function blowup_map_pass4(map) {
	for (var y = 0; y < map.height; y++) {
		for (var x = 0; x < map.width; x++) {
			var tile = map.data[y][x];
			
			if (tile.tile_gfx_helper == "original") {
				tile.gfx = tile.type[0];
			}

			map.data[y][x] = tile;
		}
	}
}

function cellular_process(map) {
	//Process using cellular automata thing.
	//Ignore the borders
	for (var y = 1; y < map.height-1; y++) {
		for (var x = 1; x < map.width-1; x++) {
			var num = 0;
			for (var v = -1; v <= 1; v++) {
				for (var u = -1; u <= 1; u++) {
					if (map.data[y+v][x+u].type[0] == TYPE2) {
						num = num + 1;
					}
				}
			}
			if (num >= 5) {
				map.data[y][x].type[0] = TYPE2;
			} else {
				map.data[y][x].type[0] = TYPE1;
			}
		}
	}
}

function fill_borders(map) {
	for (var i = 0; i < map.width; i++) {
		map.data[0][i] = {type:[TYPE1], tile_gfx_helper: "original"};
		map.data[map.height-1][i] = {type:[TYPE1], tile_gfx_helper: "original"};
	}
	for (var i = 0; i < map.height; i++) {
		map.data[i][0] = {type:[TYPE1], tile_gfx_helper: "original"};
		map.data[i][map.width-1] = {type:[TYPE1], tile_gfx_helper: "original"};
	}
}

function display_map_ascii(map, handle) {
	if (handle === undefined) {
		handle = $("#content");
	}

	var rmap = "";
	for (var y = 0; y < map.height; y++) {
		var render = false;
		for (var x = 0; x < map.width; x++) {
			var c = get(map,x,y);
			var ch = "";
			for (var i = 0; i < ascii_graphics.length; i++) {
				if (c.type[0] == ascii_graphics[i].type) {
					ch = ascii_graphics[i].character;
					render = true;
				}
			}
			rmap = rmap + ch;
		}
		if (render) {
			rmap = rmap + "\n";
		}		
	}
	handle.append($("<pre style='line-height:1'>" + rmap + "</pre>"));
}

function display_map_gfx(map, handle) {
	if (handle === undefined) {
		handle = $("#content");
	}

	for (var y = 0; y < map.height; y++) {
		for (var x = 0; x < map.width; x++) {
			var c = get(map, x, y);
			var gfx = c.gfx;
			if (gfx === null || gfx === undefined) {
				gfx = "notile";
			}
			handle.append($("<img src='img/tiles/" + gfx + ".png'/>"));
		}
		handle.append("<br/>");
	}
}

function get(map, x, y) {
	if (y >= map.height || y < 0 || x < 0 || x >= map.width) {
		return 1;
	}
	if (map.data[y][x] == null) {
		return "X";
	} else {
		return map.data[y][x];
	}
}