// av3json_create.js
var fs 	 = require('fs'),		// writing files
	path = require('path'),		 
	util = require('util'),		// ?? 
    lineReader = require('line-reader'),
    readline   = require('readline'),
	jsonfile   = require('jsonfile'); // reading/parsing json files
 
function odblines_import(lines, params) {	// console.dir(lines); console.log(lines.length + "lines");
	// sourcePropName differs between apr and avx

	function av3propString(propString, addLine) {
		var c = addLine; 

        if (c.charAt(0)=='"') {
    		c = c.substr(1, c.length-1);
        }
        
        if (c.charAt(c.length-1)=='"') { // remove trailing DQUOTE 
    		c = c.substr(0, c.length-1);
		}    

        if (c.indexOf('""') >= 0 ) { 	 // remove trailind DQUOTEs 
    		c = c.replace('""','"');
		}    

        if (propString) {
        	c = propString + c;
        }	
		return c;
	};

	function ischeckedKey(checkKey) {
		var exx  = ["Dependencies","List","AVstr","Butn","Numb","Choice"]; 	
		var	found=false, i=0;
		for (; i < exx.length; ) { 
			found = true;
			if (checkKey.indexOf(exx[i])>=0) break; 
		    found=false; i++;
		}
		return !found;
	};

	function isvalidKey(checkKey, numberflag) {
		var exx = [" ","*","(",")","\\","/","\"","="]; // characters NOT allowed in ODB-keys 
		var	found=false, i=0;
		for (; i < exx.length; ) { 
			found = true;
			if (checkKey.indexOf(exx[i])>=0) break; 
		    found=false; i++;
		}
		return !found;
	};

	function traverse(lines, params) { // propKeys, scriptPropName) {
		// with dropFlag "empty" nodes are neglected !! 

		var keysCollect, propKeys, ext, scriptPropName; 
		
		if (!params) {
			keysCollect = 1; 
			propKeys = [];
		} else {
			propKeys = params["propkeys"],
			ext = params["extension"]; 
			if (ext=="apr")  scriptPropName = "Source";	
			else 			 scriptPropName = "SourceCode";
		}	

		var av3Json = {};

		var odbColl, odbObj,
			odbLine, c1, cnt = 0, lTokens, checkKey, 
			p,p1,p2,cStart,cLength,v1,v2, 
			keys, odbName, odbId ,
			isScriptProp = false, isBitmapProp = false,
			propContent = "", propKey, odbObj;  

		for	(i = 0; i < lines.length; i++) {
		
			odbLine = lines[i]; 

	 		c1 = odbLine.substr(0,1); // detects specific CTRL-lines

	   		if (c1 == "(" ) {   	 // OBJECT-START
				// cnt = cnt + 1; 	// console.log("OBJ-START at "+ i, cnt) 
	   			
	   			if (keysCollect)  continue ; 

			    if (isScriptProp && odbObj) { //' *** Ausnahme: line in script-texten
			      propContent = av3propString(propContent, odbLine);
			      odbObj[propKey] = propContent;
			      continue; 
			    }

			    keys = odbLine.substr(1).split(".");
			    if (keys.length < 2) continue; 						// is part of sourcecode 

				if (!isvalidKey(keys[0])) continue;     			// is part of sourcecode
			    if (!isvalidKey(keys[1].trim(),"num")) continue; 	// is part of sourcecode

			    odbName = keys[0];
			    odbId   = keys[1].trim();
		    	odbId   = parseInt(odbId); 

			    odbColl = av3Json[odbName]; 
			    if (!odbColl) { 
			    	odbColl = {};
			    	av3Json[odbName] = odbColl;
			    } // console.dir(odbColl); 
			    
			    odbObj = {};
		
			}  else if (c1 == ")") { // OBJECT-END 
	   			
	   			if (keysCollect)  continue ; 
	    
			    if (odbLine.trim().length == 1) {  
			    	odbColl[odbId] = odbObj;  // console.log("OBJ-END of ", odbId, odbName, Object.keys(odbColl).length); 
			    	propKey = "";
			    	isScriptProp = false;
			    
			    } else if (isScriptProp && odbObj) { // *** Ausnahme: line in script-texten
			    	propContent     = av3propString(propContent, odbLine);
			    	odbObj[propKey] = propContent;
			    	continue;
			    }   // break ;
			
			} else if (c1 == "/") {  // SKIP FIRST LINE 

	   			if (keysCollect)  {	// console.log(odbLine);
	   				console.log("/-line : KEYS-collect");
	   				continue ; 
	   			}

	   			// console.log(propKey, isScriptProp, odbObj);	
			    if (isScriptProp && odbObj)  { // *** Ausnahme: line in script-texten
			    	propContent = av3propString(propContent, odbLine); 
			    	odbObj[propKey] = propContent;
			    	continue; 
			    } 
	   			
   				// console.log(odbLine);
				console.log("Start: JSON-create");      
			    continue;   

	  		} else  {                // NORMAL object-content

			    odbLine = odbLine.replace(/\t/g,"").trim(); // Remove all TABULATORs from odblines 
				    										// GOOD, if before KEY and VALUE   
				    										// PROBLEM, if tab in script-text (may happen) 
			    lTokens = odbLine.split(":");	// A.  
			    
			    if (lTokens.length > 1) {   

			    	checkKey = lTokens[0]; 

		   			if (keysCollect)  {
		   				if (isvalidKey(checkKey))  propKeys.push(checkKey);
		   				continue ; 
			      	}

				    if (propKeys.indexOf(checkKey.trim()) < 0) {   

					    if (isScriptProp && odbObj) { //' *** Ausnahme: line in script-texten
					      propContent = av3propString(propContent, odbLine);
					      odbObj[propKey] = propContent;
					      // continue; 
					    }
				      
				    } else {
		 		        
				        propKey = checkKey.trim(); 	// avoid "scriptKeys" 
				      
				        isScriptProp  = (propKey == scriptPropName); 
				      	//**************************************** 
				        isBitmapProp  = (propKey == "Bits"); 
				   
				   		// Extract 
				   		//      
				        cStart  = checkKey.length + 1;
				        cLength = odbLine.length - cStart;  

				        propContent = odbLine.substr(cStart, cLength);
				        propContent = av3propString("", propContent); 	

				        // Detect NUMERIC contents 
				        // (spec: Bits for bitmaps)
				        //	
				        if (isBitmapProp)  { 

				            propContent = JSON.stringify(propContent.trim());
				        
				        } else  if (parseFloat(propContent.trim())) {
				        	p = propContent.trim();  
				        	numFlag = (p.indexOf("x")<0) && (p.indexOf(" ") <0); 
				        	if (numFlag) {     	 // Sonderfall-1:   .asNumber
				        	    p1 = parseFloat(p);
				            	p2 = parseInt(p); 
				            	if (p1==p2) propContent = p2;
				            	else 		propContent = p1;
				        	} else {
				            	propContent = JSON.stringify(p);   
				        	}
				        }   
				        

						// 
				        isContent = odbObj[propKey];

				        if (isContent== null) {  					// Simple 

				            odbObj[propKey] = propContent;
				          
				        } else if (typeof isContent == "object") {  // Array erweitern  

				            isContent.push(propContent);
				            //*************************  
				            odbObj[propKey] = isContent;
				       
				        } else {									// Simple to array 

		 		            isContent = [isContent, propContent];  
				            odbObj[propKey] = isContent;
				        }

				    }
			      
			    } else {	// scriptProp

		   			if (keysCollect)  continue ; 
			        propContent     = propContent + odbLine;
			        odbObj[propKey] = propContent;

			    }
	  		}
		}	

		if (keysCollect) {	// console.log("Raw propKeys", propKeys) ;
			return propKeys ; 
		}	// console.log("Raw av3Json", Object.keys(av3Json)) ; 

		return av3Json; 
	} 	

	function clearav3Json (aprJsonIn) {	
		// reduces aprJson to Objects "with at least one property extracted"  
		var aprJsonOut = {}, objColl, obj;
		// var objKeys = Object.keys(aprJsonIn); 	// console.dir(objKeys); // parent of rootObjects
		// return aprJsonIn;
		for (var key in aprJsonIn) {
 			objColl = aprJsonIn[key];				// collection of rootObjects
			for (var index in objColl) {
				obj = objColl[index]; 
				if (Object.keys(obj).length) {	// properties of obj 
					aprJsonOut[key] = objColl; 
					break;
				} 
			}	
 		}
		return aprJsonOut;
	}

	// 1. get a unique list of all PropertyNames 
	//    (detected by syntax) 
	var rawKeys = traverse(lines);
	if (!rawKeys || !rawKeys.length) {
		return;
	}   

	var allKeys = rawKeys.reduce(function(a,b){
	    if (b && a.indexOf(b) < 0 ) a.push(b);
	    return a;
	},[]); // very recent approach of 'reduction' 

	var propKeys = params["propkeys"];
	if (!propKeys) {
		propKeys = allKeys;
		params["propkeys"] = allKeys;  // console.log("propKeys", propKeys); return; 
	}
		
	//	2. 	
	var av3Json  = traverse(lines, params); // propKeys, sourcePropName);

	//  3. remove empty entries (optional)
	if (propKeys != allKeys) { // console.log("compare keys:", propKeys, allKeys); 
		av3Json = clearav3Json(av3Json);
	}

	return av3Json;
}

var av3json_write = function (jsonData, params) { // filename) { 	
	var filename = params.file;
	if (!filename) filename = 'av3json_tmp.json';
	else if (path.extname(filename) != ".json") filename = filename + ".json" ; 

	var jsonString = JSON.stringify(jsonData, null, 4);

	fs.writeFile(filename, jsonString, function(err) {
	    if(err) {
	      console.log(err);
	    } else {
	      console.log("av3json saved to " + filename);
	    }
	}); 	
};

var av3json_load = function(file, processJson) {
	jsonfile.readFile(file, function(err, jsonObj) {
		// var scripts = saveScripts(jsonObj, "sources2"); // console.dir(scripts); console.log("found "+ scripts.length + " integrated scripts");  
		processJson(jsonObj);   
	})
}

var av3json_import = function(params) {	// creating av3json from apr/avx
	var file = params["file"];
	if (!file) {
		console.log("ODB-File n/a for transformation!"); 
		return ;
	}	
	var fnTokens = file.split(".");
	params["extension"] = fnTokens[fnTokens.length-1];

	var odblines = [];

	lineReader.eachLine(file, function(line, last) {
	    
	    line = line.trim(); 	

	    if (line.length)  odblines.push(line);  
		
		if (last) {   
			var av3json   = odblines_import(odblines, params); // ropKeys, sourcePropName); 

			var processor = params["main"]; 			
			if (processor) {	// console.log("Processor", processor) ; 
				processor(av3json, params);  
			} else {  
				console.log("Av3json without postprocessing!") ; console.dir(Object.keys(av3json));	// Defaultaction nach import  
				av3json_write(av3json, file); 		
			}	
		    return true; // stop reading
		}
	});
};


// from avjs_explore

var queryObject = function(av3Json, params) { // id, prop) {
	// query ONE(or none) odb-element from av3Json 
	// identified either by key or by id
	// optionaly subqueried by prop(existence) or obj[prop]=propvalue 

	var keys=[], coll, obj; 
	var id = params["id"],
		odbkey  = params["key"],
		propkey = params["prop"],
		propval = params["value"];

	if (odbkey) {  	// DIRECT : "key-based"
	
		coll = av3Json[odbkey];
		if (!coll) return ;
		
		for(var i in coll) {
			obj = coll[i];
			if (!propkey) {		// get the first 
				return obj;  //objs.push(obj); 
			} else {			// 
				if (!obj[propkey]) continue;
				if (!propval)      return obj;
				if (propval == obj[propkey]) return obj;  	
			}	
		}

	} else {		// INDIRECT : "id based" 

		for(var k in av3Json) keys.push(k);	// keys of all different obj
			
		for	(var i = 0; i < keys.length; i++) {
			key  = keys[i];
			coll = av3Json[key];
			for(var ii in coll) {
				if (ii == id) {			// console.log("Selecting key="+key," id="+id); // return; 
					obj = coll[id];
					if (!propkey) {
						return obj; // objs.push(obj); 
					} else {
						if (!obj[propkey]) break;
						if (!propval)      return obj;
						if (propval == obj[propkey]) return obj;  	
					}	
				}
			}			
		}	
	}	

}

var queryObjects = function(av3Json, objKey, flag, id) {

	var coll    = av3Json[objKey];
		nilcoll = av3Json["Nil"];

	// Collection of objects 
	if (!flag)  return coll; 

	// ids of obj-copllection 
	if (flag == "id") {
		var ids = [];
		for(var k in coll) ids.push(k);	 // console.dir(ids);
		return ids;
	}

	if (flag == "del") {
		if (id) {
			if( coll[id] ) {	// replace by NIL-object 
				delete coll[id];
				if (!nilcoll) nilcoll={};
				nilcoll[id] = null; 	
			} else {
				// var index = coll.indexOf(id);
				// if (index > -1)  coll.splice(index, 1); 
			}	
		}	
	}

	if (flag == "add") {
		if (id ) { 
			coll[id] = {}; 
		}	
	}

	// ??? remaining prop-collection
	var props = [], obj;
	for(var i in coll) {
		obj = coll[i];
		// for(var i in coll) {
		// 	if (coll[flag]) props.push(coll[flag]);	 // console.dir(ids);
		// }
	}	
	return props;
}
 
var getDependencies =  function(av3Json, params) {

	var dep, deps={}, qObj, depnames, depids, depfns; 

	if (!av3Json["Project"]) {	// A. eval always the same first object : (ODB.1  
		
		qObj = queryObject(av3Json, {id:1, prop: "Dependencies"}); 
		if (!qObj) return deps; 

		depnames = qObj["Dependencies"]; 	
		depnames = depnames.split("\\n");  	// console.dir(depnames);
		for	(i = 0; i < depnames.length; i++) {
			if (!depnames[i]) continue;  	// empty string resulting from split 
			deps[depnames[i]] = null;		
		}	

	} else {		// B. extract deps from links in second (PROJ.2 
		
		qObj = queryObject(av3Json, {key: "Project", prop: "Dependencies"});  // console.dir(ids);
		if (!qObj) return deps; 

		depids = qObj["Dependencies"];
		if (typeof depids != "object") depids=[depids];

		depfns = queryObjects(av3Json, "FN");		// console.log(fns);
		for	(var i = 0; i < depids.length; i++) {
			dep = depfns[depids[i]]; 				// console.log(i, id, dep); // return ;   
			deps[dep.Path] = depids[i]; 
		}
	}

	if (params["show"]) console.log("DependenciesLOG: ", deps);  

	return deps;
}

var removeDependencies =  function(av3Json, params) { // 

	// 1. CheckPrep
	var deps = getDependencies(av3Json, params) ; // , "id");
	if (!deps) return av3Json;	// nothing to remove 

	var depKeys = Object.keys(deps);	
	if (!depKeys.length) return av3Json;	// nothing to remove 
	// console.log("depKeys", depKeys); // return; 

	var	propKey  = "Dependencies";

	var clearObj = queryObject(av3Json, {id:1}); //console.log(i, "before", clearObj) ;
	if (!clearObj[propKey])  return av3Json; 

	var prObj = queryObject(av3Json, {id:2}); //console.log(i, "before", clearObj) ;

	// 2. 
	var delName = params["delname"], // name of dependency to delete 
		fName, odbid, clearObj, alldeps, reddeps, prdeps, index; 

	for	(var i = 0; i < depKeys.length; i++) {
		
		fName = depKeys[i];

		if (delName && (fName.indexOf(delName) < 0)) continue; 

		// A. delete dependencyPath fName 
		//    from dependencies-prop in ODB.1
	
		alldeps  = clearObj[propKey];
		if (alldeps && alldeps.length) {
			reddeps  = alldeps.replace(fName+"\\n",""); 
			if (reddeps.length < 2) {	// remove prop entirely
				delete clearObj[propKey];
			} else {					// restet reduced path into prop  
				clearObj[propKey] = reddeps;  
			}		
		}

		odbid = deps[fName];
		if (!odbid)  continue ;  // *** 

		// B. remove odbid-dependencies-line from Project.2
		//	  !! available only in apr-objects !! 

		prdeps = prObj[propKey];
		if ((typeof prdeps == "object") && (prdeps.length>1)) { // remove one entry from array 
			index = prdeps.indexOf(odbid);
			if (index > -1)  prdeps.splice(index, 1); 
		} else {	// 
			delete prObj[propKey]; 
		}	

		// C. replace obj with id=odbid by nil-obj with same id

		queryObjects(av3Json, "FN", "del", odbid);

	}	

	if (params["show"])  {
		clearObj = queryObject(av3Json, 1); 
		console.dir(clearObj);  
	}	

	return av3Json;
}

// OUTPUT functions 
var outFnMake = function(params) {  // tool 

	var suffix = params["suffix"];	// optional suffix to basename
	if (!suffix) suffix = "";		 

	var	file = params["file"],
		ext  = params["ext"],
		folder = params["folder"],
		base   = params["base"];

	if (!ext) 	 				 ext = path.extname(file);
	else if (ext.charAt(0)!=".") ext = "." + ext; 	// make it fit to output of path.extname

	if (!base) 	 base 	= path.basename(file, ext); 
	if (!folder) folder = path.dirname(file);

	if (!fs.existsSync(folder)){	// verify existence of output folder
	    fs.mkdirSync(folder);
	} 	// console.log("fn-components", folder, base, ext); 

	var  fn = folder + "/" + base + suffix + ext; 

	return fn; 
} 

var saveScripts = function(av3Json, params) { // folder, scriptext) {
	// save into a folder with uniq files for every ave-SEd

	// 1. 
	if (!params) params = {}; 
	var scripts = {}, src, fn, objkey;
	var file      = params["file"],
		scriptext = params["scriptext"],
		folder    = params["folder"];

	if (!scriptext) scriptext = "ave"; 
	params["ext"] = scriptext;

	var srcext  = path.extname(file),
		srcbase = path.basename(file, srcext),
		srcfolder = path.dirname(file);

	if (!folder) {
		params["folder"] = srcfolder+"/"+srcbase;
	}	

	if (srcext.indexOf("apr") >= 0) {
		objkey  = "SEd";
		propkey = "Source"
	} else {
		objkey  = "Script";
		propkey = "SourceCode"
	} // console.log("params", params); 

	// 2. Extract script-sources
	function unescape(srccode) {	
		// if srccode was "double escaped" before f.i. 
		// a)  in apr-doc and 
		// b)  by JSON.stringify during retransformation   	
		var nline = String.fromCharCode(10);  	// better???: String.fromCharCode(13,10)
		srccode = srccode.replace(/\\"/g, '"');			 
		srccode = srccode.replace(/\\n/g, nline);	  
		srccode = srccode.replace(/\\\\/g, "\\"); 		// reduce  \\  to  \ 		
		return srccode;
	}	

	var seds = queryObjects(av3Json, objkey); // console.dir(seds); 
	for(var k in seds)  { 
		srccode = seds[k][propkey];	// combine into one line ?? 	
		srccode = unescape(srccode); 
		scripts[seds[k]["Name"]] = srccode;    // return; 
	}	// console.dir(seds); 

	// 3. WriteSave sources into separate files
	var fn; 
	for (var name in scripts)  {	// console.log(name, scripts[name].length);
		params["base"] = name;
		// fn = folder + "/" + name + '.' + scriptext;  
		fn = outFnMake(params) ; //  console.log(name, fn);

		fs.writeFile(fn, scripts[name], function (err) {
			if (err) return console.log(err); // BREAK saving if error during save-cycle
		});
	};

	return scripts;
}

var av3js_export = function(av3Json, params) { // console.log("LOG.av3js_export", params); // return; 
	// Rewind the structure

	function propline(prop, p) {
		var  TAB = "\t", DQUOTE = '\"'; 
		if (typeof prop == "string") {
			if (prop.charAt(0)!=DQUOTE) 			prop = DQUOTE + prop;
			if (prop.charAt(prop.length-1)!=DQUOTE) prop = prop + DQUOTE;
		}	 
		var line = TAB + p + ":" + TAB + prop;  
		return line; 
	}

	// A. Create some intermediates
	var collect = {}, index = {}, coll, obj, odbset, i;
	var keys = Object.keys(av3Json);   // console.dir(keys); return; 
	
	for(var key in av3Json) {
		coll = av3Json[key];
		for(var num in coll) {
			obj = coll[num];
			odbset = {
				key: key,
				obj: obj
			};
			index[num] = parseInt(num);
			collect[num] = odbset;
		}
	}

	var iSorted = Object.keys(index).sort(function(a,b){return index[a]-index[b]});  // console.dir(iSorted);

	// B. create the odb-text
	var LF = "\n", 
		odbOut = "/3.2" + LF, 
		ic, key, prop, proptyp, subtyp, num, line, lines;

	for(var i in iSorted) {
		num  = iSorted[i];  
		inum = index[num];

		ic   = collect[num];  	// console.log("Struc", i, num, inum, ic);
		key  = ic["key"];

		line = "("+key+"." + num ; odbOut = odbOut + line +LF; // console.log(line);  

		obj  = ic["obj"];	
		if (obj)  {  //continue;  // console.log("NODATA for " + key, i);  	
			for(var p in obj) {
				prop = obj[p]; 	
				if (typeof prop == "object") {
					for(var j in prop) {
						subprop = prop[j];
						line = propline(subprop, p); odbOut = odbOut + line +LF; // console.log(line);
					}	
				} else {
					line = propline(prop, p); 
					if (line.length > 600) { // divide into chunks of 512 !!
						lines = line.match(/.{1,512}/g);   
						for(var l in lines) {
							odbOut = odbOut + lines[l] +LF; // console.log(l,lines[l]);
						} 	
					} else { 
						odbOut = odbOut + line +LF; // console.log(line);
					}	
				}
			} 
		}	
		line = ")" + LF;  odbOut = odbOut + line +LF; // console.log(line); 
	}   //console.log("FINISH odb-Output"); 	

	// C. save the new  

	var fn = outFnMake(params) ;
	fs.writeFile(fn, odbOut, function (err) {
		if (err) return console.log(err); 
		console.log("transformed and saved",file,"to",fn); 
	}); 
}

module.exports.query 	= queryObjects;
module.exports.scripts 	= saveScripts;
module.exports.deps 	= getDependencies;
module.exports.depsrem	= removeDependencies;
module.exports.export	= av3js_export

module.exports.import = av3json_import;
module.exports.load = av3json_load;
module.exports.save = av3json_write;
