var avjs = require('./avjs_module.js');	
// var av3js  = require('./avjs_create.js');	
// var av3use = require('./avjs_explore.js');	

var removeDeps = function(av3Json, params) {
	av3Json = avjs.depsrem(av3Json, params);
	avjs.export(av3Json, params); 
}
// Read and Transform an AV3-ODB into a "equivalent" JSON
// var file = 'explode.apr';
var file   = 'av3_explore.apr';
var params = {file: file};

if (0) { 
	params["main"] = avjs.save;	
	params["file"] = "odb/gia_base.avx";	
	// params["file"] = "odb/gia_app.avx"; 
	// params["file"] = "odb/geoproc.avx"; 	
	// params["file"] = "odb/inetmap.avx"; 	
}

if (0) {	
	params["main"] = avjs.scripts;	
	params["folder"] = "test";
	params["scriptext"] = "ave";
	params["file"] = "odb/inetmap.avx"; 	
	// params["propkeys"] = ["Source", "Name"]; 
}

if (0) {
	params["main"] = avjs.scripts;	
	params["file"] = "odb/inetmap.avx"; 	
	params["file"] = "odb/gia_app.avx"; 
	params["file"] = "odb/av3_aveexport.apr"; 
	params["show"] = true; 	
}

if (1) {
	params["main"] = removeDeps; 
	params["file"] = "odb/inetmap.avx";	
	params["file"] = "odb/geoproc.avx";	
	params["suffix"] = "_x" ; 
	// params["delname"] = "gia_sedit.avx"; // name of extension to delete 
}

if (0) {
	params["file"] = "odb/gia_base.avx";	
	params["main"] = avjs.export;
	params["suffix"] = "_x" ; 
}

avjs.import(params);  
