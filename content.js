let recording = false
let replayFrames = []
let replayPlaying = false
let replayIndex = 0

let spectator = {
    pos:{x:0,y:0,z:0},
    yaw:0,
    pitch:0,
    speed:0.6
}

function recordFrame(){

    if(!recording) return
    if(!window.game || !game.player) return

    replayFrames.push({
        time: Date.now(),
        x: game.player.pos.x,
        y: game.player.pos.y,
        z: game.player.pos.z,
        yaw: controls.yaw,
        pitch: controls.pitch
    })

}

setInterval(recordFrame,50)

function startRecording(){

    replayFrames=[]
    recording=true
    alert("Replay recording started")

}

function stopRecording(){

    recording=false

    const replayData={
        version:1,
        frames:replayFrames
    }

    const blob=new Blob([JSON.stringify(replayData)],{type:"application/json"})
    const url=URL.createObjectURL(blob)

    const a=document.createElement("a")
    a.href=url
    a.download="miniblox-replay.json"
    a.click()

    URL.revokeObjectURL(url)

}

function loadReplay(file){

    const reader=new FileReader()

    reader.onload=e=>{

        const data=JSON.parse(e.target.result)

        replayFrames=data.frames
        startReplay()

    }

    reader.readAsText(file)

}

function startReplay(){

    replayPlaying=true
    replayIndex=0

    if(!window.controls) return

    controls.setFreeCamMode(true)

    spectator.pos.x=replayFrames[0].x
    spectator.pos.y=replayFrames[0].y
    spectator.pos.z=replayFrames[0].z

}

function updateReplay(){

    if(!replayPlaying) return
    if(replayIndex>=replayFrames.length){
        replayPlaying=false
        return
    }

    const frame=replayFrames[replayIndex]

    controls.camera.position.set(
        spectator.pos.x,
        spectator.pos.y,
        spectator.pos.z
    )

    replayIndex++

}

setInterval(updateReplay,50)

document.addEventListener("keydown",e=>{

    if(!replayPlaying) return

    const forward={x:Math.sin(spectator.yaw),z:Math.cos(spectator.yaw)}

    if(e.code==="KeyW"){
        spectator.pos.x+=forward.x*spectator.speed
        spectator.pos.z+=forward.z*spectator.speed
    }

    if(e.code==="KeyS"){
        spectator.pos.x-=forward.x*spectator.speed
        spectator.pos.z-=forward.z*spectator.speed
    }

    if(e.code==="KeyA"){
        spectator.pos.x+=forward.z*spectator.speed
        spectator.pos.z-=forward.x*spectator.speed
    }

    if(e.code==="KeyD"){
        spectator.pos.x-=forward.z*spectator.speed
        spectator.pos.z+=forward.x*spectator.speed
    }

    if(e.code==="Space") spectator.pos.y+=spectator.speed
    if(e.code==="ShiftLeft") spectator.pos.y-=spectator.speed

})

function createLobbyMenu(){

    const menu=document.querySelector(".chakra-stack.css-1q5zbtn")

    if(!menu) return

    if(document.getElementById("replay-menu")) return

    const btn=document.createElement("button")
    btn.id="replay-menu"
    btn.textContent="Replay Mod"

    btn.style.padding="10px"
    btn.style.margin="5px"

    btn.onclick=()=>{

        const panel=document.createElement("div")

        panel.style.position="fixed"
        panel.style.top="50%"
        panel.style.left="50%"
        panel.style.transform="translate(-50%,-50%)"
        panel.style.background="black"
        panel.style.padding="20px"
        panel.style.zIndex="999999"

        const startBtn=document.createElement("button")
        startBtn.textContent="Start Recording"
        startBtn.onclick=startRecording

        const stopBtn=document.createElement("button")
        stopBtn.textContent="Stop & Download"
        stopBtn.onclick=stopRecording

        const upload=document.createElement("input")
        upload.type="file"
        upload.onchange=e=>loadReplay(e.target.files[0])

        panel.appendChild(startBtn)
        panel.appendChild(document.createElement("br"))
        panel.appendChild(stopBtn)
        panel.appendChild(document.createElement("br"))
        panel.appendChild(upload)

        document.body.appendChild(panel)

    }

    menu.appendChild(btn)

}

setInterval(createLobbyMenu,2000)
