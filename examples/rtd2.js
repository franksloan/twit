//
//  RTD2 - Twitter bot that tweets about the most popular github.com news
//  Also makes new friends and prunes its followings.
//
var Bot = require('./bot')
  , config1 = require('../config1');

var bot = new Bot(config1);

console.log('RTD2: Running.');

//get date string for today's date (e.g. '2011-01-01')
function datestring () {
  var d = new Date(Date.now() - 5*60*60*1000);  //est timezone
  return d.getUTCFullYear()   + '-'
     +  (d.getUTCMonth() + 1) + '-'
     +   d.getDate();
};

setInterval(function() {
  bot.twit.get('friends/ids', function(err, reply) {
    console.log("start");
    if(err) return handleError(err)
    console.log('\n# followers:' + reply.ids.length.toString());
  });
  var rand = Math.random();
  var quotes = ['quite honestly', 'drinks', 'cornwall goodtimes', 'g and t', 
    'the weekend', 'absolutely ridiculous', 'quite literally', 
    "so aloof", 'literally amazing', 'the dambusters', 'lager lager'];
  if(rand <= 0.01) {      //  tweet popular github tweet
    var randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    console.log(randomQuote);
    var params = {
        q: randomQuote,
        lang: 'en'
      // , since: datestring()
      , result_type: 'mixed'
    };
    bot.twit.get('search/tweets', params, function (err, reply) {
      if(err) return handleError(err);
      console.log(params.q);
      var max = 0, popular;

      var tweets = reply.statuses;
      // console.log(tweets);
      var i = tweets.length;
      console.log(i);

      while(i--) {
        var tweet = tweets[i]
          , popularity = tweet.retweet_count;
          console.log(popularity);
        if(popularity > max) {
          max = popularity;
          popular = tweet.text;
        }
      }
      console.log(popular);
      var chrSpace = 140 - popular.length;
      randomQuote = randomQuote.replace(/\s/g, '');
      randomQuote = '#' + randomQuote;
      if (randomQuote.length < chrSpace) {
        popular += ' ' + randomQuote;
      } else if (chrSpace >= 5) {
        popular += ' ' + '#lol';
      }

      bot.tweet(popular, function (err, reply) {
        console.log("two");
        if(err) return handleError(err);

        console.log('\nTweet: ' + (reply ? reply.text : reply));
      })
    });
  } else if(rand <= 0.87) {
    //Tweet a friend with a random quote
    var params = {
      screen_name: 'FactsAndAll'
    };
    bot.twit.get('statuses/user_timeline', params, function (err, reply) {
      if(err) return handleError(err);
      var randFactsAndAll = randIndex(reply);
      var personalTweet = randFactsAndAll.text;
      console.log(personalTweet);

        bot.twit.get('friends/ids', function(err, reply) {
          if(err) return handleError(err);
          var randFriend = randIndex(reply.ids);
          console.log(randFriend);
          bot.twit.get('friendships/lookup', {user_id: randFriend}, function(err, reply) {
            if(err) return handleError(err);
            console.log(reply[0]);
            var randFriendName = reply[0].screen_name;
            console.log(randFriendName);
            personalTweet = '@' + randFriendName + '  ' + personalTweet;
            personalTweet = personalTweet.slice(0,139);
            bot.tweet(personalTweet, function (err, reply) {
              if(err) return handleError(err);
              console.log('\nTweet: ' + (reply ? reply.text : reply));
            });
          });
        });

    });


  } else if(rand <= 0.88) { console.log("Three");//  make a friend
    bot.mingle(function(err, reply) {
      
      if(err) return handleError(err);

      var name = reply.screen_name;
      console.log('\nMingle: followed @' + name);
    });
  } else if(rand <= 0.89) {
    var params = {};
    //Favourite a random tweet from bot's timeline
    bot.twit.get('statuses/home_timeline', params, function(err, reply) {
      if(err) return handleError(err);
      console.log("Try to favorite a random tweet");
      var timelineTweets = reply;
      var possibleFavorite = randIndex(timelineTweets);    
      if (possibleFavorite.favorited == false) {
        var favorite = possibleFavorite.id;
        bot.favorite(favorite, function(err, reply) {
          if(err) return handleError(err);
          console.log('\nFavorite: ' + (reply ? reply.text : reply));
        });
      };
    });
  } else if(rand <= 0.90) {
    var params =  {};
    //Favourite a random tweet from where bot has been mentioned
    bot.twit.get('statuses/mentions_timeline', params, function(err, reply) {
      if(err) return handleError(err);
      console.log("Try to favorite a mention");
      var mentionTweets = reply;
      var possibleFavorite = randIndex(mentionTweets);
      if (possibleFavorite.favorited == false) {
        var favorite = possibleFavorite.id;
        bot.favorite(favorite, function(err, reply) {
          if(err) return handleError(err);
          console.log('\nFavorite: ' + (reply ? reply.text : reply));
        });
      };
    });
  } else if(rand <= 0.96) {
    var params = {};
    //Retweet a random tweet from bot's timeline
    bot.twit.get('statuses/home_timeline', params, function(err, reply) {
      if(err) return handleError(err);
      console.log("Retweet a timeline tweet");
      var timelineTweets = reply;
      var possibleRetweet = randIndex(timelineTweets);
      var retweet = possibleRetweet.id;
      bot.retweet(retweet, function(err, reply) {
        if(err) return handleError(err);
        console.log('\nRetweet: ' + (reply ? reply.text : reply));
      });
      
    });
  } else if(rand <= 0.97) {
    var params =  {};
    //Favourite a random tweet from where bot has been mentioned
    bot.twit.get('statuses/mentions_timeline', params, function(err, reply) {
      if(err) return handleError(err);
      console.log("Retweet a mention");
      var mentionTweets = reply;
      var retweetStatus = randIndex(mentionTweets);
      var retweetStatusId = retweetStatus.id;
      bot.retweet(retweetStatusId, function(err, reply) {
        if(err) return handleError(err);
        console.log('\nRetweet: ' + (reply ? reply.text : reply));
      });
    });
  } else {
  console.log("Prune someone");                  //  prune a friend
    bot.prune(function(err, reply) {
      
      if(err) return handleError(err);

      var name = reply.screen_name
      console.log('\nPrune: unfollowed @'+ name);
    });
  }
}, 30000);

function handleError(err) {
  console.error('response status:', err.statusCode);
  console.error('data:', err.data);
};

function randIndex (arr) {
  var index = Math.floor(arr.length*Math.random());
  return arr[index];
};