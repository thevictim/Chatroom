rooms = [];
var max_room_id = 0; // increments every time a room is created

// Hi Dylan!
// Put all the files in a public_html directory, and point your browser to client.html. Let make the thing without socket.io first.
//
// Things I've done:
// Created the prototypes (classes) for Room and PrivateRoom, and added some methods for them.
// To create them refer to line 98
// Made buttons for rooms
// Made a tab appear/be selected if the button is clicked <--- trying to figure out bug that content won't show
// Made a tab be selected and its content (hardcoded in client.html) appear if it is clicked
// Also added some ideas for the creative in the readme
//
// Tomorrow morning when I ask Adam stuff I'll also see if he can help fix the bug about content not showing when a new tab is added
// Otherwise, I won't touch it after 11.30am. Take it away!


function Room(name, creator) { // base room constructor
	this.name = name
	this.creator = creator;
	this.users = [creator];
	this.id = max_room_id;
	max_room_id++;
}

Room.prototype = {
	constructor: Room, // assign/(override?) constructor
	addUser:function (user_to_add)  { // methods.
		this.users.push(user_to_add);
		console.log(user_to_add+" added");
	},
	removeUser:function (user_to_remove)  {
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
	Room.call(this, name, creator);
	this.password = password;
	if (typeof blacklist === 'undefined'){
		this.blacklist = [];
	}else{
		this.blacklist = blacklist;
	}	
}
var tmp = function(){}; // so that it doesn't copy the Room constructor. Refer to the second-best answer here:http://stackoverflow.com/questions/4152931/javascript-inheritance-call-super-constructor-or-use-prototype-chain
tmp.prototype = Room.prototype;
PrivateRoom.prototype = new tmp(); // inherit
PrivateRoom.prototype.constructor = PrivateRoom; //override constructor
PrivateRoom.prototype.banUser = function (user_to_ban)  { // add banUser method
	this.blacklist.push(user_to_ban);
	console.log(user_to_ban+" banned");
}	


function showRoomButtons(){
	for (var i = 0; i < rooms.length; i++){
		var roomButton = document.createElement("button");
		$(roomButton).attr({
			class : "list-group-item",
			value : rooms[i].name,
			id : rooms[i].id // id is auto incremented whenever a new room is constructed
		});
		// how to add nested DOM with jquery: http://stackoverflow.com/questions/5317890/how-do-i-create-these-nested-dom-elements-with-jquery
		// make sure to append any variable as text! same reason not to use innerHTML.
		// inspect element to see what the HTML structure ultimately looks like
		 $('.chatrooms').append($(roomButton).text(rooms[i].name).click(function(event){ // if click on the button
		 	event.preventDefault();
		 	var id = $(this).attr("id"); // get the id
		 	if ($('#tab_'+id).length == 0){ // if tab doesn't already exist
				var roomTab = $("<li>").attr('id','tab_'+id).append(// make and display new tab
					$("<a>").attr({
						href :"#room_"+id,
						'data-toggle' : "tab"
					}).text($(this).attr("value"))
					);
			$('.nav-tabs').append(roomTab);
			}
			changeToTab(id); // switch to that tab
		}));
       	}
       }

function changeToTab(id){
	$('ul.nav-tabs li.active').removeClass('active');
	$('#tab_'+id).addClass('active');
	$('#tab_'+id+' a').tab('show'); // Don't know why this isn't working. When a tab is first created and appears, the content does not show
}

// Referring to http://jsfiddle.net/dogoku/KdPdZ/2/
// Detect if tabs are clicked, if so show their content
function addjQueryListeners(){
	$(".nav-tabs").on("click", "a", function(e){
		e.preventDefault();
		console.log("clicked");
		$(this).tab('show');
	})
}

function doUponLoading(event){
	rooms.push(new PrivateRoom("roomName", "theCreator", "abcd"));
	rooms.push(new PrivateRoom("Sun", "Moon", "abcd"));
	console.log("max num is"+max_room_id);
	rooms.push(new PrivateRoom("hey", "hi", "abcd"));
	console.log(rooms);
	showRoomButtons();
	addjQueryListeners();
}
