
var express = require('express');
var router = express.Router();
var multer = require('multer'),
  bodyParser = require('body-parser'),
  path = require('path');
var fs = require('fs');
var moment = require("moment");
var numeral = require("numeral");


console.log('picture controller is loaded...');

//this is the picture_controller.js file
//really /picture
router.get('/:user_id/:device_id', function (req, res) {
  var _user_id = req.params.user_id;
  var _device_id = req.params.device_id;

  //res.render('../app/views/camera', { groupName: group_name });
  console.log("at the /picture");

  req.session.maxPictures = 3;
  var isMaxReached;
  if (req.session.numPic >= req.session.maxPictures) {
    isMaxReached = true;
  } else {
    isMaxReached = true;
  };
  // console.log("num pic = " + req.session.numPic );
  // console.log("max pic = " + req.session.maxPictures );
  // console.log( "stop=" + isMaxReached );

  //need to pull out the data on this device
  //don't have the device id 
  var query = "SELECT * FROM devices WHERE user_id = ?";

  connection.query(query, [_user_id], function (err, response) {
    res.render('../app/views/users/camera', {
      timerInterval: response[0].commTimeInt,
      maxPics: response[0].maxPicsSession,
      numPic: response[0].numPicsTakenSession,
      commStopAuto: isMaxReached, //need to add in
      commTakeAPict: false,
      user_id: _user_id,
      device_id: _device_id
    });

  });
});

router.post('/create', multer({ dest: './app/public/uploads/' }).single('upl'), function (req, res) {
  console.log('did a post inside of api routes');
  console.log(req.file);
  if (!req.file) {
    console.log("No file received");
    return res.send({
      success: false
    });

  } else {
    console.log('file received');
    return res.send({
      success: true
    })
  }
});


router.post('/create-img/:user_id/:device_id', function (req, res) {
  console.log("\n\n from upload");
  var user_id = req.params.user_id;
  var device_id = req.params.device_id;

  console.log("user id=" + user_id);
  console.log("device id = " + device_id);
  //console.log( Object.keys(req.body)[0]);
  var img = "" + Object.keys(req.body)[0];
  //take out the spaces and replace them with +'s
  img = img.split(' ').join('+');

  var ext = img.split(';')[0].match(/jpeg|png|gif/)[0];
  // strip off the data: url prefix to get just the base64-encoded bytes
  var data = img.replace(/^data:image\/\w+;base64,/, "");
  var buf = new Buffer(data, 'base64');

  var uploadFile = __dirname;
  var appWordLoc = uploadFile.indexOf("app");
  //console.log("app word loc=" + appWordLoc);
  var subDir = uploadFile.substr(0, appWordLoc);
  //console.log("upload dir=" + subDir );

  var timeStamp = moment().unix();
  //uploadFile = uploadFile.substr(0, newLen) + '/public/uploads/' + "Audit" + timeStamp + ".png";
  var uploadFile = subDir + 'app/public/uploads/' + "Audit" + timeStamp + ".png";


  //new location to try for image files
  //uploadFile = '/tmp/' + "MLNQ-" + timeStamp + ".png";
  uploadFile = "MLNQ-" + timeStamp + ".png";

  //use helper to do it
  var path = require('path');
  var jsonPath = path.join(__dirname, '..', 'public', 'uploads', uploadFile);

  console.log("upload file = " + uploadFile);
  var timeOfPic = moment().unix();

  fs.writeFile(jsonPath, buf, function (err) {
    if (err) {
      console.log("error writing image = " + err);
    } else {
      console.log("file written");
    };
  });

  req.session.numPic = req.session.numPic + 1;

  //first set the number of picture taken
  //so need to read the value the write back
  var query1 = "SELECT * FROM devices WHERE user_id = ? AND device_id = ?";

  connection.query(query1, [user_id, device_id], function (err, response) {
    if (response === undefined || response === null) {
      //there is no response
    } else {
      console.log("pulled full record for devices")
      var numPicsTaken = response[0].numPicsTakenSession;
      numPicsTaken++;
      var numPicsToTake = response[0].maxPicsSession;
      var picTimeInt = response[0].commTimeInt;
      var picTimeDelay = response[0].commTimeDelay;
      if (numPicsTaken >= numPicsToTake) {
        //took too many pictures so reset everything
        numPicsTaken = 0;
        numPicsToTake = 0;
        picTimeInt = 0;
        picTimeDelay = 0;
      }
      var timeOfComm = moment().unix();
      //now update the file with # pics taken
      console.log([numPicsTaken, timeOfPic, timeOfComm, user_id, device_id]);
      var query2 = "UPDATE devices SET numPicsTakenSession=?, ";
      query2 += "maxPicsSession=?, commTimeInt=?,";
      query2 += "lastTimePic_unix=?, lastTimUpd_unix=? WHERE user_id=? AND device_id=?";
      connection.query(query2, [numPicsTaken, numPicsToTake, picTimeInt, timeOfPic, timeOfComm, parseInt(user_id), parseInt(device_id)], function (err2, response2) {
        console.log("updated number of pics taken");

        var imgSource = '/uploads/' + uploadFile;
        var timeOfUpload = moment().unix();
        //now have to store the uploaded picture to the picture log
        var outArray = [user_id, device_id, uploadFile, imgSource, jsonPath, true, timeOfUpload, timeOfUpload];
        console.log("insert array = " + outArray);
        var query3 = "INSERT INTO uploads ( user_id, device_id, filename, imgSource, filepathUpload, complete, date_start_unix, date_stop_unix ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ? )"
        connection.query(query3, outArray, function (err2, response2) {
          console.log("updated the file upload log");
          //return success ... add other stuff later on
          res.send({
            success: true
          });
        });
      });
    };
  });

  //main one for the post operation
});


//ping for status
router.post('/statcheck', function (req, res) {
  //the camera is pinging for a status update 
  console.log("hit status check");

  var user_id = req.body.user_id;
  var device_id = req.body.device_id;

  //first pull from the devices file and then send the command back
  //to the browers
  var query = "SELECT * FROM devices WHERE user_id=? AND device_id=?";

  connection.query(query, [user_id, device_id], function (err, response) {
    if (err) {
      console.log("error at delete device id schedule = \n" + err);
      return;
    };
    if (response === undefined || response === null || response.length === 0) {
      //there is nothing found .. should not happen, maybe they got kicked off ?
      //so, send command to reboot to google
    } else {
      //found a valid entry
      var comm_show_on_scrn = response[0].show_on_scrn;
      var comm_commNumPic = response[0].commNumPic;
      var comm_commTimeInt = response[0].commTimeInt;
      var comm_commTimeDelay = response[0].commTimeDelay;
      var comm_commPromptInt = response[0].commPromptInt;
      var comm_numPicsTakenSession = response[0].numPicsTakenSession;
      var comm_numPicsMax = response[0].maxPicsSession;
      var isShouldTakePics = false;
      if (comm_numPicsTakenSession < comm_numPicsMax && comm_numPicsMax != 0) {
        //have not exceeded the max number of pics so trigger to be on
        isShouldTakePics = true;
      };

      //got results out from the table, update the update time
      var timeOfComm = moment().unix();
      var query2 = "UPDATE devices SET lastTimUpd_unix=? ";
      query2 += "WHERE user_id=? AND device_id=?";
      connection.query(query2, [timeOfComm, parseInt(user_id), parseInt(device_id)], function (err2, response2) {
        console.log("updated comm time");
        //so now can send response back to the browser
        res.send({
          Status: "OK",
          errCode: 0,
          timerInterval: comm_commTimeInt,
          show_on_scrn: comm_show_on_scrn,
          commNumPic: comm_commNumPic,
          timerInterval: comm_commTimeInt,
          commTimeDelay: comm_commTimeDelay,
          commPromptInt: comm_commPromptInt,
          numPicsTakenSession: comm_numPicsTakenSession,
          commStopAuto: !isShouldTakePics,
          user_id: user_id,
          device_id: device_id
        });
      });
    }
  });
});





module.exports = router;
