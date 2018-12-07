# MidiConversionUtillity

To run type midiconvert {tempo}

### Other commands:
Convert a MIDI file to an intermediate CSV format:
```
node parseMidiToCsv.js inputFileName outputFileName
```
`parseMidiToCsv.js` will create the output file and place the results there.

Convert an intermediate CSV file into the final CSV format:
```
node new_csv.js inputFileName > outputFileName
```
`new_csv.js` will not create the output file, so you need to use redirection to save it to the file name of your choice.

###Notes:
- Info on the [MIDI file format](https://www.csie.ntu.edu.tw/~r92092/ref/midi/)

