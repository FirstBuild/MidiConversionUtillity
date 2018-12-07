
var fs = require('fs');
var parse = require('csv-parse');
var input = fs.readFileSync(process.argv[2],'utf8');//.toString('ascii');

// remove the 3rd line from the file
var lines = input.split('\n');
lines.splice(2, 1);
input = lines.join('\n');
 
var tempo = 120;  //tempo hardcoded now, need to extract from the .mid
if (process.argv[3]) {
  tempo = process.argv[3];  // get tempo from command line
}
var time_multiplier = ((1000 * 60)/(tempo*96));  // 96 ticks per beat hardcoded, should extract from midi.  1000 ms/s  60 s/min tempo in beats/min, 96 ticks per beat
var attack = 0;
var decay = 0;
var sustain = 0;
var release = 0;
var frequency = 0;
var peak_volume = 0;
var sustain_volume = 0;
var note_time = 0;
var note_duration = 0;
var first_note = 1;
//var stream = fs.createWriteStream(process.argv[2] + '.txt');  // output file
var event = 0;
var output_string = 0;
var Frequency = 0;
var freq_table = [
   220,
   233,
   246,
   261,
   277,
   293,
   311,
   329,
   349,
   369,
   391,
   415,
   440,
   466,
   493,
   523,
   554,
   587,
   622,
   659,
   698,
   739,
   783,
   830,
   880,
   932,
   987,
   1046,
   1108,
   1174,
   1244,
   1318,
   1396,
   1479,
   1567,
   1661,
   1760,
   1864,
   1975,
   2093,
   2217,
   2349,
   2489,
   2637,
   2793,
   2959,
   3135,
   3322,
   3520,
   3729,
   3951,
   4186]
   
var NOTE_LOWEST = 33;
var NOTE_HIGHEST = 84;
var SCALE_ATTACK_TIME = 20
var SCALE_DECAY_TIME =  20
var SCALE_SUSTAIN_TIME =20
var SCALE_RELEASE_TIME =20
var SCALE_PEAK_VOLUME = 2
var SCALE_SUSTAIN_VOLUME = 2
var frequency_hex_text = 0;
var attack_hex_text=0;
var decay_hex_text=0;
var sustain_hex_text=0;
var release_hex_text=0;
var peak_volume_hex_text=0;
var sustain_volume_hex_text=0;
var diddy_index=0;
var sustain_volume_out = 0;

function padLeft(value, length, pad) {
    pad = pad || '0';
        
    while (value.length < length) {
        value = pad + value;
    }
    
    return value;
}

//console.log(process.argv[2]);
console.log('Frequency (Hz), Attack (ms), Decay (ms), Sustain (ms), Release (ms), Peak Volume (%), Sustain Volume (%)')
 
parse(input, { comment: '#' }, function(err, lines) {
  if (err) return console.error('An error occurred while parsing the CSV document:\r\n', err);
  
  lines.map(function(record) {
    // do something with each line, we will just log it
    //console.log(line[1]);
			if (record[2]=== ' Control_c' && record[4]=== ' 74') {
		//console.log(record)
			attack = SCALE_ATTACK_TIME * record[5]
		//	console.log('attack',attack)
		};
		if (record[2]=== ' Control_c' && record[4]=== ' 71') {
			decay = SCALE_DECAY_TIME * record[5]
		};
		if (record[2]=== ' Control_c' && record[4]=== ' 93') {
			sustain = SCALE_SUSTAIN_TIME * record[5]
		};
		if (record[2]=== ' Control_c' && record[4]=== ' 91') {
			release = SCALE_RELEASE_TIME * record[5]
		};	
		if (record[2]=== ' Control_c' && record[4]=== ' 7') {
			sustain_volume = Math.round(record[5] * 100/127)
		};	
		if (record[2]===' Note_on_c') {
			rest = Math.round(record[1] * time_multiplier - note_time - note_duration)
			//\\rest = rest * 4;
			note_time = record[1] * time_multiplier
			note_duration = parseInt(attack) + parseInt(sustain) + parseInt(decay) + parseInt(release)
			if (rest > 20 && first_note === 0 ) {
				event = event + 1
				console.log('0,0,0,',rest,',0,0,0')
				output_string = ('000000000000' + padLeft(rest.toString(16),4)+ '00000000')
				diddy_index=diddy_index+1;
				if (diddy_index > 5) {
					output_string = output_string + '\n'
					diddy_index = 0;
				};
			//	stream.write(output_string);
			};
			//console.log('duration',note_duration)
			event = event + 1
			//console.log(record[4])
			Frequency = freq_table[parseInt(record[4])-NOTE_LOWEST]
			peak_volume = Math.round(parseInt(record[5]) * 100/127)
			sustain_volume_out = (sustain_volume * peak_volume)/100
			//console.log(' ',event,'freq:',Frequency,'peak vol:',peak_volume,'atk:',attack, 'decay:',decay,'sustain:',sustain,'rel:',release,'sus vol:',sustain_volume_out)
			//console.log(Frequency,attack,decay,sustain,release,peak_volume,sustain_volume_out)
			frequency_hex_text=padLeft(Frequency.toString(16),4)
			attack_hex_text=padLeft(attack.toString(16),4)
			decay_hex_text=padLeft(decay.toString(16),4)
			sustain_hex_text=padLeft(sustain.toString(16),4)
			release_hex_text=padLeft(release.toString(16),4)
			peak_volume_hex_text=padLeft(parseInt(peak_volume).toString(16),2)
			sustain_volume_hex_text=padLeft(parseInt(sustain_volume_out).toString(16),2)
			console.log(Frequency.toString(10)+','+attack.toString(10)+','+decay.toString(10)+','+sustain.toString(10)+','+release.toString(10)+','+peak_volume.toString(10)+','+sustain_volume_out.toString(10))//+ attack_hex_text + decay_hex_text + sustain_hex_text + release_hex_text + peak_volume_hex_text + sustain_volume_hex_text)
			output_string = (frequency_hex_text + attack_hex_text + decay_hex_text + sustain_hex_text + release_hex_text + peak_volume_hex_text + sustain_volume_hex_text)
			diddy_index=diddy_index+1;
			if (diddy_index > 5) {
				output_string = output_string + '\n'
				diddy_index = 0;
			};
	//		stream.write(output_string);
			first_note = 0
		};
  });
});

