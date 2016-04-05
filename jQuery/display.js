rooms = []; // make sure to push to this array whenever a room is made
var max_room_id = 0; // increments every time a room is created

// Hi Dylan!
// Things I've done, 04/04/16:
// Moved creating a div for each room from the room constructor, to line ~104 when a room button is clicked
// Consolidated things like activating a tab and displaying users into the showRoom function
// Refactored the private convo things to make it more object-oriented, make it a room object, to make things more standardized
// Refactored the code to use the createRoomAndTab, to keep things more standardized
// Banged my head against the wall but cant seem to fix the bug you mentioned
// Made a addMessage function that the socket.io stuff can call

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
	var roomButton = document.createElement("button"); // whenever a room is created, add a button for it
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
			// id : users[i],  // id of the room, used to identify tab and tab content
			// href :"#room_"+this.id,
			'data-toggle' : "tab"
		}).text(users[i]));
	};
}

function showRoom(room_id){
	$('ul.nav-tabs li.active').removeClass('active');
	$('#tab_'+room_id).addClass('active'); // Why is this not working???
	$('#tab_'+room_id).tab('show');
	displayUsers(rooms[room_id]);
}

function createRoomAndTab(id, name){
	if ($('#tab_'+id).length == 0){ // if tab doesn't already exist
		var roomTab = $("<li>").attr('id','tab_'+id).append(// make and display new tab
			$("<a>").attr({
				href :"#room_"+id,
				'data-toggle' : "tab"
			}).text(name).append("<button class='close closeTab' type='button' >×</button>")
			);
		// moved this from the room constructor to here
		$('.nav-tabs').append(roomTab);
		var chat_space = document.createElement("div");
		var chat_list_group = document.createElement("ul")
		$(chat_space).append($(chat_list_group).attr({
			class : "list-group"
		}));
		$('.tab-content').append($(chat_space).attr({
			class : "tab-pane pre-scrollable",
			id :"room_"+id,
		})); 
		if (id == 1){
			addMessage(1, "test user", "test message");
		}
	}
	showRoom(id);
}

// Detect if tabs or buttons are clicked, if so show their content
function addButtonTabListeners(){
	$(".chatrooms").on("click", "button", function(event){
		event.preventDefault();
		var id = $(this).attr("id");
		createRoomAndTab(id, $(this).attr("value"));
	});

	$(".current_users").on("click", "button", function(event){
		event.preventDefault();
		var convoRoom = new twoPersonRoom("person1", $(this).attr("value"));
		var id = convoRoom.id;
		rooms.push(convoRoom);
		createRoomAndTab(id, $(this).attr("value"));
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
		// $(this).tab('show');
		displayUsers(rooms[id]);
	});
}

function addMessage(room_id, user, message){
	// call this in the socket.io stuff
	$('#room_'+room_id+' .list-group').append(
		$("<li>").attr('class', 'list-group-item').append(
			$("<span>").attr('class', 'message').text(message),
			$("<br>"),
			$("<small>").attr('class', "text-muted").text(user)
		));
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
