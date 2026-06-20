import { setupCamera } from "./camera.js";
import { createFaceLandmarker } from "./face.js";

alert("app.js loaded");

import {
calcEAR,
LEFT_EYE
} from "./blink.js";

import {
updateUI
} from "./ui.js";

import {
    saveRecord,
    loadRecords,
    clearRecords
}
from "./storage.js";

import { drawChart }
from "./chart.js";

const video =
document.getElementById("video");

const info =
document.getElementById("info");

const stateDiv =
document.getElementById("state");

const pauseBtn =
document.getElementById("pauseBtn");

const resetBtn =
document.getElementById("resetBtn");

console.log("start");

const clearBtn =
document.getElementById("clearBtn");

await setupCamera(video);

const faceLandmarker =
await createFaceLandmarker();

console.log("loaded");

const records =
    loadRecords();

const latest =
    records.length > 0
        ? records[records.length - 1]
        : null;

const historyDiv =
    document.getElementById("history");
// =====================
// 設定
// =====================
const BASELINE_BPM = 15;

const MARGIN = 3;

const EAR_HISTORY_SIZE = 30;

const BLINK_RATIO = 0.65;



// =====================
// 状態変数
// =====================

let blinkCount = 0;

let blinkFlag = false;

let blinkTimes = [];

let paused = false;

let startTimestamp = Date.now();

let pauseStart = 0;

let totalPausedTime = 0;

let earHistory = [];

let historyText = "";

if(latest){

    historyText =
`
Last Session

Blinks : ${latest.totalBlinks}

Minutes : ${latest.sessionMinutes}
`;
}

// =====================
// ボタン処理
// =====================

pauseBtn.onclick = ()=>{


paused = !paused;

if(paused){

    pauseStart = Date.now();

    pauseBtn.innerText = "Resume";

}else{

    totalPausedTime +=
        Date.now() - pauseStart;

    pauseBtn.innerText = "Pause";
}


};

resetBtn.onclick = ()=>{

const sessionMinutes =
    Math.round(
        (
            Date.now()
            - startTimestamp
            - totalPausedTime
        ) / 60000
    );

const avgBPM =
    sessionMinutes > 0
        ? blinkCount / sessionMinutes
        : 0;

saveRecord({

    date:
        new Date().toLocaleString(),

    totalBlinks:
        blinkCount,

    sessionMinutes,

    avgBPM:
        Number(avgBPM.toFixed(1))
});

refreshHistory();

blinkCount = 0;

blinkTimes = [];

startTimestamp = Date.now();

totalPausedTime = 0;

pauseStart = 0;

paused = false;

pauseBtn.innerText = "Pause";
};

clearBtn.onclick = ()=>{

    if(
        confirm(
            "履歴を全削除しますか？"
        )
    ){

        clearRecords();

        refreshHistory();
    }
};

// =====================
// メイン処理
// =====================

function refreshHistory(){

    console.log("refreshHistory");

    const records = loadRecords();

    if(records.length === 0){

        historyDiv.innerText =
            "No history";

        return;
    }

    const recent =
        records.slice(-5).reverse();

    historyDiv.innerText =
        recent.map(record =>

`${record.date}

Blinks : ${record.totalBlinks}

Minutes : ${record.sessionMinutes}

BPM : ${record.avgBPM}

------------------`

        ).join("\n");

        drawChart(records);

    console.log(
    "history updated",
    records.length);
}

async function predict(){


if(paused){

    requestAnimationFrame(predict);
    return;
}

const results =
    faceLandmarker.detectForVideo(
        video,
        performance.now()
    );

const currentTime = Date.now();

const elapsedSec =
(
    currentTime
    - startTimestamp
    - totalPausedTime
) / 1000;

if(results.faceLandmarks.length > 0){

    const landmarks =
        results.faceLandmarks[0];

    const eyePoints =
        LEFT_EYE.map(
            i => landmarks[i]
        );

    const ear =
        calcEAR(eyePoints);
    
    earHistory.push(ear);

    if(earHistory.length > EAR_HISTORY_SIZE){

        earHistory.shift();
    }

    const baselineEAR =
        earHistory.reduce(
            (sum,v)=>sum+v,
            0
        ) / earHistory.length;

    if(
        earHistory.length >= EAR_HISTORY_SIZE
        &&
        ear < baselineEAR * BLINK_RATIO
    ){

        if(!blinkFlag){

            blinkCount++;

            blinkFlag = true;

            blinkTimes.push(currentTime);
        }

    }else{

        blinkFlag = false;
    }

    blinkTimes =
        blinkTimes.filter(
            t => currentTime - t <= 60000
        );

    const recentBlinks =
        blinkTimes.length;

    const measuredAvg =
        (blinkCount / elapsedSec) * 60;

    let avgBPM;

    if(elapsedSec < 120){

        avgBPM =
            (BASELINE_BPM + measuredAvg) / 2;

    }else{

        avgBPM = measuredAvg;
    }

    let stateText;
    let stateClass;

    if(recentBlinks > avgBPM + MARGIN){

        stateText = "Stress?";
        stateClass = "stress";

    }else if(
        recentBlinks < avgBPM - MARGIN
    ){

        stateText =
            "Hyperfocus / Fatigue?";

        stateClass =
            "fatigue";

    }else{

        stateText = "Normal";
        stateClass = "normal";
    }

    updateUI(
    info,
    stateDiv,
    {
        ear,
        baselineEAR,
        total: blinkCount,
        avg: avgBPM,
        recent: recentBlinks,
        elapsed: elapsedSec,
        stateText,
        stateClass
    }
    );
}

requestAnimationFrame(predict);


}

refreshHistory();
predict();
