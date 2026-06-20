let chart = null;

export function drawChart(records){

    console.log(
    "drawChart",
    records.length
);

    const ctx =
        document.getElementById("blinkChart");

    if(chart){

        chart.destroy();
    }

    chart = new Chart(ctx,{
        type:"line",

        data:{
            labels:
                records.map(
                    (_,i)=>`S${i+1}`
                ),

            datasets:[{
                label:"Average BPM",

                data:
                    records.map(
                        r=>r.avgBPM
                    )
            }]
        },

        options:{

        responsive:false
    }


    });
}