// ******************
// Stuff for rooms
// ******************

		rooms = []; // make sure to push to this array whenever a room is made
		var max_room_id = 0; // increments every time a room is created
		online_users = [''];
		var now = new Date();

		function Room(name, creator) { // base room constructor
			this.type = "room";
			this.name = name;
			this.creator = creator;
			this.users = [];
			this.id = max_room_id;
		 	max_room_id++; // auto increment the id
		// 	var roomButton = document.createElement("button"); // whenever a room is created, add a button for it

		// 	$('.chatrooms').append($(roomButton).attr({
		// 		class : "list-group-item",
		// 		value : this.name,
		// 	id : this.id,  // id of the room, used to identify tab and tab content
		// 	href :"#room_"+this.id,
		// 	'data-toggle' : "tab"
		// }).text(this.name)); 
	}

	Room.prototype = {
			constructor: Room, // assign/(override?) constructor
			addUser:function (user_to_add)  { // methods. Add user to the users array in a room
				this.users.push(user_to_add);
				console.log(user_to_add+" added");
				// FIXME refresh users in room 
				// var userButton = document.createElement("button");
				// $('.current_users').append($(userButton).attr({
				// 	class : "list-group-item",
				// 	value : user_to_add,
				// 	// id : users[i],  // id of the room, used to identify tab and tab content
				// 	// href :"#room_"+this.id,
				// 	'data-toggle' : "tab"
				// }).text(user_to_add));
			},
			removeUser:function (user_to_remove)  { // Remove user from the users array in a room
				var index = this.users.indexOf(user_to_remove); 
				if (index > -1) {
					this.users.splice(index, 1);
					console.log(user_to_remove+" removed");
					if (this.users.length == 0){
						console.log("no more users in room");
					}
				}
			}
		}

		function PrivateRoom (name, creator, password, blacklist) {
			Room.call(this, name, creator); // use the code from function Room
			this.password = password; // also set a password
			this.type = "privateRoom"
			if (typeof blacklist === 'undefined'){ // initialize empty blacklist if not specified
				this.blacklist = [];
			}else{
				this.blacklist = blacklist; // else initialize blacklist
			}	
		}
		var tmp = function(){}; // so that it doesn't copy the Room constructor. Refer to the second-best answer here: http://stackoverflow.com/questions/4152931/javascript-inheritance-call-super-constructor-or-use-prototype-chain
		tmp.prototype = Room.prototype;
		PrivateRoom.prototype = new tmp(); // inherit the prototypes and a blank constructor.
		PrivateRoom.prototype.constructor = PrivateRoom; //override constructor
		PrivateRoom.prototype.banUser = function (user_to_ban){ // add user to blacklist of a room
			this.blacklist.push(user_to_ban);
			console.log(user_to_ban+" banned");
		}	

		function twoPersonRoom(creator, friend) { // base room constructor
			for (var i = 0; i < rooms.length; i++){
				if ((rooms[i].name == creator && rooms[i].creator == friend) || (rooms[i].name == friend && rooms[i].creator == creator)){
					return rooms[i];
				}
			}
			this.type = "twoPersonRoom";
			this.name = friend;
			this.creator = creator;
			this.users = [];
			this.id = max_room_id;
			max_room_id++; // auto increment the id
			// var roomButton = document.createElement("button"); // whenever a room is created, add a button for it
		}

		rooms.push(new Room("General Discussion", "theCreator"));
		rooms.push(new Room("Anime", "theCreator"));
		rooms.push(new Room("School", "theCreator"));
		rooms.push(new PrivateRoom("Private (pw:abc)", "theCreator", "abc"));
		// testroom.users.push('Joe');
		// testroom.users.push('sep');
		// testroom.users.push('ine');
		// for (var i = 0; i < rooms.length; i++){
		// 	rooms[i].removeUser("theCreator");
		// }
// ********************
// Stuff for socket.io
// ********************

// Require the packages we will use:
var http = require("http"),
socketio = require("socket.io"),
fs = require("fs");

// Listen for HTTP connections.  This is essentially a miniature static file server that only serves our one file, client.html:
var app = http.createServer(function(req, resp){
	// This callback runs when a new connection is made to our HTTP server. 
	fs.readFile("group-client.html", function(err, data){
		// This callback runs when the client.html file has been read from the filesystem. 
		if(err) return resp.writeHead(500);
		resp.writeHead(200);
		resp.end(data);
	});
});
app.listen(3456);

// Do the Socket.IO magic:
	var io = socketio.listen(app);
io.sockets.on("connection", function(socket){
	// This callback runs when a new Socket.IO connection is established.
	sendAllRooms();
	io.sockets.emit("user_signup_to_client", online_users); // send online users
 	
// send all rooms
 	function sendAllRooms(){
 		socket.emit("send_all_rooms",rooms);
 	}

	socket.on('user_signup_to_server', function(data) {
		// This callback runs when the server receives a new message from the client. 
		var new_user = data["user"];
		if(online_users.indexOf(new_user)==-1 && new_user!=''){
			online_users.push(new_user);
			console.log(online_users);
			io.sockets.emit("user_signup_to_client", online_users); // broadcast the message to other users
		}
		else{
			io.sockets.emit("user_signup_to_client", false); // broadcast the message to other users
		}
	});

 	socket.on('message_to_server', function(data) {
		// This callback runs when the server receives a new message from the client. 
		// console.log("message: "+data["message"]); // log it to the Node.JS output
		now = new Date();
		io.sockets.emit("message_to_client",{
			message:data["message"],
			sender:data["sender"],
			room:data["room"],
			time:now
		 }) // broadcast the message to other users
	});

 	socket.on('user_joined_room_to_server', function(data) {
		console.log("room: "+data["room"]); // log it to the Node.JS output
		if(rooms[data["room"]].type =="twoPersonRoom"){
			socket.broadcast.emit("user_joined_room_to_client",{ // added broadcast here.
				user:data["user"],
				room:data["room"]
			 }) // broadcast the message to other users
		}
		else if(rooms[data["room"]].users.indexOf(data["user"])==-1){ // if user is not already in room
			if (rooms[data["room"]].type == "privateRoom" && rooms[data["room"]].blacklist.indexOf(data["user"])>-1){ // if on the blacklist
				console.log("banned usr attempt to join");
				socket.emit("cannot_join",{ // added broadcast here.
					message:"You have been banned from this room"
			 	});
			}
			else{
				console.log("user joining");
				rooms[data["room"]].addUser(data["user"]);
				socket.broadcast.emit("user_joined_room_to_client",{ // added broadcast here.
					user:data["user"],
					room:data["room"]
				 }); // broadcast the message to other users
			}
		}
		// else{
		// 	socket.broadcast.emit("user_joined_room_to_client",{ // added broadcast here.
		// 		user:data["user"],
		// 		room:data["room"]
		//  }) // broadcast the message to other users
		// }
	});

 	socket.on('new_room_to_server', function(data) {
		// This callback runs when the server receives a new message from the client. 
		var new_room = new Room(data["room_name"], data["creator"]);
		rooms.push(new_room);
		io.sockets.emit("new_room_to_client",new_room); // broadcast the message to other users
	});

	socket.on('new_2person_room_to_server', function(data) {
		// This callback runs when the server receives a new message from the client.
		var new_2p_room = new twoPersonRoom(data["room_name"], data["creator"]);
		rooms.push(new_2p_room);
		io.sockets.emit("new_2person_room_to_client",new_2p_room); // broadcast the message to other users
	});

	socket.on('new_private_room_to_server', function(data) {
		// This callback runs when the server receives a new message from the client.
		var new_p_room = new PrivateRoom(data["room_name"], data["creator"], data["password"],[]);
		rooms.push(new_p_room);
		io.sockets.emit("new_private_room_to_client",new_p_room); // broadcast the message to other users
	});

	socket.on('kick_from_room_to_server', function(data) {
		if (rooms[data['room']].creator == data['user_performing_action'] && rooms[data['room']].type == "privateRoom" && (rooms[data['room']].users.indexOf(data['user_to_kick']) >-1) ){
			//console.log("before remove users are "+rooms[data['room']].users);
			rooms[data['room']].removeUser(data['user_to_kick']);
			console.log("emitting");
			io.sockets.emit("kick_from_room_to_client",{ // added broadcast here.
				user:data["user_to_kick"],
				room:data["room"]
		}); // broadcast the message to other users
		}
	});

	socket.on('ban_from_room_to_server', function(data) {
		if (rooms[data['room']].creator == data['user_performing_action'] && rooms[data['room']].type == "privateRoom" ){
			//console.log("before remove users are "+rooms[data['room']].users);
			rooms[data['room']].removeUser(data['user_to_ban']);
			rooms[data['room']].banUser(data['user_to_ban']);
			console.log("emitting ban");
			io.sockets.emit("ban_from_room_to_client",{ // added broadcast here.
				user:data["user_to_ban"],
				room:data["room"]
		}); // broadcast the message to other users
		}
	});

	socket.on('user_leave_to_server', function(data) {
		console.log(data["room"]);
		rooms[data['room']].removeUser(data['user']);
		io.sockets.emit("user_leave_to_client",{ // added broadcast here.
				user:data["user"],
				room:data["room"]
		});
	});
	


 });




