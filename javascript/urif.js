/************************************************************
 * University Restaurant Information Finder
 * Copyright (c) 2012, Brennon Bortz and Panagiotis Apostolellis
 * All rights reserved.
 * 
 * brennon@brennonbortz.com / www.brennonbortz.com
 ************************************************************/
/************************************************************
 * d3.js
 * Copyright (c) 2012, Michael Bostock
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 * * Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 * 
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 * 
 * * The name Michael Bostock may not be used to endorse or promote products
 *   derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL MICHAEL BOSTOCK BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 ************************************************************/

/************************************************************
 * Global variables
 ************************************************************/

// Global university data
var universityInfo = {
	costs: { min: 0, max: 0 },
	salaries: { min: 0, max: 0 }
};

// Global restaurant data
var restaurantInfo = { mostReviews: 0, leastReviews: 10000000 };
var uniqueRestaurantStatID = 0;

// Datasets
var universities, restaurants;

// Number of CSV files
var dataFiles = 2;
var dataFilesLoaded = 0;

// Sort orders
// Initial sort by either "stats" or "restaurants"
var mainSortKey = "stats";
var styleOrder = ["american", "african", "asian", "european", "latin_american", "middle_eastern", "mediterranean", "mexican", "uncategorized"];
var stackedCategoryOrder = ["people", "genders", "residencies","ethnicities"];
var stackedSubcategoryOrders = {
	people: ["undergrads", "grads", "faculty"],
	genders: ["male", "female"],
	statuses: ["full_time", "part_time"],
	residencies: ["out_of_state", "in_state", "international", "unknown_residence"],
	ethnicities: ["white","hispanic","asian","nonresident_alien","other"]
};

// Description strings for attributes
var descriptions = {
	undergrads: "Undergraduate Students",
	grads: "Graduate Students",
	faculty: "Faculty",
	male: "Males",
	female: "Females",
	full_time: "Full-Time Students",
	part_time: "Part-Time Students",
	in_state: "In State Students",
	out_of_state: "Out of State Students",
	international: "International Students",
	unknown_residence: "Unknown Residence",
	nonresident_alien: "Non-Resident Alien",
	hispanic: "Hispanic",
	islander: "Islander",
	black: "Black/African-American",
	asian: "Asian",
	alaskan: "Alaskan",
	unknown_race: "Unknown Race",
	white: "White/Caucasian",
	mixed_race: "Mixed Race",
	other: "Other",
	american: "American",
	african: "African",
	asian: "Asian",
	european: "European",
	latin_american: "Latin American",
	middle_eastern: "Middle Eastern",
	mediterranean: "Mediterranean",
	mexican: "Mexican",
	uncategorized: "Uncategorized"
};


/************************************************************
 * Parser functions for restaurant data
 ************************************************************/

// Parse the data for all restaurants
var parseRestaurantsData = function() {
	restaurants.forEach(parseRestaurantData);
	
	var extrema = [];
	universities.forEach(function(university) {
		var reviews = [];
		for (var prop in university.restaurantStats) {
			reviews.push(university.restaurantStats[prop]["totalReviews"]);
		}
		extrema.push(d3.max(reviews));
		extrema.push(d3.min(reviews));
	});
	restaurantInfo.mostReviews = d3.max(extrema);
	restaurantInfo.leastReviews = d3.min(extrema);
};

// Parse stats for an individual restaurant
var parseRestaurantData = function(restaurant) {
	restaurant.category = restaurant.category.toUnderscored();
	var university = getUniversityByName(restaurant.university_name, universities);
	university.restaurants.push(restaurant);
	
	if (university.restaurantStats[restaurant.category] === undefined)
		university.restaurantStats[restaurant.category] = new restaurantCategoryStats(university.name, restaurant.category, uniqueRestaurantStatID++);
	
	university.restaurantStats[restaurant.category].totalStars += +restaurant.stars;
	university.restaurantStats[restaurant.category].totalReviews += +restaurant.review_count;
	
	university.restaurantStats[restaurant.category].totalRestaurants++;
};

// Object to hold restaurant category statistics
var restaurantCategoryStats = function(university, category, id) {
	this.id = id;
	this.university = university;
	this.category = category;
	this.totalRestaurants = 0;
	this.totalReviews = 0;
	this.totalStars = 0;
	this.averageStars = function() {
		if (this.totalRestaurants == 0) return 0.0;
		else return this.totalStars / this.totalRestaurants;
	};
};


/************************************************************
 * Parser functions for university data
 ************************************************************/

// Parse the data for all universities
var parseUniversitiesData = function() {
	universities.forEach(parseIndividualUniversityData);
};

// Parse university stats
var parseUniversitySummaryData = function() {
	// Collect costs and salaries into arrays
	var costs = universities.map( function(d) {
		return parseInt(d.fees);
	});
	
	var salaries = universities.map( function(d) {
		return parseInt(d.salary);
	});
	
	// Calculate maximum and minimum costs and salaries across universities
	universityInfo.costs.max = d3.max(costs);
	universityInfo.costs.min = d3.min(costs);
	universityInfo.salaries.max = d3.max(salaries);
	universityInfo.salaries.min = d3.min(salaries);
};

// Parsing and formatting of raw data from CSV file
var parseIndividualUniversityData = function(university) {
	university.salary = +university.salary;
	university.fees = +university.fees;
	
	var totalPeople = +university.total_faculty + +university.undergrads + +university.grads;
	university.people = {
		faculty: +university.total_faculty / totalPeople,
		undergrads: +university.undergrads / totalPeople,
		grads: +university.grads / totalPeople
	};
	delete university.total_faculty;
	delete university.undergrads;
	delete university.grads;
	
	university.residencies = {
		in_state: +university.in_state / 100,
		out_of_state: +university.out_of_state / 100,
		international: +university.international / 100,
		unknown_residence: +university.unknown_residence / 100
	};
	delete university.in_state;
	delete university.out_of_state;
	delete university.international;
	delete university.unknown_residence;
	
	university.statuses = {
		part_time: +university.part_time / 100,
		full_time: +university.full_time / 100
	};
	delete university.part_time;
	delete university.full_time;
	
	university.ethnicities = {
		nonresident_alien: +university.nonresident_alien / 100,
		hispanic: +university.hispanic / 100,
		islander: +university.islander / 100,
		black: +university.black / 100,
		asian: +university.asian / 100,
		alaskan: +university.alaskan / 100,
		unknown_race: +university.unknown_race / 100,
		white: +university.white / 100,
		mixed_race: +university.mixed_race / 100,
		other: +university.other / 100
	};
	delete university.nonresident_alien;
	delete university.hispanic;
	delete university.islander;
	delete university.black;
	delete university.asian;
	delete university.alaskan;
	delete university.unknown_race;
	delete university.white;
	delete university.mixed_race;
	delete university.other;
	
	university.genders = {
		male: +university.male / 100,
		female: +university.female / 100
	};
	delete university.male;
	delete university.female;
	
	university.id = parseInt(university.id);
	university.restaurants = [];
	
	university.restaurantStats = {};
};


/************************************************************
 * Helper functions
 ************************************************************/

// Helper function to convert space-separated to underscore-separated strings
var toUnderscored = function() {
	return this.replace(/\s/g, "_").toLowerCase();
};
String.prototype.toUnderscored = toUnderscored;

// Get a university by name
var getUniversityByName = function(name, array) {
	return array.filter( function(u) { if (u.name == name) return true; } )[0];
};

// Import data from CSV files
var importCSVData = function(callback) {
	d3.csv("./data/restaurants.csv", function(csv) {
		restaurants = csv;
		callback();
	});
	
	d3.csv("./data/colleges.csv", function(csv) {
		universities = csv;
		callback();
	});
};


/************************************************************
 * Drawing functions
 ************************************************************/

var buildEntireChart = function(div, isResizing) {
	
	var dimensions = {
		svg: {
			width: function() { return $(div).width(); },
			height: function() { return $(div).height(); }
		},
		rows: {
			bubbles: {
				height: function() {
					if (dimensions.bubbles.height() < dimensions.bubbles.width()) {
						return dimensions.bubbles.height() / styleOrder.length;
					}
					else {
						return dimensions.bubbles.width() / styleOrder.length;
					}
				}
			}
		},
		restaurantLabels: {
			width: function() { return dimensions.svg.width() * 0.15; },
		},
		columns: {
			width: function() { return (dimensions.svg.width() - dimensions.restaurantLabels.width()) / universities.length; },
		},
		bubbles: {
			x: function() { return dimensions.restaurantLabels.width(); },
			y: function() { return 0; },
			width: function() { return dimensions.svg.width() - dimensions.restaurantLabels.width(); },
			height: function() { return dimensions.svg.height() * 0.6; }
		},
		logos: {
			x: function() { return dimensions.restaurantLabels.width(); },
			y: function() { return dimensions.bubbles.height(); },
			width: function() { dimensions.svg.width() - dimensions.restaurantLabels.width(); },
			height: function() { return dimensions.columns.width(); }
		},
		bars: {
			x: function() { return dimensions.restaurantLabels.width(); },
			y: function() { return dimensions.bubbles.height() + dimensions.logos.height() + 5; },
			width: function() { return dimensions.svg.width() - dimensions.restaurantLabels.width(); },
			height: function() { return dimensions.svg.height() - dimensions.bubbles.height() - dimensions.logos.height() - 5; }
		}
	}
	
	var svg;
	
	// Clear main div of drawing
	if (isResizing) {
		$(div).empty();
	
		// Main SVG element
		svg = d3.select(div)
			.append("svg")
			.attr("width", dimensions.svg.width())
			.attr("height", dimensions.svg.height());
	} else {
		svg = d3.select("svg");
	}
	
	universities = universities.sort(function(a, b) {
		var compareA, compareB;
		if (mainSortKey == "restaurants") {
			var aStats = a.restaurantStats[styleOrder[0]];
			var bStats = b.restaurantStats[styleOrder[0]];
			if (aStats === undefined) compareA = 0.0;
			else compareA = aStats.averageStars();
			if (bStats === undefined) compareB = 0.0;
			else compareB = bStats.averageStars();
		} else {
			compareA = a[stackedCategoryOrder[0]][stackedSubcategoryOrders[stackedCategoryOrder[0]][0]];
			compareB = b[stackedCategoryOrder[0]][stackedSubcategoryOrders[stackedCategoryOrder[0]][0]];
		}
		return compareB - compareA;
	});
	
	var restaurantLabels = svg.selectAll("text.restaurantLabel")
		.data(function() {
			return styleOrder.map(function(d) {
				return {name: d, description: descriptions[d]};
			})
		});
	
	restaurantLabels.enter()
		.append("text")
		.classed("restaurantLabel", true)
		.text(function(d) { return d.description; })
		.attr("x", 0)
		.attr("y", function(d, i) {
			return dimensions.rows.bubbles.height() * i + 10;
		});
	
	var currentColumnOrder = universities.map(function(d) { return d.name; });
	
	var columns = svg.selectAll("g.column")
		.data(universities, function(d) { return d.name; });
	
	columns.attr("transform", function(d, i) { return "translate("+ (dimensions.columns.width() * i) +",0)"; });
	
	columns.enter()
		.append("g")
		.classed("column", true)
		.attr("transform", function(d, i) { return "translate("+ (dimensions.columns.width() * i) +",0)"; })
		.attr("width", function () { return dimensions.columns.width(); })
		.attr("height", dimensions.svg.height())
		.attr("id", function(d) { return d.name; });
	
	var circleRadiusScale = d3.scale.pow()
		.domain([0, 5])
		.range([0, (dimensions.rows.bubbles.height() / 2)])
		.exponent(1.5);
	
	var circleColorScale = d3.scale.log()
		.domain([restaurantInfo.mostReviews, restaurantInfo.leastReviews])
		.range([0.25,0.95]);
	
	var allRestaurantStats = [];
	universities.forEach(function(d) {
		for (var category in d.restaurantStats)
			allRestaurantStats.push(d.restaurantStats[category]);
	});
	
	var bubbles = svg.selectAll("circle.bubble")
		.data(allRestaurantStats, function(d) { return d.id; });
	
	bubbles.transition()
		.duration(2000)
		.attr("cx", function (d) {
			var index = currentColumnOrder.indexOf(d.university);
				return dimensions.bubbles.x() + (index * dimensions.columns.width()) + (dimensions.columns.width() / 2);
		})
		.attr("cy", function(d) {
			var index = styleOrder.indexOf(d.category);
			return (index * dimensions.rows.bubbles.height()) + (dimensions.rows.bubbles.height() / 2);
		});
	
	bubbles.enter()
		.append("circle")
		.classed("bubble", true)
		.attr("r", 0)
		.attr("cx", function (d) {
			var index = currentColumnOrder.indexOf(d.university);
			return dimensions.bubbles.x() + (index * dimensions.columns.width()) + (dimensions.columns.width() / 2);
		})
		.attr("fill", function(d) { return d3.hsl(30,1,circleColorScale(d.totalReviews)).toString(); })
		.attr("cy", function(d) {
			var index = styleOrder.indexOf(d.category);
			return (index * dimensions.rows.bubbles.height()) + (dimensions.rows.bubbles.height() / 2);
		})
		.attr("title", function(d) {
			return "Restaurants: "+d.totalRestaurants+"<br />Reviews: "+d.totalReviews+"<br />Average stars: "+d.averageStars().toFixed(2);
		})
		.on("click", function() { 
			var style = d3.select(this)[0][0].__data__.category;
			updateStyleOrder(style, "restaurant");
		})
		.transition()
		.duration(1000)
		.attr("r", function(d) { return circleRadiusScale(d.averageStars()); });
	
	$("svg circle").tipsy({
		fade: true,
		gravity: $.fn.tipsy.autoWE,
		html: true
	});
	
	var logos = svg.selectAll("image.universityLogo")
		.data(universities, function(d) { return d.name; });
	
	logos.transition()
		.duration(2000)
		.attr("x", function(d, i) {
			return dimensions.restaurantLabels.width() + dimensions.columns.width() * i;
		})
		.attr("y", function(d) { return dimensions.bubbles.height(); })
		.attr("height", function(d) { return dimensions.columns.width(); })
		.attr("width", function(d) { return dimensions.columns.width(); });
	
	logos.enter()
		.append("image")
		.classed("universityLogo", true)
		.attr("ry", 0)
		.attr("x", function(d, i) {
			return dimensions.restaurantLabels.width() + dimensions.columns.width() * i;
		})
		.attr("y", function(d) { return dimensions.bubbles.height(); })
		.attr("height", function(d) { return dimensions.columns.width(); })
		.attr("width", function(d) { return dimensions.columns.width(); })
		.attr("xlink:href", function(d) { return d.logo; })
		.attr("opacity", 0.0)
		.transition()
		.duration(2000)
		.attr("opacity", 1.0);
	
	var numberOfStackedBars = stackedCategoryOrder.length;
	var stackedBarWidth = (dimensions.columns.width() / numberOfStackedBars) - 2;
	var stackedBarHeight = dimensions.bars.height();
	
	var stackedCharts = svg.selectAll("g.stackedChart")
		.data(universities, function(d) { return d.name; });
	
	stackedCharts.enter()
		.append("g")
		.classed("stackedChart", true)
	
	for (c in stackedCategoryOrder) {
		var category = stackedCategoryOrder[c];
		for (s in stackedSubcategoryOrders[category]) {
			var subcategory = stackedSubcategoryOrders[category][s];
			
			var rects = stackedCharts.selectAll("rect." + category + "-" + subcategory)
				.data(function(d) {
					var data = {
						category: category,
						subcategory: subcategory,
						university: this.parentNode.__data__.name,
						value: d[category][subcategory]
					}
					return ([data]);
				});
			
			rects.transition()
				.duration(2000)
				.attr("height", function(d) { return stackedBarHeight * d.value; })
				.attr("x", function(d) {
					var index = currentColumnOrder.indexOf(d.university);
					var subindex = stackedCategoryOrder.indexOf(d.category);
					return dimensions.bars.x() + (index * dimensions.columns.width()) + (subindex * stackedBarWidth);
				})
				.attr("y", function(d) {
					var index = stackedSubcategoryOrders[d.category].indexOf(d.subcategory);
					var accumulatedHeight = 0;
					for (i = 0; i < index; i++) {
						accumulatedHeight += this.parentNode.__data__[d.category][stackedSubcategoryOrders[d.category][i]] * stackedBarHeight;
					}
					return accumulatedHeight + dimensions.bars.y();
				})
				.attr("width", stackedBarWidth)
				.attr("height", function(d) { return stackedBarHeight * d.value; });
			
			rects.enter()
				.append("rect")
				.attr("class", category + "-" + subcategory)
				.classed("highlighted", true)
				.attr("width", stackedBarWidth)
				.attr("height", function(d) { return stackedBarHeight * d.value; })
				.attr("x", function(d) {
					var index = currentColumnOrder.indexOf(d.university);
					var subindex = stackedCategoryOrder.indexOf(d.category);
					return dimensions.bars.x() + (index * dimensions.columns.width()) + (subindex * stackedBarWidth);
				})
				.attr("y", dimensions.svg.height())
				.attr("title", function(d) { 
					var percent = d.value * 100;
					return descriptions[d.subcategory] + ": " + percent.toFixed(0) + "%"; 
				})
				.on("click", function(d) { 
					var className = this.className.baseVal;
					var thisCat = className.substring(0,className.indexOf("-"));
					updateStyleOrder({subcategory: d.subcategory, category: thisCat}, "stat");
				})
				.on("mouseover", function() {
					var highlightedClassName = d3.select(this).attr("class").split(" ")[0];
					$("rect").each(function() {
						var thisClassName = d3.select(this).attr("class").split(" ")[0];
						if (thisClassName != highlightedClassName) {
							d3.select(this).classed("highlighted", false);
							d3.select(this).classed("muted", true);
						}
					});
				})
				.on("mouseout", function() {
					var highlightedClassName = d3.select(this).attr("class").split(" ")[0];
					$("rect").each(function() {
						var thisClassName = d3.select(this).attr("class").split(" ")[0];
						if (thisClassName != highlightedClassName) {
							d3.select(this).classed("highlighted", true);
							d3.select(this).classed("muted", false);
						}
					});
				})
				.transition()
				.duration(1000)
				.attr("y", function(d) {
					var index = stackedSubcategoryOrders[d.category].indexOf(d.subcategory);
					var accumulatedHeight = 0;
					for (i = 0; i < index; i++) {
						accumulatedHeight += this.parentNode.__data__[d.category][stackedSubcategoryOrders[d.category][i]] * stackedBarHeight;
					}
					return accumulatedHeight + dimensions.bars.y();
				});
				
				$('svg rect').tipsy({
					fade: true,
					gravity: $.fn.tipsy.autoWE,
					html: true
				});
		}
	}
};


/************************************************************
 * Event handler helpers
 ************************************************************/
var updateStyleOrder = function(d, key) {
	if (key == "stat") {
		mainSortKey = "stats";

		var categoryIndex = stackedCategoryOrder.indexOf(d.category);
		var subcategoryIndex = stackedSubcategoryOrders[d.category].indexOf(d.subcategory);

		if (categoryIndex != 0) {
			stackedCategoryOrder.splice(categoryIndex, 1);
			stackedCategoryOrder.unshift(d.category);
		}

		if (subcategoryIndex != 0) {
			stackedSubcategoryOrders[d.category].splice(subcategoryIndex, 1);
			stackedSubcategoryOrders[d.category].unshift(d.subcategory);
		}
	} else {
		mainSortKey = "restaurants";
		var index = styleOrder.indexOf(d);
		styleOrder.splice(index, 1);
		styleOrder.unshift(d);
	}
	draw(false);
}


/************************************************************
 * Setup routines
 ************************************************************/
// Initial build
var start = function() {
	importCSVData(csvCallback);
};

var parseCSVData = function() {
	parseUniversitySummaryData();
	parseUniversitiesData();
	parseRestaurantsData();
	draw(true);
};

var csvCallback = function() {
	if (++dataFilesLoaded == dataFiles) parseCSVData();
};

var draw = function(isResizing) {
	buildEntireChart("div#visualization", isResizing);
};

window.onresize = function() {
	draw(true);
}

start();