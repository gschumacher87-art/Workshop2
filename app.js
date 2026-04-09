const DB={
get:k=>JSON.parse(localStorage.getItem(k))||[],
set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))
};

const S={
jobs:DB.get("jobs"),
customers:DB.get("customers"),
repairs:DB.get("repairs"),
parts:DB.get("parts"),
techs:DB.get("technicians"),
invoices:DB.get("invoices")
};

function save(){
DB.set("jobs",S.jobs);
DB.set("customers",S.customers);
DB.set("repairs",S.repairs);
DB.set("parts",S.parts);
DB.set("technicians",S.techs);
DB.set("invoices",S.invoices);
render();
}

/* NAV */
document.querySelectorAll(".sidebar li").forEach(t=>{
t.onclick=()=>{
document.querySelectorAll(".sidebar li").forEach(x=>x.classList.remove("active"));
t.classList.add("active");
document.querySelectorAll(".section").forEach(s=>s.classList.add("hidden"));
document.getElementById(t.dataset.tab).classList.remove("hidden");
render();
};
});

/* DASH */
function dash(){
document.getElementById("dashboard").innerHTML=`
Jobs ${S.jobs.length}<br>
Customers ${S.customers.length}<br>
Revenue $${S.invoices.reduce((a,b)=>a+b.total,0)}
`;
}

/* CALENDAR */
let m=new Date().getMonth(),y=new Date().getFullYear();

document.getElementById("prevMonth").onclick=()=>{m--;if(m<0){m=11;y--;}renderCal();}
document.getElementById("nextMonth").onclick=()=>{m++;if(m>11){m=0;y++;}renderCal();}

function renderCal(){
let tb=document.querySelector("#calendarTable tbody");
tb.innerHTML="";
document.getElementById("monthYear").textContent=`${m+1}/${y}`;
let days=new Date(y,m+1,0).getDate();
for(let i=1;i<=days;i++){
let tr=document.createElement("tr");
let td=document.createElement("td");
td.textContent=i;
td.onclick=()=>day(i);
tr.appendChild(td);
tb.appendChild(tr);
}
}

function day(d){
let wrap=document.getElementById("dayView");
wrap.innerHTML=`<button id="newJob">New Job</button><div id="list"></div>`;
document.getElementById("newJob").onclick=()=>jobModal(d);
let list=document.getElementById("list");
list.innerHTML="";
S.jobs.filter(j=>j.date===key(d)).forEach(j=>{
let div=document.createElement("div");
div.textContent=j.customerName+" "+j.vehicle;
list.appendChild(div);
});
}

function key(d){return `${y}-${m}-${d}`}

/* JOB CREATE */
function jobModal(d){
let modal=document.getElementById("modal");
modal.classList.remove("hidden");

modal.innerHTML=`<div class="modal-content">
<select id="c"></select>
<select id="v"></select>
<select id="r"></select>
<button id="save">Save</button>
</div>`;

let c=document.getElementById("c");
S.customers.forEach((cu,i)=>{
let o=document.createElement("option");
o.value=i;o.textContent=cu.firstName+" "+cu.surname;
c.appendChild(o);
});

c.onchange=()=>{
let cu=S.customers[c.value];
let v=document.getElementById("v");
v.innerHTML="";
cu.vehicles?.forEach((ve,i)=>{
let o=document.createElement("option");
o.value=i;o.textContent=ve.make+" "+ve.model;
v.appendChild(o);
});
};
c.dispatchEvent(new Event("change"));

let r=document.getElementById("r");
S.repairs.forEach(x=>{
let o=document.createElement("option");
o.textContent=x.name;
r.appendChild(o);
});

document.getElementById("save").onclick=()=>{
let cu=S.customers[c.value];
let ve=cu.vehicles[document.getElementById("v").value];

S.jobs.push({
id:Date.now(),
date:key(d),
customerId:c.value,
customerName:cu.firstName+" "+cu.surname,
vehicle:ve.make+" "+ve.model,
repair:r.value,
status:"unassigned",
sessions:[]
});

modal.classList.add("hidden");
save();
};
}

/* CUSTOMERS */
document.getElementById("addCustomerBtn").onclick=()=>{
let f=prompt("First");
let s=prompt("Surname");
if(!f)return;
S.customers.push({firstName:f,surname:s,vehicles:[]});
save();
};

function cust(){
let el=document.getElementById("customersList");
el.innerHTML="";
S.customers.forEach(c=>{
let d=document.createElement("div");
d.textContent=c.firstName+" "+c.surname;
el.appendChild(d);
});
}

/* JOBS */
function jobs(){
let un=document.getElementById("jobsUnassigned");
let ac=document.getElementById("jobsActive");
let tech=document.getElementById("availableTechs");

un.innerHTML="";ac.innerHTML="";tech.innerHTML="";

S.techs.forEach(t=>{
let d=document.createElement("div");
d.textContent=t.name;
tech.appendChild(d);
});

S.jobs.forEach(j=>{
let d=document.createElement("div");
d.textContent=j.customerName+" "+j.vehicle;

if(j.status==="unassigned"){
d.onclick=()=>{
tech.querySelectorAll("div").forEach(t=>{
t.onclick=()=>{
j.technician=t.textContent;
j.status="active";
save();
};
});
};
un.appendChild(d);
}else{
let start=document.createElement("button");
start.textContent="On";
start.onclick=()=>{
j.sessions.push({start:new Date().toISOString(),end:null});
save();
};

let stop=document.createElement("button");
stop.textContent="Off";
stop.onclick=()=>{
let s=j.sessions[j.sessions.length-1];
if(s&&!s.end)s.end=new Date().toISOString();
save();
};

let fin=document.createElement("button");
fin.textContent="Finish";
fin.onclick=()=>{
j.status="finished";
save();
};

d.appendChild(start);
d.appendChild(stop);
d.appendChild(fin);
ac.appendChild(d);
}
});
}

/* INVOICES */
function inv(){
let fin=document.getElementById("jobsFinished");
let list=document.getElementById("invoicesList");

fin.innerHTML="";list.innerHTML="";

S.jobs.filter(j=>j.status==="finished").forEach(j=>{
let d=document.createElement("div");
d.textContent=j.customerName;
d.onclick=()=>{
let total=parseFloat(prompt("Total"));
if(!total)return;
S.invoices.push({jobId:j.id,total});
j.status="invoiced";
save();
};
fin.appendChild(d);
});

S.invoices.forEach(i=>{
let d=document.createElement("div");
d.textContent="$"+i.total;
list.appendChild(d);
});
}

/* REPAIRS */
document.getElementById("addRepairBtn").onclick=()=>{
let n=prompt("Repair");
if(!n)return;
S.repairs.push({name:n,checklist:[]});
save();
};

function rep(){
let el=document.getElementById("repairsList");
el.innerHTML="";
S.repairs.forEach(r=>{
let li=document.createElement("li");
li.textContent=r.name;
el.appendChild(li);
});
}

/* PARTS */
document.getElementById("addPartBtn").onclick=()=>{
let n=prompt("Part");
let p=prompt("Price");
if(!n||!p)return;
S.parts.push({partNumber:n,price:parseFloat(p)});
save();
};

function parts(){
let el=document.getElementById("partsList");
el.innerHTML="";
S.parts.forEach(p=>{
let li=document.createElement("li");
li.textContent=p.partNumber+" "+p.price;
el.appendChild(li);
});
}

/* TECHS */
document.getElementById("addTechnicianBtn").onclick=()=>{
let n=prompt("Name");
if(!n)return;
S.techs.push({name:n});
save();
};

function techs(){
let el=document.getElementById("techniciansList");
el.innerHTML="";
S.techs.forEach(t=>{
let li=document.createElement("li");
li.textContent=t.name;
el.appendChild(li);
});
}

/* MASTER */
function render(){
dash();
renderCal();
cust();
jobs();
inv();
rep();
parts();
techs();
}

render();
