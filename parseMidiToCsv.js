var MIDIFile = require("midifile");
var MIDIEvents = require("midievents");
const fs = require('fs');
const path = require('path');

var delta = 0;
var outFile;

if (process.argv.length < 4) {
  console.error("ERROR: need to supply input and output file names");
  console.error("usage: node " + path.basename(process.argv[1]) + " inputFileName outputFileName");
  return;
}

function printToOutput(s) {
  fs.writeSync(outFile, s + "\r\n");
}

function handleTrackName(event) {
  var name = Buffer.from(event.data);
  return name.toString();
}

function handleTimeSignature(event) {
  var s = "";

  s = event.param1 + ", " + event.param2 + ", " + event.param3 + ", " + event.param4;

  return s;
}

function handleMetaEvent(event) {
  var s = "1, " + delta + ", ";

  switch(event.subtype) {
      case MIDIEvents.EVENT_META_SEQUENCE_NUMBER:
        s = "sequence number";
        break;
      case MIDIEvents.EVENT_META_TEXT:
        s = "text";
        break;
      case MIDIEvents.EVENT_META_COPYRIGHT_NOTICE:
        s = "copyright notice";
        break;
      case MIDIEvents.EVENT_META_TRACK_NAME:
        s += "Title_t, " + handleTrackName(event);
        break;
      case MIDIEvents.EVENT_META_INSTRUMENT_NAME:
        s = "instrument name";
        break;
      case MIDIEvents.EVENT_META_LYRICS:
        s = "lyrics";
        break;
      case MIDIEvents.EVENT_META_MARKER:
        s = "marker";
        break;
      case MIDIEvents.EVENT_META_CUE_POINT:
        s = "cue point";
        break;
      case MIDIEvents.EVENT_META_MIDI_CHANNEL_PREFIX:
        s = "midi channel prefix";
        break;
      case MIDIEvents.EVENT_META_END_OF_TRACK:
        s = "0, 0, End_of_file";
        break;
      case MIDIEvents.EVENT_META_SET_TEMPO:
        s = "set tempo";
        break;
      case MIDIEvents.EVENT_META_SMTPE_OFFSET:
        s = "SMTPE offset";
        break;
      case MIDIEvents.EVENT_META_TIME_SIGNATURE:
        s += "Time_signature, " + handleTimeSignature(event);
        break;
      case MIDIEvents.EVENT_META_KEY_SIGNATURE:
        s = "key signature";
        break;
      case MIDIEvents.EVENT_META_SEQUENCER_SPECIFIC:
        s = "sequencer specific";
        break;
      default:
        s = "UNKNOWN";
  }

  return s;
}

function handleMidiEvent(event) {
  delta = delta + event.delta;
  var s = "1, " + delta + ", ";

  switch(event.subtype) {
    case MIDIEvents.EVENT_MIDI_NOTE_OFF:
      s = s + "Note_off_c";
      break;
    case MIDIEvents.EVENT_MIDI_NOTE_ON:
      s = s + "Note_on_c";
      break;
    case MIDIEvents.EVENT_MIDI_NOTE_AFTERTOUCH:
      s = s + "note aftertouch";
      break;
    case MIDIEvents.EVENT_MIDI_CONTROLLER:
      s = s + "Control_c";
      break;
    case MIDIEvents.EVENT_MIDI_PROGRAM_CHANGE:
      s = s + "program change";
      break;
    case MIDIEvents.EVENT_MIDI_CHANNEL_AFTERTOUCH:
      s = s + "channel aftertouch";
      break;
    case MIDIEvents.EVENT_MIDI_PITCH_BEND:
      s = s + "pitch bend";
      break;
    default:
      s = s + "UNKNOWN";
      break;
  }
  s = s + ", " + event.channel + ", " + event.param1 + ", " + event.param2;
  return s;
}

function handleEvent(event) {
  var s = "";
  switch(event.type) {
    case MIDIEvents.EVENT_META:
      s = handleMetaEvent(event);
      break;
    case MIDIEvents.EVENT_SYSEX:
      s = "Type: sysex";
      break;
    case MIDIEvents.EVENT_DIVSYSEX:
      s = "Type: div sysex";
      break;
    case MIDIEvents.EVENT_MIDI:
      s = handleMidiEvent(event);
      break;
    default:
      s = "UNKNOWN";
      break;
  }

  printToOutput(s);
}

var tickDuration = 0.0;

function closeOutputFile(fd) {
  fs.close(fd, function(err) {
    if (err) {
      console.error("Error closing output file.");
    }
  });
}

fs.open(process.argv[3], 'w', function(err, fd) {
  if (err) {
    console.error("ERROR opening file: " + process.argv[3]);
    return;
  }

  outFile = fd;

  fs.readFile(process.argv[2], function(err, data) {
    if (err) {
      console.error("ERROR reading from the file: " + err);
      closeOutputFile(fd);
    } else {
      // Creating the MIDIFile instance
      var midiFile = new MIDIFile(data);

      // Reading headers
      var format = midiFile.header.getFormat(); // 0, 1 or 2
      var trackCount = midiFile.header.getTracksCount(); // n

      printToOutput("0, 0, Header, " + format + ", " + trackCount + ", " + midiFile.header.getTicksPerBeat());
      printToOutput("1, 0, Start_track");

      tickDuration = 60000000 / (120 * midiFile.header.getTicksPerBeat());

      var trackEventsChunk = midiFile.tracks[0].getTrackContent();
      var allEvents = MIDIEvents.createParser(trackEventsChunk);

      var event = allEvents.next();
      while(event) {
        handleEvent(event);
        event = allEvents.next();
      }
      closeOutputFile(fd);
    }
  });

});


