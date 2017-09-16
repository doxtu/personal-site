(function(){
	var chartypes = {
		_: "_",
		"*": "_",
		"x": "_"
	};

	//state variables
	var curgrid = [];
	var curelt = null;
	var curtran = "tubs";
	var errorConsole = document.querySelector("#message");
	var readonly = false;

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
		// console.log("x",curelt.dataset.posX, "y", curelt.dataset.posY);
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
		let subtran = curtran;
		
		if (isTran) {
		  let kmsi = grid.make(trans[submitted.toLowerCase()]);
		  curtran = submitted;
		  grid.draw(kmsi);
		  curelt = curgrid[0][0].elt;
		  handleSpecialCases("Tab");
		  errorConsole.innerHTML = "IN LOVING MEMORY OF LCIS :&#40";
		  if(curtran === "type") loadTypes();
		  return;
		}
		
		let input = scanner(curgrid);
		
		switch(subtran){
			case "logo":
				{
					let user = input[0];
					let pass = input[1];
					let params = "user=" + user + "&pass=" + pass;
					let xhr = new XMLHttpRequest();
					xhr.onreadystatechange = function(){
						if(xhr.readyState == 4){
							if(xhr.status ==200){
								if(user.toLowerCase() == "rdol") readonly = true;
								else readonly = false;
								submitHandler("tubs");
							}else{
								errorConsole.innerHTML = "CREDENTIALS INVALID";
							}
						}
					}
					xhr.open("POST","/lcis/login",true);
					xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
					xhr.send(params);
				}
				break;
			case "tubs":
				break;
			case "pmsi":
				{
					//start pmsi block, getting current payments for submitted month
					let month = input[0];
					let url = "/lcis/payments?month=" + month;
					let xhr = new XMLHttpRequest();
					xhr.onreadystatechange = function handler(){
						if(xhr.readyState == 4){
							if(xhr.status == 200){
								let rows = JSON.parse(xhr.responseText);
								let due = 0;
								//print type at x:4,y:4
								//print amount at x:23,y:4
								//amount due at x:56, y:2
								rows.forEach(function printrows(row,i){
									let type = row.type;
									let amount = accounting.formatMoney(row.amount);
									due += row.amount;
									clearTo(4,4+i,21,4+i);
									clearTo(23,4+i,40,4+i);
									printAmount(4,4+i,type);
									printAmount(23,4+i,amount);
								});
								due = accounting.formatMoney(due/2);
								clearTo(56,2,79,2);
								printAmount(56,2,due);
							}else if(xhr.status == 400){
								errorConsole.innerHTML = "BAD REQUEST";
							}else{
								
							}
						}
					}
					xhr.open("GET",url,true);
					xhr.send(null);
					//end pmsi block
				}
				break;
			case "kmbl":
				{
					//start kmbl: choose a set of options from the parameters BADU
					let badu = input[0];
					let type = input[1];
					let amount = input[2];
					let month = input[3];
					let url = "/lcis/payments";
					let params = "type=" + type + "&amount=" + amount + "&month=" + month;
					
					if(readonly) {
						errorConsole.innerHTML = "READ ONLY, CANNOT UPDATE";
						return;
					}
					
					if(badu == 'B'){
						 
					}else if(badu == 'A' && type && amount && month){
						let xhr = new XMLHttpRequest();
						xhr.onreadystatechange = function handler(){
							if(xhr.readyState == 4){
								if(xhr.status == 200){
									errorConsole.innerHTML = "RECORD UPDATED";	
								}else if(xhr.status == 400){
									errorConsole.innerHTML = "RECORD ALREADY EXISTS";
								}else{
									errorConsole.innerHTML = "ERROR INCURRED";
								}					
							}
						}
						xhr.open("POST",url,true);
						xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
						xhr.send(params);
					}else if(badu == 'D'){
						let xhr = new XMLHttpRequest();
						let url = "/lcis/payments";
						xhr.onreadystatechange = function handler(){
							if(xhr.readyState == 4){
								if(xhr.status==200)
									errorConsole.innerHTML = "RECORD DELETED! :)";
								else if(xhr.status==400)
									errorConsole.innerHTML = "RECORD DOES NOT EXIST";
								else
									errorConsole.innerHTML = "SERVER ERROR";
							}
						}
						xhr.open("DELETE",url,true);
						xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
						xhr.send(params);
					}else if(badu == 'U'){
						let xhr = new XMLHttpRequest();
						let url = "/lcis/payments";
						xhr.onreadystatechange = function handler(){
							if(xhr.readyState == 4){
								if(xhr.status==200)
									errorConsole.innerHTML = "RECORD UPDATED! :)";
								else if(xhr.status==400)
									errorConsole.innerHTML = "RECORD DOES NOT EXIST";
								else
									errorConsole.innerHTML = "SERVER ERROR";
							}
						}
						xhr.open("PUT",url,true);
						xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
						xhr.send(params);
					}
					//end kmbl
				}
				break;
			case "ddcl":
				{
					//inputs
					let invoice = Number(input[0]);
					let termpay = Number(input[1]);
					let startd = parsed(input[2]);
					let paid = Number(input[3]);
					
					if(!(invoice && termpay && startd && paid)) errorConsole.innerHTML = "NOT ALL INPUTS ENTERED";
					
					let due = dueDate(invoice,termpay,startd,paid).toLocaleDateString();
					let balance = accounting.formatMoney(invoice - paid);
					
					//print due at x=27,y=7
					//print balance at x=27,y=8
					clearTo(27,7,80,9);
					printAmount(27,7,due);
					printAmount(27,8,balance);
				}
				break;
			default:
				console.log("No matching case");
		}
		
		function printAmount(x,y,arr){
			for(var i in new String(arr))
				curgrid[y][x+Number(i)].elt.innerHTML = new String(arr)[i];
		}
		
		function clearTo(xstart,ystart,xend,yend){
			for(let i = ystart; i <yend; i++){
				for(let j=xstart; j<xend; j++){
					curgrid[i][j].elt.innerHTML = "&nbsp";
				}
			}
		}
		
		function parsed(str){
			let mo = Number(str[0] + str[1]) - 1;
			let day = Number(str[2] + str[3]);
			let yr = Number(str[4] + str[5] + str[6] + str[7]);
			
			return new Date(yr, mo, day);
		}
		
		function dueDate(totalInvoice,termPayment,startDate,totalPaid){
			function addMonths(dateObj, num) {
				var currentMonth = dateObj.getMonth() + dateObj.getFullYear() * 12;
				dateObj.setMonth(dateObj.getMonth() + num);
				var diff = dateObj.getMonth() + dateObj.getFullYear() * 12 - currentMonth;
				
				// If don't get the right number, set date to 
				// last day of previous month
				if (diff != num) {
					dateObj.setDate(0);
				} 
				return dateObj;
			}	

			var monthsToPayTotal = totalInvoice/termPayment;
			var monthsToAddFromStart = Math.round(totalPaid/termPayment);
			
			var nextDue = addMonths(startDate,monthsToAddFromStart);
			return nextDue;
		}
		
		function scanner(grid){
			let ret = [];
			
			for(let i = 0; i<24;i++){
				let recording = false;
				let sub = "";
				for(let j=0; j<80;j++){
					if(grid[i][j].submittable){
						recording = true;
					}else{
						recording = false;
					}
					if(recording && grid[i][j].elt.innerHTML != "_")
						sub += grid[i][j].elt.innerHTML;
				}
				if(sub != "")
					ret.push(sub);
			}
			
			return ret;
		}

		function loadTypes(){
			let url = "/lcis/types";
			let xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function handle(){
				if(xhr.readyState == 4){
					if(xhr.status == 200){
						let rows = JSON.parse(xhr.responseText);
						rows.forEach(function printrows(row,i){
							let code = row.code;
							let str = row.string;
							clearTo(4,4+i,21,4+i);
							clearTo(23,4+i,40,4+i);
							printAmount(4,4+i,code);
							printAmount(23,4+i,str);	
						});
					} else if(xhr.status == 400){
						errorConsole.innerHTML = "QUERY FAILED";
					}
				}
			}
			xhr.open("GET",url,true);
			xhr.send(null);
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
			  let compare = true;
			  let iterator = 0;
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
			  let submitted = "";
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
			  curelt.innerHTML = " ";
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
		var eltgrid = grid.make(logo);
		curtran = "logo";
		grid.draw(eltgrid);
		curelt = curgrid[0][0].elt;
		handleSpecialCases("Tab");
	}

	init();
})();
