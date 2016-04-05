// ******************
// Stuff for rooms
// ******************

		rooms = []; // make sure to push to this array whenever a room is made
		var max_room_id = 0; // increments every time a room is created
		var nickname;

		function Room(name, creator) { // base room constructor
			this.name = name
			this.creator = creator;
			this.users = [creator];
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
				var index = users.indexOf(user_to_remove); 
				if (index > -1) {
					users.splice(index, 1);
					console.log(user_to_remove+" removed");
					if (users.length == 0){
						console.log("no more users in room");
					}
				}
			}
		}

		function PrivateRoom (name, creator, password, blacklist) {
			Room.call(this, name, creator); // use the code from function Room
			this.password = password; // also set a password
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
			this.name = friend;
			this.creator = creator;
			this.users = [];
			this.id = max_room_id;
			max_room_id++; // auto increment the id
			// var roomButton = document.createElement("button"); // whenever a room is created, add a button for it
		}

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
 
	socket.on('message_to_server', function(data) {
		// This callback runs when the server receives a new message from the client. 
		console.log("message: "+data["message"]); // log it to the Node.JS output
		io.sockets.emit("message_to_client",{
			message:data["message"],
			sender:data["sender"],
			room:data["room"]
		 }) // broadcast the message to other users
	});

	socket.on('user_joined_room_to_server', function(data) {
		console.log("room: "+data["room"]); // log it to the Node.JS output
		io.sockets.emit("user_joined_room_to_client",{
			user:data["user"],
			room:data["room"]
		 }) // broadcast the message to other users
	});
});




