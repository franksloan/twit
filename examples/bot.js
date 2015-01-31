//
//
//  Bot
//  class for performing various twitter actions
//
var Twit = require('../lib/twitter');

var Bot = module.exports = function(config) { 
  this.twit = new Twit(config);
};

//
//  post a tweet
//
Bot.prototype.tweet = function (status, callback) {
  if(typeof status !== 'string') {
    return callback(new Error('tweet must be of type String'));
  } else if(status.length > 140) {
    return callback(new Error('tweet is too long: ' + status.length));
  }
  this.twit.post('statuses/update', { status: status }, callback);
};

//
//  choose a random friend of one of your followers, and follow that user
//
Bot.prototype.mingle = function (callback) {
  var self = this;
  console.log('hi');
  this.twit.get('followers/ids', function(err, reply) {
    console.log('he');
      if(err) { return callback(err); }
      //Get a list of bot's followers and chooses a random one
      var followers = reply.ids
        , randFollower = null
        , randFollowerMatch = null;
        console.log('No. followers:');
        console.log(followers.length);
        
        //Get a random one of tomBot's followers' ids
        //Then remove that id from list
        randFollower1 = randIndex(followers);
        delete followers.randFollower1;
        randFollower2 = randIndex(followers);
        
        console.log("This randFollower:" + randFollower1);
        //Get a list of the friends of the chosen random follower
        self.twit.get('friends/list', { user_id: randFollower1 }, function(err, reply) {
          if(err) { return callback(err); }
          
          //Get the user list
          var randFFriends1 = reply.users;
          var i = randFFriends1.length;
          var possibleMatches = [];

          //While there are still users to look over
          //and the random follower has not been chosen yet
          while(i--){
            console.log(i);
            //
            var randFFriend1 = randIndex(randFFriends1);
            var popularity = randFFriend1.followers_count;
            console.log("Name:");
            console.log(randFFriend1.name);
            console.log(popularity);
            //Determine how many friends the user we are looking over has
            if (popularity < 1000) {
              //create an array ids of friends with less than 1000 followers
              possibleMatches.push(randFFriend1.id);
              console.log("Chosen person");
              console.log(possibleMatches);
            }
          }
          //Now look through the second random follower's friends
          self.twit.get('friends/ids', { user_id: randFollower2 }, function(err, reply) {
            if(err) { return callback(err); }
            var randFFriends2 = reply.ids;
            var possibleMatch;
            var userId;
            for(var j = 0; j < possibleMatches.length; i++){
              possibleMatch = possibleMatches[i];
              for(var id in randFFriends2){
                userId = possibleMatches[id];
                if(possibleMatch === userId){
                  self.twit.post('friendships/create', { id: userId }, callback);
                }
              }
            }
          });
        });              
    });
};

//
//  prune your followers list; unfollow a friend that hasn't followed you back
//
Bot.prototype.prune = function (callback) {
  var self = this;
  
  this.twit.get('followers/ids', function(err, reply) {
      if(err) return callback(err);
      
      var followers = reply.ids;
      
      self.twit.get('friends/ids', function(err, reply) {
          if(err) return callback(err);
          
          var friends = reply.ids
            , pruned = false;
          
          while(!pruned) {
            var target = randIndex(friends);
            
            if(!~followers.indexOf(target)) {
              pruned = true;
              self.twit.post('friendships/destroy', { id: target }, callback);   
            }
          }
      });
  });
};

function randIndex (arr) {
  var index = Math.floor(arr.length*Math.random());
  return arr[index];
};