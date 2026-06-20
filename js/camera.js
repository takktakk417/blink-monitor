export async function setupCamera(video){

    console.log(
        navigator.mediaDevices
    );

    if(!navigator.mediaDevices){

        alert("mediaDevices unavailable");
        return;
    }

    const stream =
        await navigator.mediaDevices.getUserMedia({
            video:{
                facingMode:"user"
            }
        });

    video.srcObject = stream;

    return new Promise(resolve=>{

        video.onloadedmetadata = ()=>{
            resolve(video);
        };

    });
}