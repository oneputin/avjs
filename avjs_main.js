#! /usr/bin/env node
var params = require('minimist')(process.argv.slice(2));	console.log('inparams: ', params, process.argv);

// Testdaten 
// params["file"] = "samples/gia_base.avx";	
// params["file"] = "samples/av3_aveexport.apr";

if (params["m"]) params["mode"] = params["m"];
if (params["f"]) params["file"] = params["f"];

if (!params["mode"]) params["mode"] = "save";
if (!params["file"]) params["file"] = "samples/av3_aveexport.apr";

var avjs = require('./avjs_module.js');	

var removeDeps = function(av3Json, params) {
	av3Json = avjs.depsrem(av3Json, params);
	avjs.export(av3Json, params); 
}


switch (params["mode"]) {	
	case 'save':
		params["main"] = avjs.save;  	// Save importObj as avjs(json)	
	    break;
	case 'scripts':
		params["main"] = avjs.scripts;	// Save all scripts contained in importObj as ave(text)
	 	// params["folder"] = "test";	// specific dl-folder for all src-objects 
	 	// params["scriptext"] = "ave"; // 
		// params["propkeys"] = ["Source", "Name"]; 
	    break;
	case 'export':    
		params["main"] = avjs.export;	// export importObj in original format (copy)
		params["suffix"] = "_x" ; 
		break;
	case 'clear':
		params["main"] = removeDeps; 	// remove Dependencies from ODB(Extension)
		params["suffix"] = "_x" ; 
		// params["delname"] = "gia_sedit.avx"; // name of selected extension to delete 
		break;
   default:
     console.log('Sorry, that is not something I know how to do.');
     return; 
}  console.log('allparams: ', params);  // return; 

// OPTIONAL: Debug-parameter 
// params["show"] = true;		// optional debug-flag  	


avjs.import(params);  
