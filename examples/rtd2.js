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

  if(rand <= 0.0001) {      //  tweet popular github tweet
    console.log("One");
    var params = {
        q: 'after work drinks',
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

      bot.tweet(popular, function (err, reply) {
        console.log("two");
        if(err) return handleError(err);

        console.log('\nTweet: ' + (reply ? reply.text : reply));
      })
    });
  } else if(rand <= 0.99) { console.log("Three");//  make a friend
    bot.mingle(function(err, reply) {
      
      if(err) return handleError(err);

      var name = reply.screen_name;
      console.log('\nMingle: followed @' + name);
    });
  } else {
  console.log("Four");                  //  prune a friend
    bot.prune(function(err, reply) {
      
      if(err) return handleError(err);

      var name = reply.screen_name
      console.log('\nPrune: unfollowed @'+ name);
    });
  }
}, 10000);

function handleError(err) {
  console.error('response status:', err.statusCode);
  console.error('data:', err.data);
}
