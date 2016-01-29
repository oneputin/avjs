var avjs = require('./avjs_module.js');	
// var av3js  = require('./avjs_create.js');	
// var av3use = require('./avjs_explore.js');	

var removeDeps = function(av3Json, params) {
	av3Json = avjs.depsrem(av3Json, params);
	avjs.export(av3Json, params); 
}

var file   = "samples/av3_aveexport.apr";
var params = {file: file};

params["file"] = "samples/gia_base.avx";	
// params["show"] = true;		// optional debug-flag  	

if (1) {	// create a json-translation of file 
	params["main"] = avjs.save;	
}

if (0) {	// extract av3.scripts-files(*.ave) into subdirectories  
	params["main"] = avjs.scripts;	
	// params["folder"] = "test";	// specific dl-folder for all src-objects 
	// params["scriptext"] = "ave"; // 
	// params["propkeys"] = ["Source", "Name"]; 
}

if (0) {	// 
	params["main"] = removeDeps; 
	params["suffix"] = "_x" ; 
	// params["delname"] = "gia_sedit.avx"; // name of selected extension to delete 
}

if (0) {	// 
	params["main"] = avjs.export;
	params["suffix"] = "_x" ; 
}

avjs.import(params);  
