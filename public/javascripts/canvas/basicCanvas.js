fabric.Object.prototype.set({
	transparentCorners: false,
	cornerColor: 'rgba(102,153,255,0.5)',
	cornerSize: 12,
	padding: 5
});

document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.tooltipped');
    var instances = M.Tooltip.init(elems);
  });

  $(document).ready(function(){
    $('.tooltipped').tooltip();
  });

const projectName = $('#hiddenProjectName').val()
const userName = $('#hiddenUserName').val()

var mTimestamp = new Date().getTime();

var prevCanvas = new fabric.Canvas('mPreviewCanvas');
prevCanvas. preserveObjectStacking = true;
var canvas = new fabric.Canvas('mCanvas');
canvas. preserveObjectStacking = true;
var strokeSlider = document.getElementById("rangeStroke");
var strokeOutput = document.getElementById("strokeValue");
var alphaSlider = document.getElementById("rangeAlpha");
var alphaOutput = document.getElementById("alphaValue");
var strokeColorPicker = document.getElementById("strokeColor");
var fillColorPicker = document.getElementById("fillColor");

var rect, circle, poly;
var isDown = false, continueSelection = false;
var mCommitHtml;
var mTemplateHtml;

function displayCommit(commit){
	if(commit.exists){

		let mXml = commit.data().xml

		mXml = mXml.replace('width=','width="280"');
		mXml = mXml.replace('height=','height="210"');
		// mXml = mXml.replace('viewBox=',' preserveAspectRatio="xMidYMid meet" viewBox="0 0 900 900"')

		mCommitHtml+= '<div class="card">'+
		 mXml+
		 '<div class="container">'+
		 '<p>'+commit.data().username+'</p>'+
		 '<p>'+commit.data().timestamp+'</p>'+
		 '</div>'+
		 '</div>'
	}
}

$("card").click(function(){
	if (confirm("Render it here?")){
		$("#bsync").trigger("click");
		var strSvg = $(this).html();
		fabric.loadSVGFromString(strSvg, function(objects, options){
			objects.forEach(svg =>{
				canvas.add(svg).renderAll();
			});
		})
	}
})

function getAllCommits(){
	db.collection('projects')
	.doc(projectName).collection('svg')
	.orderBy("timestamp", "desc").get()
	.then(querySnapshot => {
			querySnapshot.forEach(displayCommit)
			document.getElementById("commits").innerHTML = mCommitHtml; 
	})
};

function displayTemplate(template){
	if(template.exists){
		console.log("Data is the: "+template.data().svg)
		let mXml = template.data().svg
		mXml = mXml.replace('width=','width="280"');
		mXml = mXml.replace('height=','height="210"');
		// mXml = mXml.replace('viewBox=',' preserveAspectRatio="xMidYMid meet" viewBox="0 0 900 900"')
		mTemplateHtml+= '<div class="card-horizontal">'+
		 mXml+
		 '</div>'
	}
}

function getAllTemplates(){
	db.collection('templates')
	.get()
	.then(function(querySnapshot){
		querySnapshot.forEach(function(doc){
			displayTemplate(doc)
			document.getElementById("templates").innerHTML = mTemplateHtml;
		})
	})
};

function listenToLatestChanges(){
	db.collection('projects')
		.doc(projectName).collection('svg').where("timestamp",">",mTimestamp)
			.onSnapshot(snapshot =>{
				snapshot.docChanges().forEach(function(change) {
					if (change.type === "added") {
						
						let mXml = change.doc.data().xml

						mXml = mXml.replace('width=','width="280"');
						mXml = mXml.replace('height=','height="210"');
						// mXml = mXml.replace('viewBox=','viewBox="0 0  1000"')
						
						//Adding Commits to list
						var mCommit = '<div class="card">'+
										mXml+
										'<div class="container">'+
										'<p>'+change.doc.data().username+'</p>'+
										'<p>'+change.doc.data().timestamp+'</p>'+
										'</div>'+
										'</div>';

						document.getElementById("commits").innerHTML = mCommit + mCommitHtml;
						mCommitHtml = mCommit + mCommitHtml; 

						//Displaying toast on new commit
						if(change.doc.data().username == userName){
							//Do nothing
						} else{
							showToast(change.doc.data().username+' made some changes !!')
						}
					}
				});
			})
}

function listenToLatestChanges(){
	db.collection('projects')
		.doc(projectName).collection('svg').where("timestamp",">",mTimestamp)
			.onSnapshot(snapshot =>{
				snapshot.docChanges().forEach(function(change) {
					if (change.type === "added") {
						
						let mXml = change.doc.data().xml

						mXml = mXml.replace('width=','width="280"');
						mXml = mXml.replace('height=','height="210"');
						// mXml = mXml.replace('viewBox=','viewBox="0 0  1000"')
						
						//Adding Commits to list
						var mCommit = '<div class="card">'+
										mXml+
										'<div class="container">'+
										'<p>'+change.doc.data().username+'</p>'+
										'<p>'+change.doc.data().timestamp+'</p>'+
										'</div>'+
										'</div>';

						document.getElementById("templates").innerHTML = mCommit + mCommitHtml;
						mCommitHtml = mCommit + mCommitHtml; 

						//Displaying toast on new commit
						if(change.doc.data().username == userName){
							//Do nothing
						} else{
							showToast(change.doc.data().username+' made some changes !!')
						}
					}
				});
			})
}

function hideProgressBar() {
    var x = document.getElementById("progressBar");
    x.style.display = "none";
}

function showProgressBar() {
    var x = document.getElementById("progressBar");
    x.style.display = "block";
}

function hidePrevProgressBar() {
    var x = document.getElementById("prevProgressBar");
    x.style.display = "none";
}

function showPrevProgressBar() {
    var x = document.getElementById("prevProgressBar");
    x.style.display = "block";
}

function showOptionsToolBar(){
	var optionsToolbar = document.getElementById("mOptionsToolbar")
	optionsToolbar.style.display = "block";
}

function hideOptionsToolBar(){
	var optionsToolbar = document.getElementById("mOptionsToolbar")
	optionsToolbar.style.display = "none";
}

function showToastSynced(){
	M.toast({html: 'Synced successfully !!'})
}

function showToastSyncError(){
	M.toast({html: 'Error syncing, please try again.'})
}

function showToast(message){
	M.toast({html: message})
}

function getExistingXml(){
	showProgressBar();
	var svgsRef = db.collection('projects')
					.doc(projectName).collection('svg');
	svgsRef.orderBy("timestamp", "desc").limit(1)
	.get()
	.then(results =>{
		if(results.empty){
			hideProgressBar();
		} else {
			var strSvg = results.docs[0].data().xml
			mTimestamp = results.docs[0].data().timestamp
			fabric.loadSVGFromString(strSvg, function(objects, options){
				objects.forEach(svg =>{
					canvas.add(svg).renderAll();
				});
				//showToast('Latest commit fetched !!');
				hideProgressBar();
			});
		}
	})
	.catch(error =>{
		showToast('Error reaching servers !!');
		hideProgressBar();
		console.log('Error fetching existing xml', error);
	})

}

function getExistingXmlPreview(){
	showPrevProgressBar();
	var svgsRef = db.collection('projects')
					.doc(projectName).collection('svg');
	svgsRef.orderBy("timestamp", "desc").limit(1)
	.get()
	.then(results =>{
		if(results.empty){
			hideProgressBar();
		} else {
			var strSvg = results.docs[0].data().xml
			fabric.loadSVGFromString(strSvg, function(objects, options){
				objects.forEach(svg =>{
					prevCanvas.add(svg).renderAll();
				});
				hidePrevProgressBar();
			});
		}
	})
	.catch(error =>{
		showToast('Error reaching servers !!');
		hidePrevProgressBar();
		console.log('Error fetching existing xml', error);
	})

}

function rgb2hex(rgb){
	if(rgb[0] == '#'){
		return rgb;
	} else{
	rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
	return (rgb && rgb.length === 4) ? "#" +
	 ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
	 ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
	 ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
	}
}

function onObjectSelected(e) {
	showOptionsToolBar();
	try{
		strokeSlider.value  = parseInt(e.target.get('strokeWidth'))
		strokeOutput.innerHTML  = e.target.get('strokeWidth')
	
		alphaSlider.value  = parseFloat((e.target.get('opacity'))*10).toString()
		alphaOutput.innerHTML  = parseFloat((e.target.get('opacity'))*10).toString()
	
		strokeColorPicker.value  = rgb2hex(e.target.get('stroke'))
		fillColorPicker.value  = rgb2hex(e.target.get('fill'))
	} catch(error){
		console.log(error)
	}
}

function onObjectSelectionCleared(e){
	hideOptionsToolBar();
}

function openPrev() {
	document.getElementById("myNav").style.width = "100%";
	prevCanvas.clear();
	getExistingXmlPreview();
}

function closePrev() {
    document.getElementById("myNav").style.width = "0%";
}

function turnOffLine(){
	if(isDown){
		canvas.selection = true; isDown = false; 
		canvas.forEachObject(object => object.set({selectable:true}))
	}
}

function turnOnLine(){
	if(!isDown){
		canvas.selection = false; isDown = true;
		canvas.forEachObject(object => object.set({selectable:false}))
	}
}

getExistingXml();
listenToLatestChanges();
getAllCommits();
getAllTemplates();


//Listen for object selected
canvas.on('object:selected', onObjectSelected);
canvas.on('selection:updated', onObjectSelected);
canvas.on('selection:cleared', onObjectSelectionCleared);

//Drawing a line
canvas.on('mouse:down', function(o){
	if(isDown) continueSelection = true
	if(isDown && continueSelection){
		var pointer = canvas.getPointer(o.e);
		var points = [ pointer.x, pointer.y, pointer.x, pointer.y ];
		line = new fabric.Line(points, {
				id: makeid(),
				fill: '#FFFFFF',
				stroke: '#000000',
				strokeWidth: 2,
				selectable: false,
				strokeLineJoin: 'bevil'
			},	false);
		canvas.add(line);
	} 
  });
  
canvas.on('mouse:move', function(o){
		if (isDown && continueSelection){
			var pointer = canvas.getPointer(o.e);
			line.set({ x2: pointer.x, y2: pointer.y });
			canvas.renderAll();
		} 
  });

	canvas.on('mouse:up', function(o){
	
		if(continueSelection && isDown){
			continueSelection = false;
			line.setCoords();
		}
  });


//Create a rectangle
$('#bSquare').click(function(options) {
	turnOffLine();
  	rect = new fabric.Rect({
		id: makeid(),
		left: 50,
		top: 50,
		width: 50,
		height: 50,
		fill: '#FFFFFF',
		stroke: '#000000',
		strokeWidth: 2
	});
	console.log(rect);
	canvas.add(rect);
	canvas.renderAll();
});

//Create a circle
$('#bCircle').click(function(options) {
	turnOffLine();
	circle = new fabric.Circle({
		id: makeid(),
		left: 50,
		top: 50,              
		radius:25,
		fill: '#FFFFFF',
		stroke: '#000000',
		strokeWidth:2
	});
	console.log(circle);
	canvas.add(circle);
	canvas.renderAll();
});

//Create a triangle
$('#bTriangle').click(function(options) {
	turnOffLine();
	var points=regularPolygonPoints(3,30);
	poly = new fabric.Polygon(points, {
		id: makeid(),
		fill: '#FFFFFF',
		stroke: '#000000',
		left: 50,
		top: 50,
		strokeWidth: 2,
		strokeLineJoin: 'bevil'
	},	false);
	console.log(poly);
	canvas.add(poly);
	canvas.renderAll();
});

//Create a line
$('#bLine').click(function(options) {
	if(isDown){
		canvas.selection = true; isDown = false; 
		canvas.forEachObject(object => object.set({selectable:true}))
	} else{
		canvas.selection = false; isDown = true;
		canvas.forEachObject(object => object.set({selectable:false}))
	}
});

//Create a hexagon
$('#bPolygon').click(function(options) {
	turnOffLine();
	var points=regularPolygonPoints(6,30);
	poly = new fabric.Polygon(points, {
		id: makeid(),
		fill: '#FFFFFF',
		stroke: '#000000',
		left: 50,
		top: 50,
		strokeWidth: 2,
		strokeLineJoin: 'bevil'
	},	false);
	console.log(poly);
	canvas.add(poly);
	canvas.renderAll();
});

//Create a star
$('#bStar').click(function(options) {
	turnOffLine();
	var points=regularStarPoints(6,30);
	poly = new fabric.Polygon(points, {
		id: makeid(),
		fill: '#FFFFFF',
		stroke: '#000000',
		left: 50,
		top: 50,
		strokeWidth: 2,
		strokeLineJoin: 'bevil'
	},	false);
	console.log(poly);
	canvas.add(poly);
	canvas.renderAll();
});

//Delete selected objects
$('#bDelete').click(function(options) {
	turnOffLine();
	var selected = canvas.getActiveObjects(),
	selGroup = new fabric.ActiveSelection(selected, {canvas: canvas});
	if (selGroup) {
		selGroup.forEachObject(function (obj) {
		canvas.remove(obj);
		});
		// Use discardActiveObject to remove the selection border
		canvas.discardActiveObject().renderAll();
	} else	return false;
});

//Sync you vector with cloud
$('#bSync').click(function(options) {
	turnOffLine();
	showProgressBar();
	db.collection('projects').doc(projectName)
		.collection('svg').add({
			username: userName,
			json: canvas.toJSON({suppressPreamble: true}).toString(),
			xml: canvas.toSVG({suppressPreamble: true}),
			timestamp: new Date().getTime()
		})
		.then(doc =>{
			mTimestamp = new Date().getTime();
			hideProgressBar();
			showToastSynced();
			console.log('Synced successfully')
		})
		.catch(error =>{
			mTimestamp = new Date().getTime();
			hideProgressBar();
			showToastSyncError();
			console.log('Error syncing: ',error)
		})
});

//Save canvas as png
$('#bSave').click(function(options) {
	turnOffLine();
	let time = new Date().getTime();
	$('#mCanvas').get(0).toBlob(blob =>{
		saveAs(blob,time+'.png');
	});
});

//Stroke range slider
strokeOutput.innerHTML = strokeSlider.value;
strokeSlider.oninput = function(){
	var activeObject = canvas.getActiveObject();
	strokeOutput.innerHTML = this.value;
	activeObject.set('strokeWidth', parseInt(this.value));
	canvas.renderAll();
}

//Alpha range slider
alphaOutput.innerHTML = alphaSlider.value;
alphaSlider.oninput = function(){
	var activeObject = canvas.getActiveObject();
	alphaOutput.innerHTML = this.value;
	activeObject.set('opacity', parseFloat((this.value)/10));
	canvas.renderAll();
}

//Stroke color picker
strokeColorPicker.addEventListener("input", function() {
	var activeObject = canvas.getActiveObject();
	activeObject.set('stroke', strokeColorPicker.value);
	canvas.renderAll();
}, false); 

//Fill color picker
fillColorPicker.addEventListener("input", function() {
	var activeObject = canvas.getActiveObject();
	activeObject.set('fill', fillColorPicker.value);
	canvas.renderAll();
}, false); 

// Custom right click menu
$(document).bind("contextmenu",function(e){
	e.preventDefault();
	console.log(e.pageX + "," + e.pageY);
	$("#cntnr").css("left",e.pageX);
	$("#cntnr").css("top",e.pageY);
   // $("#cntnr").hide(100);        
	$("#cntnr").fadeIn(200,startFocusOut());      
});

// Focus out div on click anywhere else
function startFocusOut(){
	$(document).on("click",function(){
	$("#cntnr").hide();        
	$(document).off("click");
	});
}

// Set item onClickListener on custom right click menu
$("#items > li").click(function(){
	switch ($(this).text()) { 
		case 'Copy':
			canvas.getActiveObject().clone(function(cloned) {
				_clipboard = cloned;
			});
			break;
		case 'Paste':
			_clipboard.clone(function(clonedObj) {
				canvas.discardActiveObject();
				clonedObj.set({
					left: clonedObj.left + 10,
					top: clonedObj.top + 10,
					evented: true,
				});
				if (clonedObj.type === 'activeSelection') {
					// active selection needs a reference to the canvas.
					clonedObj.canvas = canvas;
					clonedObj.forEachObject(function(obj) {
						canvas.add(obj);
					});
					// this should solve the unselectability
					clonedObj.setCoords();
				} else {
					canvas.add(clonedObj);
				}
				_clipboard.top += 10;
				_clipboard.left += 10;
				canvas.setActiveObject(clonedObj);
				canvas.requestRenderAll();
			});
			break;
		case 'Deselect':
			canvas.discardActiveObject();
			canvas.requestRenderAll();
			break;
		case 'Group Items': 
			if (!canvas.getActiveObject()) {
				return;
			}
			if (canvas.getActiveObject().type !== 'activeSelection') {
				return;
			}
			canvas.getActiveObject().toGroup();
			canvas.requestRenderAll();
			break;
		case 'Ungroup Items': 
			if (!canvas.getActiveObject()) {
				return;
			}
			if (canvas.getActiveObject().type !== 'group') {
				return;
			}
			canvas.getActiveObject().toActiveSelection();
			canvas.requestRenderAll();
			break;
		case 'Send Backwards': 
			canvas.sendBackwards( canvas.getActiveObject())
			break;		
		case 'Send to Back': 
			canvas.sendToBack(canvas.getActiveObject())
			break;
		case 'Bring to Forward':
			canvas.bringForward(canvas.getActiveObject())
			break;
		case 'Bring to Front':
			canvas.bringToFront(canvas.getActiveObject())
			break;
		default:
			break;
	}
});
