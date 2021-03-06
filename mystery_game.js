if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault("counter", 0);

  Template.hello.helpers({
    counter: function () {
      return Session.get("counter");
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set("counter", Session.get("counter") + 1);
    }
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {

    // code to run on server at startup
    Player_Roles = new Mongo.Collection("player_roles");

    var roles_init = [
    {role:"Detective", ip:"not_taken"},
    {role:"Spy", ip:"not_taken"},
    {role:"Civilian", ip:"not_taken"}]

    // Iterate over role_init to insert roles
    _.each(roles_init, function(data) {
      Player_Roles.insert(data)
    });

    // Randomly assign roles to distinct ips connecting to the server
    Meteor.onConnection(function(conn) {

      var player_id
      // Get user's ip address - to assign roles later
      player_id = conn.clientAddress;

      // If player ip does not exist in collection, insert it - ignore local host
      if (Player_Roles.find({"ip":player_id}).count() === 0 && player_id != "127.0.0.1") {
        
        var available_roles = Player_Roles.find({"ip":"not_taken"}).fetch();

        var random_choice = available_roles[Math.floor(Math.random() * available_roles.length)];

        Player_Roles.update(
          {role:random_choice["role"]},
          {
            $set:
            {ip:player_id}
          });

      }

    });

  });
}
