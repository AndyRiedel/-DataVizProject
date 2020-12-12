
function myFunction(){
    //controls menu functionality in thin layouts (burgerMenu)
    var x= document.getElementById("burgerMenu");
    if (x.style.display === "block") {
        x.style.display = "none";
    } else {
        x.style.display = "block";
    }
};




//**********SET CHANGES FOR VENN DIAGRAM********************************************/
//create a const array of objects for color pickers and forms, to expand as "numSets" select value changes
const pickers = [
    //attributes for generated pickers
    {type: 'color', id: 'setCColor', name: 'setCColor', value: '#0000FF'},
    {type: 'color', id: 'setDColor', name: 'setDColor', value: '#FBFF00'},
    {type: 'color', id: 'setEColor', name: 'setEColor', value: '#8C00FF'},
    {type: 'color', id: 'setFColor', name: 'setFColor', value: '#FF7B00'},
];

const labels = [
    //[for value, innerHTML]
    ['setCColor', 'Set C Color'],
    ['setDColor', 'Set D Color'],
    ['setEColor', 'Set E Color'],
    ['setFColor', 'Set F Color']
];

const vennSVG = [
    [2,  'venn2.svg'],
    [3, 'venn3.svg'],
    [4, 'venn4.svg'],
    [5, 'venn5.svg'],
    [6, 'venn6.svg']
]

//Venn Picker Change Functions
function createPicker(pickerNum){
    //accepts pickerNum as int in range [3, 6]
    //assumes form name = 'vennForm'
    if (pickerNum < 3 || pickerNum > 6){
        return 'invalid pickerNum';
    }
    //pickerNum passed will be 3 more than it's corresponding value in arrays of preset values
    //e.g. if 3 is passed, we want the 0th element in arrays: labels, pickers
    pickerNum = pickerNum - 3; 
    //create the label first
    let frm = document.getElementById('vennForm');
    let label = document.createElement('label');
    label.setAttribute('for', labels[pickerNum][0]);
    label.innerHTML = labels[pickerNum][1];
    frm.appendChild(document.createElement('br'));
    frm.appendChild(label);

    //create and append picker
    let picker = document.createElement('input');
    for (let i = 0; i < 4; i++){
        picker.setAttribute(Object.entries(pickers[pickerNum])[i][0], Object.entries(pickers[pickerNum])[i][1])
    }

        
    frm.appendChild(picker);
    picker.setAttribute("onchange","vennColorSelect(this.id)");
    //picker.onchange = vennColorSelect(picker.id);

}

function removePicker(pickerNum){
    //accepts pickerNum as int in range [3,6]
    //assumes form name = 'vennForm'
    //e.g. if 3 is passed, we want the 0th element in arrays: labels, pickers
    pickerNum = pickerNum - 3;
    //remove the label
    let frm = document.getElementById('vennForm');
    let labelToRemove = labels[pickerNum][0];
    let removeLabels = document.getElementsByTagName('LABEL');
    for (let i = 0; i < removeLabels.length; i++){
        if (removeLabels[i].htmlFor == labelToRemove) {
            frm.removeChild(removeLabels[i]);
        }
    }
    //find the picker id to remove
    let pickerToRemove = document.getElementById(Object.entries(pickers[pickerNum])[1][1]);
    frm.removeChild(pickerToRemove);

    $('form br:last-child').remove();

}


function svgPickerMatch(){
    //when called, sets all venn svg circles to their corresponding picker color
    //used to initialize image to existing picker colors
    let frm = document.getElementById('vennForm');
    let frmPickers = [];
    for (let i = 0; i < frm.childElementCount; i++){
        if (frm.children[i].type == 'color'){
            frmPickers.push(frm.children[i]);
        }
    }

    for (let i = 0; i < frmPickers.length; i++){
        vennColorSelect(frmPickers[i].id);
    }

}

//Venn Set Change Handler Function
function numSetsChange(numSets){
    //function to handle all changes when numSets select element value changes
    //numSets = selected desired number of sets
    //requirements:
    //  adjust set color picker form
    //  add inputs for anticipated intersections
    //  adjust expected svg for visual output

    //Adjust Color Picker Form
    let frm = document.getElementById('vennForm')
    
    //change the image
    changeVennSVG(numSets);
    
    
    //first get a count of existing color pickers
    let actualSets = 0;
    for (let i = 0; i < frm.childElementCount; i++){
        if (frm.children[i].type == 'color'){
            actualSets++;
        }
    }
    let setChange = numSets - actualSets;
    if (setChange > 0){
        for (let i = actualSets + 1; i <= numSets; i++){
            createPicker(i);
        }
    }
    else if (setChange < 0){
        for (let i = actualSets; i > numSets; i--){
            removePicker(i);
        }
    }

    //change the manual inputs on Data tab
    vennManualInputs(numSets);

    //call a function to set all venn colors to the picker colors
    svgPickerMatch();

}

//Venn Diagram SVG change functions
function changeVennSVG(numSets){
    console.log('Changing SVG to', numSets);
    let parent = document.getElementById('nav-viz');
    let venn = document.getElementById('venn');
    for (let i = 0; i <= 4; i++){
        if (vennSVG[i][0] == numSets){
            let newFile = vennSVG[i][1];
            parent.removeChild(venn);
            let vennNew = document.createElement('object');
            vennNew.id =  'venn';
            vennNew.type= 'image/svg+xml';
            console.log()
            vennNew.data = newFile;
            parent.appendChild(vennNew);
            vennNew.addEventListener('load', function(){writeVennDataValues();});
        }
    }
    
    

}



//Data Entry Field Functions
function setCombos(possInter){
    //input number of sets
    //output all possible combinations
    var setArray = ['A', 'B', 'C', 'D', 'E', 'F'];
    var arrayLength = setArray.length;
    var allSets =[];
    for (var i = 1; i <= possInter; i++){
        result = [];
        for (var j = 0; j < arrayLength; j++){
            if ((i & (1 << j)) !== 0){
                result.push(setArray[j]);
            }
        }
        allSets.push(result);
    }
    return allSets;
}


function createSetInput(setInter){
    //inputs ID for intersection
    //adds those inputs on the Data tab
    let labelStr = ''
    if (setInter.length == 1){
        labelStr = 'Set ' + setInter[0] + ' Only';
    }
    else {
        labelStr = 'Shared by Set ' + setInter[0];
        for (let i = 1; i < setInter.length; i++){
            labelStr = labelStr + ' and Set ' +  setInter[i];
        }
    }

    let setInterId = setInter.join('');
    let frm = document.getElementById('vennValues');
    let newLabel = document.createElement('label');
    newLabel.setAttribute('for', setInterId);
    newLabel.innerHTML = labelStr;
    let newInput = document.createElement('input');
    newInput.type = 'number';
    newInput.id = setInterId;
    newInput.name = setInterId;
    frm.appendChild(document.createElement('br'));
    frm.appendChild(newLabel);
    frm.appendChild(newInput);
    

}

function removeSetInput(setInter){
    //inputs ID for intersection
    //removes those input on the Data tab
    
    console.log(setInter);
    //remove the label
    let frm = document.getElementById('vennValues');
    for (let i = 0; i < frm.childElementCount; i++){
        console.log(frm.children[i].htmlFor);
        if (frm.children[i].htmlFor == setInter){
            console.log('Removing Label:');
            frm.removeChild(frm.children[i]);
        }
    }
    
    //remove the input
    let inputToRemove = document.getElementById(setInter);
    console.log("removing ", inputToRemove.id);
    frm.removeChild(inputToRemove);
    $('form br:last-child').remove();

}

//Change number of manual input fields available as number of sets change
function vennManualInputs(numSets){
    //a venn diagram should have (2^n)-1 possible intersections, where n=number of sets
    let possInter = 2 ** numSets - 1;
    
    //first find the number of existing text inputs
    let frm = document.getElementById('vennValues');
    let setValues = 0;
    let existingSets = [];
    for (let i = 0; i < frm.childElementCount; i++){
        if (frm.children[i].type == 'number'){
            setValues++;
            existingSets.push(frm.children[i].id);
        }
    }

    console.log(setValues, ' Current values');
    console.log(possInter, ' needed values');
    if (setValues < possInter){
        //add intersection inputs
        //for each additional set, add every poss combination of that set + other sets
        //get all possible combinations for numSets 
        let allSets = setCombos(possInter);
        for (let i = 0; i < allSets.length; i++){
            if (!existingSets.includes(allSets[i].join(''))){
                //construct input
                console.log('calling create set input for ', allSets[i]);
                createSetInput(allSets[i]);
            }
        }
    }

    if (setValues > possInter){
        let allSets = setCombos(possInter);
        for (let i = 0; i < allSets.length; i++){
            allSets[i] = allSets[i].join('');
        }
        console.log('all sets length = ', allSets.length);
        for (let i = existingSets.length - 1; i >= possInter; i--){
            //iterate backwards and remove
            console.log('Checking Set ', i, ' = ', existingSets[i]);
            if (!allSets.includes(existingSets[i])){
                console.log(existingSets[i], ' not found in allSets');
                removeSetInput(existingSets[i]);
            }
        }
    }


}





//**********END SET CHANGES FOR VENN DIAGRAM********************************************



window.onload = function (){
    if (document.getElementById('venn')){
        var svg = document.getElementById('venn');
        var svgDoc = svg.contentDocument;

    }
    else {
        var svg = document.getElementById('bar');
        var svgDoc = svg.contentDocument;
    }
}
const pickerSVGMap = [
    ['setAColor', 'setA'],
    ['setBColor', 'setB'],
    ['setCColor', 'setC'],
    ['setDColor', 'setD'],
    ['setEColor', 'setE'],
    ['setFColor', 'setF']
]


function vennColorSelect(pickerId){
    //handles when a picker color is changed
    console.log('Picker Id ', pickerId);

    let picker = document.getElementById(pickerId);
    let pickerColor = picker.value;
    let svgId = ''
    //get the corresponding svg item
    for (i = 0; i < 6; i++){
        if (pickerSVGMap[i][0] == pickerId){
            svgId = pickerSVGMap[i][1];
        }
    }
    let svgObject = document.getElementById('venn')
    let svgDoc = svgObject.contentDocument;
    let svgItem
    //if 6 sets, change stroke instead of fill
    if (svgDoc){
        svgItem = svgDoc.getElementById(svgId);
        //if 6 sets, change stroke instead of fill
        if (svgObject.valueOf().data.includes("venn6.svg")){
            svgItem.style.stroke = pickerColor;
        }
        else{
            svgItem.style.fill = pickerColor;
        }
    }
    else{
        console.log('venn contentDocument not found');
    }
    
}




function writeVennDataValues(){
    //writes all inputs from Data values tab to Venn when "Visual" tab is clicked
    //if no value input, set Venn intersection label to 0
    console.log("writeVennDataValues called");
    //get all manual inputs
    let inputs = [];
    let allInputs = document.getElementsByTagName('input');
    for (let i = 0; i < allInputs.length; i++){
        if (allInputs[i].type == 'number'){
            inputs.push(allInputs[i]);
        }
    }

    //now write those input values to the venn
    //text id = "set" + inputId + "Value" 
    let svgObject = document.getElementById('venn');
    
    
    let svgDoc = svgObject.contentDocument;
    if(svgDoc){
        for (let i = 0; i < inputs.length; i++){
            let toWrite = inputs[i].value;
            if (toWrite == ""){
                toWrite = 0;
            }
            let svgTextId = "set" + inputs[i].id + 'Value';
            let svgTextObject = svgDoc.getElementById(svgTextId);
            svgTextObject.innerHTML = toWrite;
        }
    }
    else{

    }

    //because color changes after a new svg is loaded (numSets changes) can't
    //locate the svg contentDocument, iterate through the picker colors and load here as well
    //get all the pickers
    
    for (let i = 0; i < allInputs.length; i++){
        if (allInputs[i].type == 'color'){
            vennColorSelect(allInputs[i].id);
        }
    }
    

}


/***********************END VENN ***********************/
/************************BAR****************************/

//to draw a bar, we need: 
//  all bars min/max for scale
//  count of bars
//  bar color (can initialize at black)
//  for each bar:
//      bar value
//      bar label

// We'll store bars in an array of arrays, with parent array (arr1).length = n and child arrays (arr2).length = 2


//function to construct parent array from Inputs: xAxis, yAxis
function barData(){
    //inputs nothing, outputs array containing bar chart data
    //need to control for cases where input arrays are different length
    let returnArray = []
    let xArray = []
    let yArray =[]
    let xAxis = document.getElementById('xAxis');
    let yAxis = document.getElementById('yAxis');
    xArray = xAxis.value.split(',');
    yArray = yAxis.value.split(',');
    for (let i = 0; i < xArray.length; i++){
        returnArray.push([xArray[i].trim(), yArray[i].trim()]);
    }

    return returnArray;

}

function barConstructor(xVal, yVal, width, height, xLabel){
    //default element values
    let fontSize = "1em";
    let dy = "1em"
    let namespace = 'http://www.w3.org/2000/svg';
    let svgElement = document.getElementById('bar');
    let svgDoc = svgElement.contentDocument;
    let svgBarchart = svgDoc.getElementsByTagName('svg')[0];

    //g container
    let barGroup = document.createElementNS(namespace, "g");
    barGroup.setAttribute("class", "bar"); 

    //bar element
    let svgBar = document.createElementNS(namespace, "rect");
    svgBar.setAttribute("width", width);
    svgBar.setAttribute("height", height);
    svgBar.setAttribute("x", xVal);
    svgBar.setAttribute("y", yVal);
    
    //text label
    let svgText = document.createElementNS(namespace, "text");
    
    svgText.setAttribute("y", yVal + height);
    svgText.setAttribute("dy", dy);
    svgText.setAttribute("font-size", fontSize);
    svgText.innerHTML = xLabel;
    svgText.setAttribute("x", xVal + (width / 2) - (svgText.getBBox().width/2.0));

    //group bar & text
    barGroup.appendChild(svgBar);
    barGroup.appendChild(svgText);

    //and append group to svg
    svgBarchart.appendChild(barGroup);


}

//with input data, define other values needed
function drawBar(){
    //collects data from xAxis, yAxis and barColor
    //makes necessary changes to bar.svg

    let barColor = document.getElementById('barColor').value;
    let barDataArray = barData();
    //just return now if no data
    if (barDataArray.length == 0){
        return;
    }
    //min/max/length
    let barCount = barDataArray.length;
    let barMin = 0;
    let barMax = 0;
    for (let i = 0; i < barCount; i++){
        console.log("minMax", i);
        if (parseInt(barDataArray[i][1]) < barMin){
            barMin = parseInt(barDataArray[i][1]);
        }
        if (parseInt(barDataArray[i][1]) > barMax){
            console.log('Bar Max ', barMax, ' vs ', barDataArray[i][1]);
            barMax = parseInt(barDataArray[i][1]);
        }
    }

    console.log(barColor + ' ' + barMin + ' ' + barMax + ' ' + barCount)
    //having the parameters, create a templatete for the bar

    var svgElement = document.getElementById('bar');
    var svgDoc = svgElement.contentDocument;
    //first clear any existing bars
    let existingBars = svgDoc.getElementsByClassName('bar');
    let existingBarCount = existingBars.length;
    for (let i = 0; i < existingBarCount; i++){
        existingBars[0].remove();
    }
    //then call a constructor for each new bar, and insert into array
    //to construct a bar, we need (will set color by class at the end) 
    //  x/y vals (bar x label / bar y value label) 
    //  bar height
    //  bar width (how thick  is the bar)
    //  bar x location

    //the bar svg is 400 px, so we need to scale all y values between 5px - 395px
    //first find total range of y values
    let yRange = barMax - barMin;
    let margin = 40;
    let svgHeight = parseInt(svgDoc.getElementById('barchart').getAttribute('height'))
    let totalPxY = svgHeight - margin;
    
    // pxPerYVal is expected to scale a given yValue to px for drawing
    let pxPerYVal = totalPxY / yRange;
    console.log('total ', totalPxY, ' range ', yRange)
    //scaling for width/number of bars
    //n bars = barDataArrray.length
    let totalPxX = parseInt(svgDoc.getElementById('barchart').getAttribute('width')) - margin;
    let barGapPct = .2; //how much of of total x space is empty between bars
    //width for each x = [total width - margin] * [1-gap percent] / n bars
    let pxPerXVal = (totalPxX * (1-barGapPct))/barDataArray.length;

    //bar x location = totalPxX / number bars, should be array of values
    //first bar x loc is width/2, each subsequent is prior x loc + width + bar gap
    let barLocX = []
    let barGapPx = (totalPxX * barGapPct)/barDataArray.length;
    let xLoc = pxPerXVal/2;
    barLocX.push(xLoc);
    for (let i = 1; i < barDataArray.length; i++){
        xLoc = xLoc + pxPerXVal + barGapPx;
        barLocX.push(xLoc);
    }

    //for each element, y = maxHeight - rectangle height
    for (let i = 0; i <barDataArray.length; i++){
        let xVal = barLocX[i];
        let xLabel = barDataArray[i][0];
        let height = barDataArray[i][1] * pxPerYVal;
        console.log('for ', barDataArray[i][1], ' at ', pxPerYVal, ' = ', height);
        let yVal = totalPxY - height;
        barConstructor(xVal, yVal, pxPerXVal, height, xLabel);
        
    }
    
    //finally, set the color = to the color picker
    let barPicker = document.getElementById('barColor');
    let bars = svgDoc.getElementsByClassName('bar');
    for (let i = 0; i < bars.length; i++){
        bars.item(i).style.fill = barPicker.value;
    }
    
}

function testDrawBar(testCase){
    if(testCase==1){
        document.getElementById('xAxis').value = 'a,b,c,d,e,f';
        document.getElementById('yAxis').value = '1,2,3,4,5,6';
    }
    if(testCase==2){
        document.getElementById('xAxis').value = 'Jan, Feb, Mar, Apr, May, Jun, Jul';
        document.getElementById('yAxis').value = '75, 24, 68, 90, 23, 35, 21';
    }
    drawBar();
}

/***********************FILE LOADER***********************/


function fileSelectTrigger(isVenn){
    //this is the function triggered when a user selects a venn diagram file
    let loadedFile = document.getElementById("inputGroupFile01").files[0];
    let inputLabel = document.getElementsByClassName("custom-file-label")[0];
    inputLabel.innerText = loadedFile.name;

    readFileIntoArray(loadedFile, fileLoadCallBack, isVenn);

}



function fileLoadCallBack(reader, isVenn){
    console.log(reader);
    console.log(reader.result);
    let dataArray = reader.result.split('\n');
    console.log('Data Array Length: ', dataArray.length);
    for (let i = 1; i < dataArray.length; i++){
        dataArray[i] = dataArray[i].split(',');
    }

    dataArray.splice(0, 1);
    if (isVenn){
        vennFileLoadHandler(dataArray);
    }
    else {
        barFileLoadHandler(dataArray);
    }
}

function readFileIntoArray(loadedFile, fileLoadCallBack, isVenn){
    console.log(loadedFile);
    var reader = new FileReader();
    reader.onload = function(e){
                    console.log("onload functiion evoked");
                    fileLoadCallBack(this, isVenn);
                };
    reader.readAsText(loadedFile)
}

function barFileLoadHandler(dataArray){
    let xInput = document.getElementById("xAxis");
    let yInput = document.getElementById("yAxis");
    
    //need to sort arrays in dataArray by x value
    dataArray.sort(barSort);
    if (dataArray[0][0] == ""){
        dataArray.splice(0, 1);
    }
    console.log("sorted array: \n", dataArray);
    //then take each dataArray element, and assign 1st component to x and 2nd to y
    let xString = ''
    let yString = ''
    for (let i = 0; i < dataArray.length; i++){
        xString = xString + dataArray[i][0] + ',';
        yString = yString + dataArray[i][1] + ',';
    }
    xString = xString.slice(0, -1);
    yString = yString.slice(0, -1);
    xInput.value = xString;
    yInput.value = yString;

}

function vennFileLoadHandler(dataArray){
    //with a loaded file, parse into values
    //and load into appropriate elements on screen
    //loadedFile assumed to be 2 columns w/ n rows
    //where first column is id and second column is an occurrence of that ID in a set
    //does not de-duplicate
//    if(!loadedFile){
 //       return -1;
  //  }
   // dataArray = readFileIntoArray(loadedFile);
    //need total number of sets
    //and count of items per set
    //each unique id needs to be grouped by what sets it's associated with
    //Expected Results:
//    A	  12
//    B	  14
//    AB  4
//    C   18
//    AC  0
//    BC  5
//    ABC 14

    numberOfRecords = 0;
    dataSet = {}
    knownSets = []

    //create an object with each unique id and the sets it's associated with
    for (var i = 0; i < dataArray.length; i++){
        if (!knownSets.includes(dataArray[i][1]) && dataArray[i][1]){
            //if we haven't seen this set label before, log it
            knownSets.push(dataArray[i][1]);
            console.log("New Set ", dataArray[i][1], " found");
        }
        if (Object.keys(dataSet).includes(dataArray[i][0])){
            //if we already have this record in the dataSet, need to append new set 
            dataSet[dataArray[i][0]].push(dataArray[i][1]);
            numberOfRecords++;
        }
        else {
            //else create a new array with one value being id's member set
            dataSet[dataArray[i][0]] = [dataArray[i][1]];
        }
    }

    for (let i = 0; i < knownSets.length; i++){
        if (knownSets[i] == undefined){
            knownSets.splice(i, 1);
        }
    }
    console.log("knownSets Length:", knownSets.length);
    if (knownSets.length < 2 | knownSets.length > 6){
        console.log('Too many or too few sets with: ', knownSets.length);
        return;
    }

    //map sets to A, B, C, etc.
    setsMap = {}
    setsMapDefault = {
        0:'A',
        1:'B',
        2:'C',
        3:'D',
        4:'E',
        5:'F'    
    }
    for (let i = 0; i < knownSets.length; i++){
        setsMap[knownSets[i]] = setsMapDefault[i];
    }

    //now we need to:
    //  clean existing set labels and map into new labels
    //  sort the new labels
    //  count the new labels
    setMemberCount = {}
    var counter = 0;
    dataSetKeys = Object.keys(dataSet);
    for (let i = 0; i < dataSetKeys.length; i++){
        if (dataSet[dataSetKeys[i]]){
            counter++;
            let recordArray = dataSet[dataSetKeys[i]];
            for (let i = 0; i < recordArray.length; i++){
                recordArray[i] = setsMap[recordArray[i]];
            }
            recordArray = recordArray.sort();
            recordArray = recordArray.join('');
            if (Object.keys(setMemberCount).includes(recordArray)){
                setMemberCount[recordArray] = setMemberCount[recordArray] + 1;
            }
            else {
                setMemberCount[recordArray] = 1;
            }
            dataSet[dataSetKeys[i]] = recordArray;
        }
    }

    //we should now have, through setMemberCount, a list of each set (in our terms)
    //and it's corresponding value (e.g. A = 10, B = 30, AB = 5), total of 45 records
    //so we write those to the "Enter Manually" fields
    //but first we have to make sure ther are fields ready for them to enter
    let numSets = document.getElementById('numSets');
    if (knownSets.length != numSets.value){
        numSets.value = knownSets.length;
        numSetsChange(knownSets.length);
    }
    //now iterate through setMemberCount and load them up
    memberKeys = Object.keys(setMemberCount);
    for (let i = 0; i < memberKeys.length; i++){
        document.getElementById(memberKeys[i]).value = setMemberCount[memberKeys[i]];   
    }




}

function barSort(a, b){
    console.log('sorting', a, b, parseFloat(a[0]));
    if (parseFloat(a[0]) && parseFloat(b[0])){
        console.log(a[0], ' is number and ', b[0], ' is number');
        if (parseFloat(a[0]) < parseFloat(b[0])) return -1;
        if (parseFloat(a[0]) > parseFloat(b[0])) return 1;
        return 0;
    }
    if (a[0] < b[0]) return -1;
    if (a[0] > b[0]) return 1;
    return 0;
}
