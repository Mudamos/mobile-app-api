const {
  head,
  prop,
} = require("ramda");

const _ = require('lodash');
const fs = require('fs');
const mkdirp = require('mkdirp');

class Schedule {
  static transformOptions(options, startRange) {
    var tempLines = [];

    var currentState = options.lines[0].location.state;
    var currentCity = options.lines[0].location.city;
    var currentDistrict = options.lines[0].location.district;
    var countVotes = 1;

    if (startRange)
      countVotes = parseInt(startRange, 10);

    _.each(options.lines, (line, index) => {
      if (index == 0 || currentState !== line.location.state) {
        tempLines.push({ message: `\u0020${line.location.state != null ? line.location.state : 'Estado não informado'}`, uf: `${line.location.uf != null ? line.location.uf : 'UF não informada'}`, link: '', font: 13.0, type: 'state' });
      }
      if (index == 0 || currentCity !== line.location.city) {
        tempLines.push({ message: `\u0020${line.location.state != null ? line.location.state : 'Estado não informado'} > ${line.location.city != null ? line.location.city : 'Cidade não Informada'}`, link: '', font: 13.0, type: 'city' });
      }
      if (index == 0 || currentDistrict !== line.location.district) {
        tempLines.push({ message: `\u0020${line.location.state != null ? line.location.state : 'Estado não informado'} > ${line.location.city != null ? line.location.city : 'Cidade não Informada'} > ${line.location.district != null ? line.location.district : 'Bairro não informado'}`, link: '', font: 13.0, type: 'district' });
      }

      tempLines.push({ message: `${countVotes}. ${line.message}`, link: line.link });
      countVotes = countVotes + 1;

      currentState = line.location.state;
      currentCity = line.location.city;
      currentDistrict = line.location.district;
    })

    return tempLines;
  }

  static async fileExists(dir) {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(dir)) {
        mkdirp(dir, function (err) {
          if (!err) {
            resolve(true)
          } else {
            reject(false);
          }
        });
      } else {
        resolve(true);
      }
    })
  }

  static cleanEmptyFoldersRecursively(folder) {
    var fs = require('fs');
    var path = require('path');

    var isDir = fs.statSync(folder).isDirectory();
    if (!isDir) {
      return;
    }
    var files = fs.readdirSync(folder);
    if (files.length > 0) {
      files.forEach(function (file) {
        var fullPath = path.join(folder, file);
        Schedule.cleanEmptyFoldersRecursively(fullPath);
      });

      files = fs.readdirSync(folder);
    }

    if (files.length == 0) {
      console.log("removing: ", folder);
      fs.rmdirSync(folder);
      return;
    }
  }

  static getQueue(sqs, queueName) {
    const params = {
      QueueNamePrefix: queueName
    };

    return sqs.listQueues(params).promise()
      .then(prop("QueueUrls"))
      .then(head);
  }

  static sendMessage(sqs, urlQueue, value) {
    const params = {
      MessageBody: value,
      QueueUrl: urlQueue
    };

    return sqs.sendMessage(params).promise()
      .then(prop("MessageId"));
  }
}

module.exports = Schedule;
