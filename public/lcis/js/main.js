var chartypes = {
	_: "_",
	"*": "_"
};

//state variables
var curgrid = [];
var curelt = null;
var curtran = "tubs";

//state functions
window.addEventListener("keydown", typeHandler);

var grid = {
generateR: function generateRandom() {
  let ret = [];
  for (let i = 0; i < 24; i++) {
	let line = "";
	for (let j = 0; j < 80; j++) {
	  let val = String(Math.round(Math.random() * 9));
	  line += val;
	}
	ret.push(line);
  }
  return ret;
},
make: function makeGrid(gr) {
  var ret = [];
  gr.forEach(function parse(line, j) {
	var newLine = [];
	for (let i = 0; i < line.length; i++) {
	  let character = line[i];
	  let pos = { x: i, y: j };
	  let submit = false;
	  if (character == " ") character = "&nbsp";
	  if (character == "*") {
		character = "_";
		submit = true;
	  }
	  if (character in chartypes) {
		newLine.push(new Char(character, true, pos, submit));
	  } else {
		newLine.push(new Char(character, false, pos, submit));
	  }
	}
	ret.push(newLine);
  });
  curgrid = ret;
  return ret;
},
//todo fix this...
//does not put elements in their proper place
draw: function drawGrid(mgr) {
  let rows = document.getElementsByClassName("row");
  mgr.forEach(rowParse);

  function rowParse(item, i) {
	let row = rows[i];
	row.innerHTML = "";
	row.appendChild(mgr[i].reduce(colParse, document.createElement("div")));
  }

  function colParse(acc, char) {
	acc.appendChild(char.elt);
	return acc;
  }
}
};

//Character constructor object.
function Char(va) {
	let elt = document.createElement("span");
	elt.innerHTML = va;
	elt.style.color = "#fff";
	elt.dataset.posX = arguments[2].x;
	elt.dataset.posY = arguments[2].y;

	let selectThisElementHandler = selectElementHandler.bind(elt);
	let typeThisHandler = typeHandler.bind(elt);

	elt.addEventListener("mousedown", selectThisElementHandler);

	this.value = va;
	this.change = Boolean(arguments[1]) || false;
	this.pos = arguments[2] || { x: 0, y: 0 };
	this.submittable = arguments[3] || false;
	this.elt = elt;
}

function selectElementHandler(e) {
	if (curelt == null) curelt = this;
	curelt.style.background = "#000";
	curelt.style.color = "#fff";
	curelt = this;
	this.style.color = "#000";
	this.style.background = "#fff";
}

var specialChars = {
	" ": "&nbsp",
	ArrowRight: "ArrowRight",
	ArrowLeft: "ArrowLeft",
	ArrowDown: "ArrowDown",
	ArrowUp: "ArrowUp",
	Delete: "Delete",
	Backspace: "Backspace",
	Enter: "Enter",
	Tab: "Tab",
	F1: "F1",
	F2: "F2",
	F3: "F3",
	"-":"-"
};

function typeHandler(e) {
	var eltx = curelt.dataset.posX;
	var elty = curelt.dataset.posY;
	if (e.key in specialChars) {
	  handleSpecialCases(e.key);
	}

	if (
	  curgrid[elty][Number(eltx) + 1] &&
	  curgrid[elty][eltx].change &&
	  curgrid[elty][Number(eltx) + 1].change &&
	  e.key.length == 1 &&
	  e.key != " "
	) {
	  curelt.innerHTML = e.key.toUpperCase();
	  selectElementHandler.call(curgrid[elty][Number(eltx) + 1].elt);
	} else if (
	  curgrid[elty][Number(eltx) + 1] &&
	  curgrid[elty][eltx].change &&
	  e.key.length == 1 &&
	  e.key != " "
	) {
	  curelt.innerHTML = e.key.toUpperCase();
	  selectElementHandler.call(curgrid[elty][Number(eltx)].elt);
	}

	if (e.key != "F5") e.preventDefault();
}

function submitHandler(submitted) {
	submitted = submitted.toLowerCase();
	let isTran = submitted in trans;

	if (isTran) {
	  let kmsi = grid.make(trans[submitted.toLowerCase()]);
	  curtran = submitted;
	  grid.draw(kmsi);
	  curelt = curgrid[0][0].elt;
	  handleSpecialCases("Tab");
	}
}

function handleSpecialCases(key) {
	var eltx = curelt.dataset.posX;
	var elty = curelt.dataset.posY;
	switch (key) {
	  case "ArrowUp":
		if (curgrid[Number(elty) - 1][Number(eltx)].elt)
		  selectElementHandler.call(
			curgrid[Number(elty) - 1][Number(eltx)].elt
		  );
		break;
	  case "ArrowDown":
		if (curgrid[Number(elty) + 1][Number(eltx)].elt)
		  selectElementHandler.call(
			curgrid[Number(elty) + 1][Number(eltx)].elt
		  );
		break;
	  case "ArrowLeft":
		if (curgrid[Number(elty)][Number(eltx) - 1].elt)
		  selectElementHandler.call(
			curgrid[Number(elty)][Number(eltx) - 1].elt
		  );
		break;
	  case "ArrowRight":
		if (curgrid[Number(elty)][Number(eltx) + 1].elt)
		  selectElementHandler.call(
			curgrid[Number(elty)][Number(eltx) + 1].elt
		  );
		break;
	  case "Enter":
		if (curgrid[Number(elty)][Number(eltx)].submittable) {
		  let submitted = "";
		  let compare = true;
		  let iterator = 0;
		  let rightEnd = 0;
		  let leftEnd = 0;

		  //get left end position
		  while (compare) {
			if (!curgrid[Number(elty)][Number(eltx) - iterator].submittable) {
			  compare = !compare;
			  leftEnd = Number(eltx) - iterator + 1;
			} else {
			  iterator++;
			}
		  }

		  //gather string
		  compare = true;
		  iterator = 0;
		  while (compare) {
			if (curgrid[Number(elty)][leftEnd + iterator].submittable) {
			  submitted +=
				curgrid[Number(elty)][leftEnd + iterator].elt.innerHTML;
			  iterator++;
			} else {
			  compare = !compare;
			}
		  }

		  submitHandler(submitted);
		}
		break;
	  case "Backspace":
		if (
		  curgrid[elty][Number(eltx) - 1] &&
		  curgrid[elty][eltx].change &&
		  curgrid[elty][Number(eltx) - 1].change
		) {
		  curelt.innerHTML = "_";
		  selectElementHandler.call(curgrid[elty][Number(eltx) - 1].elt);
		  curelt.innerHTML = "_";
		}
		break;
	  case "Delete":
		if (curgrid[elty][eltx].change) curelt.innerHTML = "_";
		break;
	  case " ":
		if (
		  curgrid[elty][Number(eltx) + 1] &&
		  curgrid[elty][eltx].change &&
		  curgrid[elty][Number(eltx) + 1].change
		) {
		  curelt.innerHTML = "_";
		  selectElementHandler.call(curgrid[elty][Number(eltx) + 1].elt);
		}
		break;
	  case "Tab":
		let broke = false;
		//loop through current grid from current selection
		if (!curelt) {
		  selectElementHandler.call(curgrid[0][0].elt);
		}

		for (let i = 1; i < 24; i++) {
		  if (broke) break;
		  for (let j = 0; j < 80; j++) {
			if (curgrid[(Number(elty) + i) % 24][j % 80].submittable) {
			  broke = true;
			  selectElementHandler.call(
				curgrid[(Number(elty) + i) % 24][j % 80].elt
			  );
			  break;
			}
		  }
		}

		break;
	  case "-":
		for(let i = 0; i<80;i++){
		  if(
			curgrid[Number(elty)][Number(eltx)+i] &&
			curgrid[Number(elty)][Number(eltx)+i].change ||
			curgrid[Number(elty)][Number(eltx)+i].submittable
		  ){
			curgrid[Number(elty)][Number(eltx)+i].elt.innerHTML = "_";
		  }
		}
		break;
	  default:
	}
}

function init() {
	var eltgrid = grid.make(frontscreen);
	grid.draw(eltgrid);
	curelt = curgrid[0][0].elt;
	handleSpecialCases("Tab");
}

init();