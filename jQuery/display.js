rooms = []; // make sure to push to this array whenever a room is made
var max_room_id = 0; // increments every time a room is created

// Hi Dylan!
// Put all the files in a public_html directory, and point your browser to client.html. Let make the thing without socket.io first.
//
// Things I've done:
// Created the prototypes (classes) for Room and PrivateRoom, and added some methods for them.
// To create them refer to line 98
// Made buttons for rooms
// Made a tab appear/be selected + show content (hardcoded in client.html) if the button is clicked
// Made a tab be selected and its content appear if it is clicked
// Also added some ideas for the creative in the readme
//
// I ask Adam about the creative later. Take it away!


function Room(name, creator) { // base room constructor
	this.name = name
	this.creator = creator;
	this.users = [creator];
	this.id = max_room_id;
	max_room_id++; // auto increment the id
	var roomButton = document.createElement("button"); // whenever a room is created, add a button for it

	$('.chatrooms').append($(roomButton).attr({
	class : "list-group-item",
	value : this.name,
	id : this.id,  // id of the room, used to identify tab and tab content
	href :"#room_"+this.id,
	'data-toggle' : "tab"
}).text(this.name)); 

	var chat_space = document.createElement("div"); 
	$('.tab-content').append($(chat_space).attr({
	class : "tab-pane",
	id :"room_"+this.id,
})); 

}

function displayUsers(current_room){
	$('.current_users').empty();
	// need to remove the current user first; then add 
	users = current_room.users;
	for (var i = users.length - 1; i >= 0; i--) {	
		var userButton = document.createElement("button"); // whenever a room is created, add a button for it
			$('.current_users').append($(userButton).attr({
			class : "list-group-item",
			value : users[i],
			id : users[i],  // id of the room, used to identify tab and tab content
			href :"#room_"+this.id,
			'data-toggle' : "tab"
		}).text(users[i]));
	};
}

Room.prototype = {
	constructor: Room, // assign/(override?) constructor
	addUser:function (user_to_add)  { // methods. Add user to the users array in a room
		this.users.push(user_to_add);
		console.log(user_to_add+" added");
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

// Detect if tabs or buttons are clicked, if so show their content
function addButtonTabListeners(){
	$(".chatrooms").on("click", "button", function(event){
		event.preventDefault();
		var id = $(this).attr("id");
		if ($('#tab_'+id).length == 0){ // if tab doesn't already exist
			var roomTab = $("<li>").attr('id','tab_'+id).append(// make and display new tab
				$("<a>").attr({
					href :"#room_"+id,
					'data-toggle' : "tab"
				}).text($(this).attr("value")).append("<button class='close closeTab' type='button' >×</button>")
			);
			$('.nav-tabs').append(roomTab);
		}
		$('ul.nav-tabs li.active').removeClass('active');
		$('#tab_'+id).addClass('active');
		$(this).tab('show');
		displayUsers(rooms[id]);
	});

	$(".current_users").on("click", "button", function(event){
		event.preventDefault();
		var id = $(this).attr("id");
		if ($('#tab_'+id).length == 0){ // if tab doesn't already exist
			var userTab = $("<li>").attr('id','tab_'+id).append(// make and display new tab
				$("<a>").attr({
					href :"#room_"+id,
					'data-toggle' : "tab"
				}).text($(this).attr("value")).append("<button class='close closeTab' type='button' >×</button>")
			);
			$('.nav-tabs').append(userTab);
		}
		$('ul.nav-tabs li.active').removeClass('active');
		$('#tab_'+id).addClass('active');

		if ($('#room_'+id).length == 0){
		var chat_space = document.createElement("div"); 
			$('.tab-content').append($(chat_space).attr({
			class : "tab-pane",
			id :"room_"+this.id,
		})); 
		}
		$(this).tab('show');
		$('.current_users').empty();
	});

	$(".nav-tabs").on("click", "button", function(event){
        var tabContentId = $(this).parent().attr("href");
        $(this).parent().parent().remove(); //remove li of tab
        $('.nav-tabs a:last').tab('show'); // Select first tab
        $(tabContentId).remove(); //remove respective tab content
    });

	$(".nav-tabs").on("click", "a", function(event){
		event.preventDefault();
		var id = $(this).attr("href").slice(6);
		$(this).tab('show');
		if (!isNaN(id)) {		
			displayUsers(rooms[id]);
		}
		else{
		$('.current_users').empty();
		}
	})



}

function doUponLoading(event){
	addButtonTabListeners();
	// Where I test things out
	rooms.push(new PrivateRoom("roomName", "theCreator", "abcd"));
	rooms.push(new PrivateRoom("Sun", "Moon", "abcd"));
	rooms.push(new PrivateRoom("hey", "hi", "abcd"));
	// testp = new PrivateRoom("hey", "hi", "abcd")
	testroom = new Room("TestRoom", "Dylan","asdd");
	testroom.users.push('Joe');
	testroom.users.push('sep');
	testroom.users.push('ine');
	rooms.push(testroom);
	console.log(rooms);
}
