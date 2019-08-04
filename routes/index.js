var express = require('express');
var router = express.Router();
var admin = require('firebase-admin');

var serviceAccount = require('../serviceAccount.json');
var firebaseAdmin = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ice18-fe14e.firebaseio.com"
});


var db = admin.firestore();
const settings = {timestampsInSnapshots: true};
db.settings(settings);

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 16; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
  }

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'ICE-Home', isUser: false });
});

router.get('/:uname/:status', function(req, res, next) {
	var status = req.params.status
	var uname = req.params.uname
  res.render('index', { title: 'ICE-Home', isUser: status, uname: uname });
});

router.get('/editor/:id/:projectName/:username', function(req, res, next){
	var projectName = req.params.projectName;
	var projectId = req.params.id;
	var username = req.params.username;

	db.collection("projects").where('id', "==", projectId)
    .get()
    .then(function(querySnapshot) {
		if(querySnapshot.size > 0){

			db.collection("projects").where('name', "==", projectName)
				.get()
				.then(function(querySnapshot){
					if(querySnapshot.size > 0){
						 res.render('editor',{projectId: projectId, projectName: projectName, username: username});
					} else{
						res.send('Unauthorised access !!');
					}
				})
				.catch(function(error) {
					console.log("Error getting documents: ", error);
				});

		} else{
			res.send('Unauthorised access !!');
		}
	})
	.catch(function(error) {
        console.log("Error getting documents: ", error);
    });


	
});


/* POST create new project from home page */
router.post('/submitHomeUserName', function(req, res, next){
	var uname = req.body.uname;
	var uid = makeid();

	//Checking if user exists or not (if exists redirect, else create one)
	db.collection("users").where("name", "==", uname)
    .get()
    .then(function(querySnapshot) {
        if(querySnapshot.size != 0){
			//User exists, redirect to get projectname
			querySnapshot.forEach(function(doc) {
				console.log(doc.id, " => ", doc.data());
				res.redirect('/'+uname+'/'+true)
			});
		} else {
			//User does not exist, create one
			db.collection("users").doc(uname).set({
				id: uid,
				name: uname,
				timestamp: new Date().getTime()
			})
			.then(userRef =>{
				//User created, redirect
				res.redirect('/'+uname+'/'+true)
			})
			.catch(function(error) {
				console.log("Error creating documents: ", error);
			});
		}
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });
	
});

function projectExists(res,querySnapshot, pname, uname){
			//Project exists, check if user exists in project
			querySnapshot.forEach(function(projectDoc){
				db.collection("projects").doc(pname)
				.collection('users').where('name','==',uname)
				.get()
				.then(function(querySnapshotUser){
					if(querySnapshotUser.size!=0){
						//User exists in project, redirect to editor
						querySnapshotUser.forEach(function(doc) {
							console.log(doc.id, " => ", doc.data());
							res.redirect('/editor/'+projectDoc.data().id+'/'+pname+'/'+uname)
							});
					} else{
						//User doesn't exists in project, get user details
						db.collection('users').doc(uname)
						.get()
						.then(userDoc => {
							if (!userDoc.exists) {
								console.log('No such document!');
							} else {
								//Got userid, now add this user in projects->users
								db.collection('projects').doc(pname)
								.collection('users').doc(uname).set({
									id: userDoc.data().id,
									name: uname,
									timestamp: new Date().getTime()
								})
								.then(subProjectRef =>{
									db.collection('users').doc(uname)
									.collection('projects').doc(pname).set({
										id: projectDoc.data().id,
										name: pname,
										timestamp: new Date().getTime()
									})
									.then(subUserRef =>{
										res.redirect('/editor/'+projectDoc.data().id+'/'+pname+'/'+uname)
									})
									.catch(error =>{
										console.log('Error creating users->projects')
									})
								})
								.catch(error =>{
									console.log('Error creating projects->users')
								})
							}
						})
						.catch(error =>{
							console.log('Errors', error)
						})	
					}
				})
				.catch(error =>{
					console.log('Errors', error)
				})	
		})
}

function projectDoesNotExist(res,pname, uname, pid){

	db.collection("projects").doc(pname).set({
		id: pid,
		name: pname,
		timestamp: new Date().getTime()
	})
	.then(projectRef =>{
		//Project created, now add this project in users->projects
		db.collection('users').doc(uname).collection('projects')
		.doc(pname).set({
			id: pid,
			name: pname,
			timestamp: new Date().getTime()
		})
		.then(subProjectRef =>{
			//Project added, now fetch user details from username to get userid
			db.collection('users').doc(uname)
				.get()
				.then(doc => {
					if (!doc.exists) {
					console.log('No such document!');
					} else {
						//Got userid, now add this user in projects->users
						db.collection('projects').doc(pname)
						.collection('users').doc(uname).set({
							id: doc.data().id,
							name: uname,
							timestamp: new Date().getTime()
						})
						.then(subUserRef =>{
							//Everything complete, redirect to editor
							res.redirect('/editor/'+pid+'/'+pname+'/'+uname)
						})
						.catch(error =>{
							console.log('Error creating projects->users')
						})
					}
				})
				.catch(err => {
					console.log('Error getting user details ', err);
				});
		})
	})
	.catch(function(error) {
		console.log('Error creating users->project')
	});
}

router.post('/submitHomeProjectName', function(req, res, next){
	var pname = req.body.pname;
	var uname = req.body.username;
	console.log("U:" + uname + "|P:" + pname)
	var pid = makeid();

	//Checking if project exists or not (if exists redirect, else create one)
	db.collection("projects").where("name", "==", pname)
    .get()
    .then(function(querySnapshot) {
        if(querySnapshot.size != 0){
			projectExists(res,querySnapshot, pname, uname);
		} else {
			//Project does not exist, create one
			projectDoesNotExist(res,pname, uname, pid);
		}
    })
    .catch(function(error) {
        console.log("Error creating project: ", error);
    });
});

router.post('/projects/select', function(req, res, next) {
	var uname = req.body.username
	console.log(uname);
	const projects = [];
	db.collection('projects').get().then(function(querySnapshot) {
		querySnapshot.forEach(function(doc) {
			projects.push(doc.data().name);
		})
		console.log("in\n");
		console.log(projects);
		res.render('index2', { title: 'ICE-Home', uname: uname, projects: projects });
		console.log('rendered\n');
	})
});

module.exports = router;
