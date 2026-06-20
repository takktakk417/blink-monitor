export function updateUI(
    infoDiv,
    stateDiv,
    data
){

    infoDiv.innerText =
`EAR : ${data.ear.toFixed(2)}

Base EAR : ${data.baselineEAR.toFixed(2)}

Total Blinks : ${data.total}

Average BPM : ${data.avg.toFixed(1)}

Last 1 min : ${data.recent}

Elapsed : ${data.elapsed.toFixed(1)} sec`;

    stateDiv.innerText =
        data.stateText;

    stateDiv.className =
        data.stateClass;
}