# Exploring AV3-documents
Access content of all AV3-documents structured as "ODB" (apr, avx, avl) after translating into avjs-Syntax (json-files). 
Mainly used to reactivate gis knowhow "hidden" in Arcview projects.

- pathes of data processed
- legends created to map themes
- scripts used to process data   

## Functions running within av3
The project **av3_explore.apr** contains two basic tools applicable to arbitrary further av3-objects (-.apr , -.avx):

1. Using the tool "odb2Json" (related to button "") av3-objects are translated into avjs-syntax (json-documents), z.B.:
- abc.apr --> abc.apr.json   
- xyz.avx --> xyz.avx.json
 
2. The Tool "export-ave" exports all scripts defined within av3-objects as [scriptname].ave - files into an exportdirectory [objectname] 

## Functions running nodejs

1. avjs_module.js:  library of methods 
    - to translate between av3-syntax and avjs-syntax (both directions) .
    - to manipulate avjs 
2. avjs_main.js:    set of tasks (??? convert to gulp-file ???)  

## Integration with gulp
tbd

## Desktop-Interface with nwjs
tbd
