const mainform = document.querySelector("form");
const emailnotify = document.querySelector(".email-form p");
const form = document.querySelector("form");

mainform.addEventListener("submit",e=>{
	e.preventDefault();
	let name = form[0].value || "";
	let email = form[1].value || "";
	let message = form[2].value || "";
	let params = "person="+name+"&email="+email+"&message="+message;
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(){
		if(xhr.readyState=4){
			if(xhr.status==200){
				emailnotify.innerText = "Message sent!";
			}else if(xhr.status==500){
				emailnotify.innerText = "Please enter a message";
			}
		}
	}
	xhr.open("POST","/message",true);
	xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	xhr.send(params);
	clearForm();
});

function clearForm(){
	Array.prototype.forEach.call(form,elt=>{
		if(elt.type === "submit") return;
		elt.value = "";
	});
}
