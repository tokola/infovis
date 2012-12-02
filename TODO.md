- Check review count tabulation **(COMPLETE)**
- Transitions
- Fix tooltips **(COMPLETE)**
- Change ethnicities using 'other' column (new .csv file and code below)
- Change graph colors (code below) **(COMPLETE)**
- Add $-bars with tooltips
- Make sort by university functionality , clikcing on an attribute name and
- Highlight the selected/sorted by attribute
- Make sort by style functionality, clicking on a bubble or style name and
- Highlight the selected/sorted by restaurant style
- Make bubble tooltip (includes: business count, review count, rating)
- Set restaurant style names on y-axis (or elsewhere)
- Add grid in bubble area
- Set 2 pix margins between universties
- Set logos equal size to graph width
- Put average rating line per category
- Desaturate all other attributes on rollover of attribute
- Leave border around graph and space below for the following (I can give you graphics/placeholders):
- Put project name... URIF! [top] 
- Put "sorted by:" field [bottom]
- Put legend explaining encodings [bottom]
- Put instructions in space next to legend [bottom]
  - The last 3 can be placed in a collapsable semi-transparent window, in order to save space. The "sorted by: _____" should be always visible and the legend and info could be hidden/revealed. (just an idea)
- Change stacked bar colors:

	`var colors = {
		people: {
			undergrads: "rgb(150,235,0)",
			grads: "rgb(222,222,40)",
			faculty: "rgb(235,160,40)"
		},
		genders: {
			male: "rgb(150,210,250)",
			female: "pink"
		},
		statuses: {
			full_time: "white",
			part_time: "black"
		},
		residencies: {
			in_state: "rgb(240,100,130)",
			out_of_state: "rgb(170,160,210)",
			international: "purple",
			unknown_residence: "gray"
		},
		ethnicities: {
			white: "rgb(220,220,220)",
			hispanic: "rgb(180,130,80)",
			asian: "rgb(255,240,80)",
			nonresident_alien: "rgb(60,160,60)",
			islander: "peachpuff",
			black: "olive",
			alaskan: "lightseagreen",
			unknown_race: "lightgreen",
			mixed_race: "darksalmon",
			other: "black"
		}
	};`

- Add Other to ethnicities and change order:

	`ethnicities: {
		nonresident_alien: "Non-Resident Alien",
		hispanic: "Hispanic",
		islander: "Islander",
		black: "Black/African-American",
		asian: "Asian",
		alaskan: "Alaskan",
		unknown_race: "Unknown Race",
		white: "White/Caucasian",
		mixed_race: "Mixed Race",
		other: "Other"
	}

	ethnicities: "white","hispanic","asian","nonresident_alien","other"]

	other: +university.other / 100

	delete university.other;`