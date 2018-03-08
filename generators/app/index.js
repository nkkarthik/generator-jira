'use strict';
var yeoman = require('yeoman-generator');
let exec = require('child_process').exec;

//jira-cli new
    //--project TD
    //--priority P4
    //--type 'Task'
    //--assignee krishna.karthik
    //--extra 'customfield_10120={"name": "alan.tang"}'
    //--description 'Remove swyft order sender'
//'Remove swyft order sender'

// jira-cli update
// --extra 'customfield_10265=[{"set": "89"}]'
// ECES-10704 # sprint 45

//status               : Open
//reporter             : krishna.karthik
//summary              : CheckoutThread: Remove swyft order sender
//assignee             : krishna.karthik
//link                 : http://zoomjira.zoomsystems.com/browse/TD-108
//issue                : TD-108


//let sprint = 89;
//let sprintStart = new Date(2017, 4-1, 10);
let sprint = 102;
let sprintStart = new Date(2018, 2-1, 19);


function daysSince(day) {
  let today = new Date();
  return Math.round((today-day)/(1000*60*60*24));
}

function isSprintDone() {
  return daysSince(sprintStart) > 19;
}

function parseFor(out, key) {
  return out.split('\n').find(s => s.startsWith(key)).split(/\s+/)[2];
}

function parseIssue(out) {
  return parseFor(out, 'issue');
}

function parseLink(out) {
  return parseFor(out, 'link');
}

function browseIssue(issue) {
  exec(`open ${issue}`);
}

function updateSprint(issue) {
  let argslist = [
    'jira-cli', 'update',
    `--extra 'customfield_10265=[{"set": "${sprint}"}]'`,
    issue
  ];

  let args = argslist.join(' ');
  console.log(args)

  return exec(args, (err, sout, serr) => {
    if (err || serr) {
      console.error(err || '', serr || '');
      return;
    }
  });
}

function createIssue({ project, type, assignee, qa, summary }) {

  let needsQa = project !== 'TD';

  let argslist = [
    'jira-cli', 'new',
    '--project', project,
    '--priority', 'P4',
    '--type', type,
    '--assignee', assignee,
    (needsQa ? `--extra 'customfield_10120={"name":"${qa}"}'` : ''),
    '--description', `'${summary}'`,
    `'${summary}'`,
  ];

  let args = argslist.join(' ');
  console.log(args)

  return exec(args, (err, sout, serr) => {
    if (err || serr) {
      console.error('Error:', err || '', serr || '');
      return;
    }
    console.log(sout);

    if (needsQa) {
      updateSprint(parseIssue(sout));
    }
    browseIssue(parseLink(sout));
  });
}

module.exports = yeoman.Base.extend({
  prompting: function () {

    if (isSprintDone()) {
      console.error(`Error: Sprint ${sprint} started on ${sprintStart} is done! Please update sprint!`);
      return;
    }

    var prompts = [{
      type: 'list',
      name: 'project',
      message: 'Project',
      choices: ['ECES', 'TD'],
      'default': 'ECES'
    }, {
      type: 'list',
      name: 'type',
      message: 'Type',
      choices: ['Task', 'Bug', 'Improvement'],
    }, {
      type: 'list',
      name: 'assignee',
      message: 'Assignee',
      choices: ['krishna.karthik', 'rushi.pamu',
        'murthy.koppu'],
    }, {
      type: 'list',
      name: 'qa',
      message: 'QA',
      choices: ['alan.tang', 'purna.kathula'],
    }, {
      type: 'text',
      name: 'summary',
      message: 'Summary'
    }];

    return this.prompt(prompts).then(function (props) {
      return createIssue(props);
    }.bind(this));

  }

});
