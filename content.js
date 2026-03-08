let isRecording = false
let mediaRecorder = null
let recordedChunks = []
let recordings = []

let freelook = false

document.addEventListener("keydown", e=>{
if(e.code==="AltRight"){
freelook=true
}
})

document.addEventListener("keyup", e=>{
if(e.code==="AltRight"){
freelook=false
}
})

function getCanvas(){
const canvases=[...document.querySelectorAll("canvas")]
if(!canvases.length) return null
return canvases.reduce((a,b)=>a.width*a.height>b.width*b.height?a:b)
}

function startRecording(btn){

const canvas=getCanvas()

if(!canvas){
alert("Join a game first")
return
}

const stream=canvas.captureStream(60)

mediaRecorder=new MediaRecorder(stream)

recordedChunks=[]

mediaRecorder.ondataavailable=e=>{
if(e.data.size>0) recordedChunks.push(e.data)
}

mediaRecorder.onstop=()=>{

const blob=new Blob(recordedChunks,{type:"video/webm"})

recordings.push({
id:Date.now(),
blob:blob,
date:new Date()
})

alert("Replay saved!")
}

mediaRecorder.start()

isRecording=true

btn.textContent="⏺ Recording"
btn.style.background="red"
}

function stopRecording(btn){

if(mediaRecorder) mediaRecorder.stop()

isRecording=false

btn.textContent="Replay Mod"
btn.style.background=""
}

function downloadRecording(blob,id){

const url=URL.createObjectURL(blob)

const a=document.createElement("a")

a.href=url
a.download="replay-"+id+".webm"

a.click()

setTimeout(()=>URL.revokeObjectURL(url),2000)
}

function openReplayMenu(){

const overlay=document.createElement("div")

overlay.style=`
position:fixed;
top:0;
left:0;
width:100%;
height:100%;
background:rgba(0,0,0,0.9);
z-index:999999;
display:flex;
flex-direction:column;
align-items:center;
justify-content:center;
`

const title=document.createElement("h1")
title.textContent="Replay Recordings"
title.style="color:white;font-family:sans-serif"

overlay.appendChild(title)

const list=document.createElement("div")
list.style="width:400px;max-height:300px;overflow:auto"

recordings.forEach(r=>{

const item=document.createElement("div")

item.style=`
padding:10px;
background:#333;
margin:5px;
color:white;
cursor:pointer;
`

item.textContent="Replay "+r.id

item.onclick=()=>playReplay(r.blob)

list.appendChild(item)

})

overlay.appendChild(list)

const close=document.createElement("button")
close.textContent="Close"
close.onclick=()=>overlay.remove()

overlay.appendChild(close)

document.body.appendChild(overlay)

}

function playReplay(blob){

const url=URL.createObjectURL(blob)

const overlay=document.createElement("div")

overlay.style=`
position:fixed;
top:0;
left:0;
width:100%;
height:100%;
background:black;
z-index:999999;
display:flex;
align-items:center;
justify-content:center;
`

const video=document.createElement("video")

video.src=url
video.controls=true
video.autoplay=true

video.style="width:80%"

overlay.appendChild(video)

const close=document.createElement("button")

close.textContent="X"
close.style="position:absolute;top:20px;right:20px"

close.onclick=()=>{
video.pause()
overlay.remove()
}

overlay.appendChild(close)

document.body.appendChild(overlay)

}

function addButtons(){

const menu=document.body

if(document.getElementById("replayBtn")) return

const recordBtn=document.createElement("button")

recordBtn.id="replayBtn"

recordBtn.textContent="Replay Mod"

recordBtn.style=`
position:fixed;
bottom:20px;
left:20px;
z-index:99999;
padding:10px;
`

recordBtn.onclick=()=>{
if(isRecording) stopRecording(recordBtn)
else startRecording(recordBtn)
}

document.body.appendChild(recordBtn)

const viewBtn=document.createElement("button")

viewBtn.textContent="Replays"

viewBtn.style=`
position:fixed;
bottom:60px;
left:20px;
z-index:99999;
padding:10px;
`

viewBtn.onclick=openReplayMenu

document.body.appendChild(viewBtn)

}

setInterval(addButtons,2000)
