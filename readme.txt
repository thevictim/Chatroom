Module 6

Refer to the top of group-client.html

Chatroom

HTML-wise
text field for nickname, creates a hidden html thing that stores nickname
list of rooms (buttons)
tabs that appear when button is clicked
tab contains list of users
(available on wiki)tab content is chat content: somewhere to type the message + send
text fields if want to create private room: room name and password
text fields to join private room
if in private room, interface to kick people (disconnect the person)/ban people(add to ban list)
if private room, person to send message to, message, send button (make a new tab for chatting with a person)
if private room, clicking user brings up option to kick, ban or send message

Object: Room
creator
name
current users in room
if private:
password
list of banned people

Object: conversation
doesnt display in rooms
only triggered if send private message

javascript to write:
detect user disconnect (refer to code at bottom) and remove from relevant rooms
detect user connect, and prompt for a nickname. then show available chatrooms
jquery: if nickname submitted, show available chat rooms
(1) some function to display rooms as tabs, show message entry field, submit button, messages sent, users, if private display private options
(2) display private options: options to kick/ban/send message to a user
If available room clicked, do (1)
sendMessage() (in wiki)
if private room create is submitted, create private room and do (1)
if private room join is submitted, join private room and do (1)

Steps:
1. write some room objects in out js file, figure out display things (bootstrap, jquery)
2. then add socket.io stuff

Creative:
Save settings/chats in MongoDB
If we don't want to do MongoDB, one thing we could do is to display message timestamps,
or allow private rooms to ban words/make one word change to another (eg every time I type "hello", it displays as "you dickhead")
3pts Bootstrap
We could also allows users to toggle/cycle between tabs by pressing crtl+tab and crtl+shift+tab


socket.on('disconnect', function(){
    socket.broadcast.to(roomName).emit('user_leave', {user_name: "johnjoe123"});
});

Useful links:
Object-oriented programming in Javascript: http://javascriptissexy.com/oop-in-javascript-what-you-need-to-know/
